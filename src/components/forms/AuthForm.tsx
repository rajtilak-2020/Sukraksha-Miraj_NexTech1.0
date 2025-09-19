import { Eye, EyeOff, Shield } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

import { VictimAttempt } from '../../types/database';

interface AuthFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

interface AuthFormProps {
  onSubmit: (data: Omit<VictimAttempt, 'id' | 'created_at'>) => void;
  loading?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSubmit, loading = false }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (isSignup && !formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (isSignup && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (isSignup && !formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Prepare data according to VictimAttempt type
      onSubmit({
        username: formData.username,
        email: isSignup ? formData.email : null,
        password: formData.password,
        full_name: isSignup ? formData.fullName : null,
        attempt_type: isSignup ? 'signup' : 'login',
        ip_address: null, // This will be captured server-side
        user_agent: window.navigator.userAgent
      });
      
      // Reset form after submission
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
      });
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">NexTech Portal</h2>
          <p className="text-gray-600 mt-2">
            {isSignup ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            value={formData.username}
            onChange={(value) => updateFormData('username', value)}
            placeholder="Enter your username"
            required
            error={errors.username}
          />

          {isSignup && (
            <>
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(value) => updateFormData('email', value)}
                placeholder="Enter your email"
                required
                error={errors.email}
              />
              
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(value) => updateFormData('fullName', value)}
                placeholder="Enter your full name"
                required
                error={errors.fullName}
              />
            </>
          )}

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(value) => updateFormData('password', value)}
              placeholder="Enter your password"
              required
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {isSignup && (
            <div className="relative">
              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(value) => updateFormData('confirmPassword', value)}
                placeholder="Confirm your password"
                required
                error={errors.confirmPassword}
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};