# app.py
import os
import io
import csv
import zipfile
import json
import datetime
import joblib
from faker import Faker
from flask import Flask, request, jsonify, send_file, abort
from flask_sqlalchemy import SQLAlchemy
import numpy as np

# -----------------------
# Config / Setup
# -----------------------
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DECOY_DIR = os.path.join(BASE_DIR, 'decoys')
EXPORTS_DIR = os.path.join(BASE_DIR, 'exports')
MODEL_FILE = os.path.join(BASE_DIR, 'if_model.joblib')

os.makedirs(DECOY_DIR, exist_ok=True)
os.makedirs(EXPORTS_DIR, exist_ok=True)

fake = Faker()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'logs.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# -----------------------
# DB Models
# -----------------------
class Log(db.Model):
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
    s_up = s.upper()
    return any(sig in s_up for sig in SQL_SIGS)

def count_special_chars(s: str):
    if not s: return 0
    return sum(1 for c in s if c in "\"'`;-=()")

def get_reqs_per_min(ip: str):
    # count logs from this IP in last 60 seconds
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(seconds=60)
    return Log.query.filter(Log.ip == ip, Log.timestamp >= cutoff).count()

def features_from_request(req, ip):
    ua = req.headers.get('User-Agent','')
    if req.is_json:
        payload = json.dumps(req.get_json())
    else:
        payload = req.get_data(as_text=True) or ''
    payload_len = len(payload)
    reqs_per_min = get_reqs_per_min(ip)
    ua_flag = 1 if any(k in ua.lower() for k in ('curl','sqlmap','nmap','bot','scanner')) else 0
    sql_flag = 1 if has_sql_signature(payload) else 0
    special_chars = count_special_chars(payload)
    return {
        'payload_len': payload_len,
        'reqs_per_min': reqs_per_min,
        'ua_flag': ua_flag,
        'sql_flag': sql_flag,
        'special_chars': special_chars
    }

# -----------------------
# Model (train if missing)
# -----------------------
from sklearn.ensemble import IsolationForest

def train_model(path=MODEL_FILE):
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
    return clf

if os.path.exists(MODEL_FILE):
    try:
        model = joblib.load(MODEL_FILE)
    except Exception:
        model = train_model()
else:
    model = train_model()

def is_anomaly_from_features(feat):
    if model is None:
        return False
    X = np.array([[feat['payload_len'], feat['reqs_per_min'], feat['ua_flag'], feat['sql_flag'], feat['special_chars']]])
    pred = model.predict(X)  # -1 anomaly, 1 normal
    return True if pred[0] == -1 else False

# -----------------------
# Decoy generation
# -----------------------
def gen_employees_csv(n=200):
    fn = os.path.join(DECOY_DIR, 'decoy_employees.csv')
    with open(fn, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['id','name','email','dept','role','phone','join_date','salary','password'])
