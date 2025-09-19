import React from 'react';
import { Button } from '../ui/Button';
import { Shield, LogOut, Download } from 'lucide-react';

interface DashboardHeaderProps {
  onLogout: () => void;
  onExport: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout, onExport }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NexTech Security Dashboard</h1>
              <p className="text-gray-600">Real-time honeypot monitoring and analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={onExport}
              variant="secondary"
              icon={Download}
            >
              Export Data
            </Button>
            <Button
              onClick={onLogout}
              variant="danger"
              icon={LogOut}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};