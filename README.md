# NexTech Honeypot - Security Research Application

A sophisticated honeypot web application designed for cybersecurity research and threat analysis. This application mimics a legitimate corporate website to capture and analyze unauthorized access attempts.

## ⚠️ Important Legal Notice

This application is designed for educational and authorized security research purposes only. Users must:
- Only deploy on systems they own or have explicit permission to test
- Comply with all applicable laws and regulations
- Use captured data responsibly and in accordance with privacy laws
- Not use this tool for malicious purposes

## 🛠️ Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Custom admin authentication
- **Icons**: Lucide React
- **Hosting**: Designed for Vercel deployment

## 🚀 Features

### Landing Page
- Professional NexTech Solutions corporate website
- Convincing company branding and content
- Services showcase and company information
- Only the "Login" button is functional (honeypot entry point)

### Honeypot Authentication
- Clean login/signup forms
- Admin bypass (username: `nextech_admin`, password: `SecureAdmin2024!`)
- Captures all non-admin authentication attempts
- Fake maintenance error for captured users

### Admin Dashboard
- Real-time analytics and monitoring
- Data visualization with multiple chart types
- Export functionality (CSV format)
- Responsive design for all devices

## 📊 Analytics Features

- **Statistics Overview**: Total attempts, unique users, login vs signup distribution
- **Time Series Analysis**: Attempts over time with interactive charts
- **User Behavior**: Most attempted usernames and emails
- **Real-time Monitoring**: Live updates as attempts are captured
- **Data Export**: CSV download of all captured data

## 🔧 Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Supabase account (free tier)

### 1. Clone and Install
```bash
git clone <repository-url>
cd nextech-honeypot
npm install
```

### 2. Supabase Setup
1. Create a new Supabase project
2. Run the migration SQL to create the database schema
3. Copy your project URL and anon key

### 3. Environment Configuration
Create a `.env` file:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Migration
Execute the SQL in `supabase/migrations/create_honeypot_schema.sql` in your Supabase SQL editor.

### 5. Run the Application
```bash
npm run dev
```

## 🔐 Security Considerations

### Admin Authentication
- Default credentials: `nextech_admin` / `SecureAdmin2024!`
- Change default credentials in production
- Consider implementing additional security measures

### Data Protection
- All captured data is stored securely in Supabase
- Implement data retention policies as needed
- Regular security audits recommended

### Legal Compliance
- Ensure compliance with local privacy laws
- Consider implementing data anonymization
- Maintain proper logging and audit trails

## 🎯 Usage

### For Security Researchers
1. Deploy the application on your test environment
2. Monitor the admin dashboard for captured attempts
3. Analyze attack patterns and common credentials
4. Export data for further analysis

### Understanding the Flow
1. **Legitimate users** see a professional corporate website
2. **Attackers** attempt to use the login form
3. **Credentials are captured** and stored in the database
4. **Attackers see** a maintenance error message
5. **Administrators** can view all attempts in real-time

## 📈 Data Analysis

The dashboard provides several analytical views:

- **Temporal Patterns**: When do most attacks occur?
- **Credential Analysis**: What usernames/passwords are commonly tried?
- **Attack Types**: Login vs signup attempt distribution
- **User Behavior**: Repeat attempts and patterns

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically from the main branch

### Environment Variables for Production
```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## 📊 Database Schema

### Victims Table
- Captures all honeypot authentication attempts
- Stores credentials, attempt type, and metadata
- Indexed for efficient querying

### Admins Table
- Stores admin authentication credentials
- Secured with Row Level Security (RLS)

## 🔍 Monitoring and Alerts

The application provides real-time monitoring through:
- WebSocket connections for live updates
- Statistics cards showing key metrics
- Charts updating automatically as new data arrives

## 🛡️ Ethical Use Guidelines

1. **Authorization**: Only use on systems you own or have permission to test
2. **Data Handling**: Treat captured data as sensitive information
3. **Responsible Disclosure**: Share findings responsibly with relevant parties
4. **Legal Compliance**: Ensure compliance with all applicable laws

## 🤝 Contributing

This project is designed for educational purposes. When contributing:
- Follow security best practices
- Document any changes thoroughly
- Consider the ethical implications of modifications

## 📝 License

This project is provided for educational and authorized security research purposes only. Users are responsible for ensuring compliance with all applicable laws and regulations.

## 🔗 Resources

- [Supabase Documentation](https://supabase.io/docs)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)

## ⚠️ Disclaimer

This tool is provided "as is" for educational purposes. The developers are not responsible for any misuse or legal issues arising from its use. Always ensure you have proper authorization before deploying honeypot systems.