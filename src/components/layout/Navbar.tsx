import React from 'react';
import { Shield } from 'lucide-react';

interface NavbarProps {
  onLoginClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const navItems = [
    { label: 'Home', href: '#', active: true },
    { label: 'About', href: '#' },
    { label: 'Services', href: '#' },
    { label: 'Contact', href: '#' }
  ];
  
  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">NexTech Solutions</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-base font-medium transition-colors ${
                  item.active 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={onLoginClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              Login
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={onLoginClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};