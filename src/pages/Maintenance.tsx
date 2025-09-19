import React from 'react';
import { Shield, AlertTriangle, Clock } from 'lucide-react';

export const Maintenance: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Shield className="w-16 h-16 text-blue-600" />
            <AlertTriangle className="w-8 h-8 text-orange-500 absolute -top-1 -right-1" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          System Maintenance
        </h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          We're currently performing scheduled maintenance on our authentication systems. 
          Please try again in a few minutes.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>Expected completion: 2-3 minutes</span>
          </div>
        </div>
        
        <button
          onClick={() => window.history.back()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          Go Back
        </button>
        
        <p className="text-xs text-gray-500 mt-4">
          If this issue persists, please contact our support team at support@nextech-solutions.com
        </p>
      </div>
    </div>
  );
};