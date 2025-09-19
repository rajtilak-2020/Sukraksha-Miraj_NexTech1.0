# app.py
import os
import io
import csv
import zipfile
import json
import datetime
import joblib
import logging
from faker import Faker
from flask import Flask, request, jsonify, send_file, abort
from flask_sqlalchemy import SQLAlchemy
import numpy as np
from sklearn.ensemble import IsolationForest

# -----------------------
# Basic logging
# -----------------------
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')

# -----------------------
# Config / Setup
# -----------------------
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DECOY_DIR = os.path.join(BASE_DIR, 'decoys')
EXPORTS_DIR = os.path.join(BASE_DIR, 'exports')
MODEL_FILE = os.path.join(BASE_DIR, 'if_model.joblib')
DB_FILE = os.path.join(BASE_DIR, 'logs.db')

os.makedirs(DECOY_DIR, exist_ok=True)
os.makedirs(EXPORTS_DIR, exist_ok=True)

fake = Faker()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + DB_FILE
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# -----------------------
# DB Models
# -----------------------
class Log(db.Model):
    __tablename__ = 'logs'
    id = db.Column(db.Integer, primary_key=True)
    ip = db.Column(db.String(64))
    ua = db.Column(db.Text)
    path = db.Column(db.String(256))
    method = db.Column(db.String(8))
    payload = db.Column(db.Text)
    num_params = db.Column(db.Integer, default=0)
    payload_len = db.Column(db.Integer, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    anomaly = db.Column(db.Boolean, default=False)
    profile = db.Column(db.Text, nullable=True)   # json text
    decoy_file = db.Column(db.String(512), nullable=True)

class Blocklist(db.Model):
    __tablename__ = 'blocklist'
    id = db.Column(db.Integer, primary_key=True)
    ip = db.Column(db.String(64), unique=True)
    reason = db.Column(db.String(256), default='manual')
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)

with app.app_context():
    db.create_all()

# -----------------------
# Utility functions
# -----------------------
SQL_SIGS = ["--", " OR ", "AND 1=1", "UNION SELECT", "SELECT *", "DROP TABLE", ";--", "1=1"]

def has_sql_signature(s: str):
    if not s:
        return False
    try:
        s_up = s.upper()
        return any(sig in s_up for sig in SQL_SIGS)
    except Exception:
        return False

def count_special_chars(s: str):
    if not s:
        return 0
    return sum(1 for c in s if c in "\"'`;-=()[]{}<>")

def get_reqs_per_min(ip: str):
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(seconds=60)
    try:
        return Log.query.filter(Log.ip == ip, Log.timestamp >= cutoff).count()
    except Exception:
        # if DB query fails for some reason, return 0 to avoid crashing
        return 0

def extract_payload_and_params(req):
    # Normalize payload extraction for form/json/raw
    payload = ''
    num_params = 0
    try:
        if req.is_json:
            j = req.get_json(silent=True)
            if j is not None:
                payload = json.dumps(j, ensure_ascii=False)
                num_params = len(j) if isinstance(j, dict) else 1
        else:
            # form data or raw body
            if req.form and len(req.form) > 0:
                # form-encoded
                payload = '&'.join(f"{k}={v}" for k, v in req.form.items())
                num_params = len(req.form)
            else:
                # raw body (could be query string or raw bytes)
                raw = req.get_data(as_text=True) or ''
                payload = raw
                # attempt to parse query-like params
                if raw and ('=' in raw or '&' in raw):
                    num_params = raw.count('&') + 1
    except Exception:
        payload = req.get_data(as_text=True) or ''
    return payload, num_params

def features_from_request(req, ip):
    ua = req.headers.get('User-Agent','')
    payload, num_params = extract_payload_and_params(req)
    payload_len = len(payload or '')
    reqs_per_min = get_reqs_per_min(ip)
    ua_flag = 1 if any(k in ua.lower() for k in ('curl','sqlmap','nmap','bot','scanner')) else 0
    sql_flag = 1 if has_sql_signature(payload) else 0
    special_chars = count_special_chars(payload)
    return {
        'payload_len': payload_len,
        'reqs_per_min': reqs_per_min,
        'ua_flag': ua_flag,
        'sql_flag': sql_flag,
        'special_chars': special_chars,
        'num_params': num_params
    }

# -----------------------
# Model (train if missing)
# -----------------------
def train_model(path=MODEL_FILE):
    logging.info("Training IsolationForest model (synthetic data) ...")
    rng = np.random.RandomState(42)
    n = 3000
    payload_len = rng.normal(loc=60, scale=40, size=n).clip(1, 300)
    reqs_per_min = rng.poisson(lam=1.5, size=n).clip(0, 100)
    ua_flag = rng.binomial(1, 0.02, size=n)
    sql_flag = rng.binomial(1, 0.002, size=n)
    special_chars = rng.poisson(lam=2, size=n).clip(0,50)
    X = np.vstack([payload_len, reqs_per_min, ua_flag, sql_flag, special_chars]).T
    clf = IsolationForest(n_estimators=200, contamination=0.02, random_state=42)
    clf.fit(X)
    joblib.dump(clf, path)
    logging.info("Model trained and saved to %s", path)
    return clf

# load or train
try:
    if os.path.exists(MODEL_FILE):
        model = joblib.load(MODEL_FILE)
        logging.info("Loaded model from %s", MODEL_FILE)
    else:
        model = train_model()
except Exception as e:
    logging.exception("Failed to load model, retraining: %s", e)
    model = train_model()

def is_anomaly_from_features(feat):
    if model is None:
        return False
    try:
        X = np.array([[feat['payload_len'], feat['reqs_per_min'], feat['ua_flag'], feat.get('sql_flag',0), feat['special_chars']]])
        pred = model.predict(X)  # -1 anomaly, 1 normal
        return True if pred[0] == -1 else False
    except Exception as e:
        logging.exception("Model prediction failed: %s", e)
        return False

# -----------------------
# Decoy generation (complete functions)
# -----------------------
def gen_employees_csv(n=200):
    fn = os.path.join(DECOY_DIR, 'decoy_employees.csv')
    try:
        with open(fn, 'w', newline='', encoding='utf-8') as f:
            w = csv.writer(f)
            w.writerow(['id','name','email','dept','role','phone','join_date','salary','password'])
            for i in range(1, n+1):
                w.writerow([
                    i,
                    fake.name(),
                    fake.company_email(),
                    fake.random_element(elements=('IT','Ops','HR','R&D')),
                    fake.job(),
                    fake.phone_number(),
                    fake.date_between(start_date='-5y', end_date='today').isoformat(),
                    fake.random_int(20000,250000),
                    fake.password(length=10)
                ])
        logging.info("Generated %s", fn)
    except Exception as e:
        logging.exception("Failed to generate employees CSV: %s", e)
    return fn

def gen_projects_csv(n=50):
    fn = os.path.join(DECOY_DIR, 'decoy_projects.csv')
    try:
        with open(fn, 'w', newline='', encoding='utf-8') as f:
            w = csv.writer(f)
            w.writerow(['id','title','description','owner_email','repo_url','secret_token'])
            for i in range(1, n+1):
                w.writerow([
                    i,
                    fake.bs().title(),
                    fake.sentence(nb_words=12),
                    fake.company_email(),
                    f"https://git.internal/{fake.user_name()}/{fake.word()}",
                    "HONEY_" + fake.lexify(text='????').upper()
                ])
        logging.info("Generated %s", fn)
    except Exception as e:
        logging.exception("Failed to generate projects CSV: %s", e)
    return fn

def gen_credentials_zip(n=50):
    csv_fn = os.path.join(DECOY_DIR, 'credentials.csv')
    try:
        with open(csv_fn, 'w', newline='', encoding='utf-8') as f:
            w = csv.writer(f)
            w.writerow(['service','username','password','notes'])
            for i in range(n):
                service = fake.domain_word() + ".internal"
                username = fake.user_name()
                password = fake.password(length=12)
                notes = "Backup token - HONEY_" + fake.lexify(text='???').upper()
                w.writerow([service, username, password, notes])
        zip_fn = os.path.join(DECOY_DIR, 'credentials_backup.zip')
        with zipfile.ZipFile(zip_fn, 'w', zipfile.ZIP_DEFLATED) as z:
            z.write(csv_fn, arcname='credentials.csv')
        logging.info("Generated %s", zip_fn)
        return zip_fn
    except Exception as e:
        logging.exception("Failed to generate credentials zip: %s", e)
        return None

# Ensure decoys exist at startup
if not os.path.exists(os.path.join(DECOY_DIR, 'decoy_employees.csv')):
    gen_employees_csv()
if not os.path.exists(os.path.join(DECOY_DIR, 'decoy_projects.csv')):
    gen_projects_csv()
if not os.path.exists(os.path.join(DECOY_DIR, 'credentials_backup.zip')):
    gen_credentials_zip()

# -----------------------
# Routes
# -----------------------
@app.route('/', methods=['GET'])
def root():
    """Root endpoint - provides API information and status"""
    return jsonify({
        'status': 'ok',
        'service': 'Suraksha Mirage Backend',
        'version': '1.0',
        'endpoints': {
            'api_info': '/',
            'tables': '/api/tables',
            'alerts': '/api/alerts',
            'login': '/api/login',
            'query': '/api/query',
            'block_ip': '/api/actions/block',
            'generate_decoys': '/api/decoy/generate',
            'export_report': '/api/export_report',
            'download': '/download/<filename>'
        },
        'timestamp': datetime.datetime.utcnow().isoformat()
    })

@app.route('/api/status', methods=['GET'])
def api_status():
    """Health check endpoint"""
    try:
        # Test database connection
        log_count = Log.query.count()
        blocked_count = Blocklist.query.count()
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'stats': {
                'total_logs': log_count,
                'blocked_ips': blocked_count
            },
            'timestamp': datetime.datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'error',
            'error': str(e),
            'timestamp': datetime.datetime.utcnow().isoformat()
        }), 500

@app.route('/api/tables', methods=['GET'])
def api_tables():
    base = request.url_root.rstrip('/')
    files = {
        'employees': {
            'count': 200,
            'download_url': f"{base}/download/decoy_employees.csv",
            'last_updated': datetime.datetime.utcnow().isoformat()
        },
        'projects': {
            'count': 50,
            'download_url': f"{base}/download/decoy_projects.csv",
            'last_updated': datetime.datetime.utcnow().isoformat()
        },
        'credentials': {
            'count': 50,
            'download_url': f"{base}/download/credentials_backup.zip",
            'last_updated': datetime.datetime.utcnow().isoformat()
        }
    }
    return jsonify(files)

@app.route('/download/<path:fn>', methods=['GET'])
def download_fn(fn):
    safe = os.path.basename(fn)
    path = os.path.join(DECOY_DIR, safe)
    if not os.path.exists(path):
        logging.warning("Download requested for missing file: %s", path)
        abort(404)
    return send_file(path, as_attachment=True)

@app.route('/api/alerts', methods=['GET'])
def api_alerts():
    limit = int(request.args.get('limit', 50))
    try:
        logs = Log.query.order_by(Log.id.desc()).limit(limit).all()
    except Exception as e:
        logging.exception("Failed to query logs: %s", e)
        return jsonify([]), 500
    out = []
    for l in logs:
        profile = None
        try:
            profile = json.loads(l.profile) if l.profile else None
        except Exception:
            profile = None
        out.append({
            'id': l.id,
            'ip': l.ip,
            'path': l.path,
            'method': l.method,
            'ua': l.ua,
            'payload': l.payload,
            'timestamp': l.timestamp.isoformat(),
            'anomaly': bool(l.anomaly),
            'profile': profile,
            'decoy_file': l.decoy_file
        })
    return jsonify(out)

@app.route('/api/login', methods=['POST'])
def api_login():
    ip = request.remote_addr or request.headers.get('X-Forwarded-For','127.0.0.1')
    if Blocklist.query.filter_by(ip=ip).first():
        return jsonify({'status':'blocked'}), 403
    feat = features_from_request(request, ip)
    anom = is_anomaly_from_features(feat)
    profile = None
    decoy = None
    if anom:
        profile = {'name': fake.name(), 'purpose': 'suspicious activity detected'}
        decoy_path = gen_credentials_zip()
        if decoy_path:
            decoy = request.url_root.rstrip('/') + '/download/' + os.path.basename(decoy_path)
    # Log safely
    try:
        payload, num_params = extract_payload_and_params(request)
        l = Log(
            ip=ip,
            ua=request.headers.get('User-Agent',''),
            path=request.path,
            method=request.method,
            payload=payload,
            num_params=num_params,
            payload_len=feat['payload_len'],
            anomaly=anom,
            profile=json.dumps(profile) if profile else None,
            decoy_file=decoy
        )
        db.session.add(l)
        db.session.commit()
    except Exception as e:
        logging.exception("Failed to write log: %s", e)
    # Always 401 to appear like a real login failure (honeypot)
    return jsonify({'status':'fail','message':'Invalid credentials'}), 401

@app.route('/api/query', methods=['POST'])
def api_query():
    ip = request.remote_addr or request.headers.get('X-Forwarded-For','127.0.0.1')
    if Blocklist.query.filter_by(ip=ip).first():
        return jsonify({'status':'blocked'}), 403
    # read q param (prefer JSON -> form -> raw)
    q = None
    try:
        if request.is_json:
            j = request.get_json(silent=True) or {}
            q = j.get('q') if isinstance(j, dict) else None
        if q is None:
            q = request.form.get('q') or (request.get_data(as_text=True) or None)
    except Exception:
        q = request.get_data(as_text=True) or None
    feat = features_from_request(request, ip)
    if has_sql_signature(q):
        feat['sql_flag'] = 1
    anom = is_anomaly_from_features(feat)
    profile = None
    decoy = None
    result = {'rows': []}
    if anom:
        profile = {'name': fake.name(), 'purpose': 'data exfiltration'}
        decoy_path = gen_credentials_zip()
        if decoy_path:
            decoy = request.url_root.rstrip('/') + '/download/' + os.path.basename(decoy_path)
        # provide a fake sample result for SELECT queries to keep attacker engaged
        if q and 'SELECT' in q.upper():
            result['rows'] = [{'id':1,'name':'John Doe','email':'john.doe@company.internal'}]
    else:
        result['rows'] = []
    # Log
    try:
        payload, num_params = extract_payload_and_params(request)
        l = Log(
            ip=ip,
            ua=request.headers.get('User-Agent',''),
            path=request.path,
            method=request.method,
            payload=str(q),
            num_params=num_params,
            payload_len=feat['payload_len'],
            anomaly=anom,
            profile=json.dumps(profile) if profile else None,
            decoy_file=decoy
        )
        db.session.add(l)
        db.session.commit()
    except Exception as e:
        logging.exception("Failed to write log: %s", e)
    out = {'status':'ok','result': result, 'anomaly': bool(anom), 'decoy': decoy}
    return jsonify(out)

@app.route('/api/actions/block', methods=['POST'])
def api_block():
    data = request.get_json(silent=True) or {}
    ip = data.get('ip')
    reason = data.get('reason','manual')
    if not ip:
        return jsonify({'status':'error','message':'ip required'}), 400
    try:
        if not Blocklist.query.filter_by(ip=ip).first():
            b = Blocklist(ip=ip, reason=reason)
            db.session.add(b)
            db.session.commit()
    except Exception as e:
        logging.exception("Failed to add blocklist entry: %s", e)
        return jsonify({'status':'error','message':'db error'}), 500
    return jsonify({'status':'ok','blocked': True})

@app.route('/api/decoy/generate', methods=['POST'])
def api_decoy_generate():
    emp = gen_employees_csv()
    proj = gen_projects_csv()
    cred = gen_credentials_zip()
    files = [os.path.basename(x) for x in (emp, proj, cred) if x]
    return jsonify({'status':'ok','files': files})

@app.route('/api/export_report', methods=['GET'])
def api_export_report():
    since = request.args.get('since')
    q = Log.query
    if since:
        try:
            dt = datetime.datetime.fromisoformat(since)
            q = q.filter(Log.timestamp >= dt)
        except Exception:
            logging.warning("Invalid since param: %s", since)
    try:
        logs = q.order_by(Log.id.desc()).all()
    except Exception as e:
        logging.exception("Failed to query logs for export: %s", e)
        return jsonify({'status':'error','message':'db error'}), 500
    csv_path = os.path.join(EXPORTS_DIR, f'report_{datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")}.csv')
    try:
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            w = csv.writer(f)
            w.writerow(['id','ip','timestamp','path','anomaly','decoy_file'])
            for l in logs:
                w.writerow([l.id, l.ip, l.timestamp.isoformat(), l.path, int(bool(l.anomaly)), l.decoy_file or ''])
    except Exception as e:
        logging.exception("Failed writing csv export: %s", e)

# -----------------------
# Error Handlers
# -----------------------
@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors with JSON response"""
    return jsonify({
        'status': 'error',
        'error': 'Not Found',
        'message': 'The requested resource was not found on this server.',
        'available_endpoints': [
            '/',
            '/api/status',
            '/api/tables',
            '/api/alerts',
            '/api/login',
            '/api/query',
            '/api/actions/block',
            '/api/decoy/generate',
            '/api/export_report',
            '/download/<filename>'
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors with JSON response"""
    db.session.rollback()
    return jsonify({
        'status': 'error',
        'error': 'Internal Server Error',
        'message': 'An internal server error occurred.'
    }), 500

@app.errorhandler(403)
def forbidden_error(error):
    """Handle 403 errors with JSON response"""
    return jsonify({
        'status': 'error',
        'error': 'Forbidden',
        'message': 'Access denied. Your IP may be blocked.'
    }), 403

# -----------------------
# Run
# -----------------------
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logging.info("Starting Suraksha Mirage backend on 0.0.0.0:%d", port)
    app.run(host='0.0.0.0', port=port, debug=False)
