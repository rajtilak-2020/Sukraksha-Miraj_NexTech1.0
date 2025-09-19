import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { VictimAttempt } from '../../types/database';

interface AttemptsOverTimeProps {
  attempts: VictimAttempt[];
}

export const AttemptsOverTime: React.FC<AttemptsOverTimeProps> = ({ attempts }) => {
  const processData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    return last7Days.map(dateStr => {
      const count = attempts.filter(attempt => 
        new Date(attempt.created_at).toDateString() === dateStr
      ).length;
      
      return {
        date: new Date(dateStr).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        attempts: count
      };
    });
  };

  const data = processData();

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Attempts Over Time (Last 7 Days)</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="attempts" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={{ fill: '#2563eb' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};