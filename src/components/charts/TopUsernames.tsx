import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { VictimAttempt } from '../../types/database';

interface TopUsernamesProps {
  attempts: VictimAttempt[];
}

export const TopUsernames: React.FC<TopUsernamesProps> = ({ attempts }) => {
  const processData = () => {
    const usernameCounts: Record<string, number> = {};
    
    attempts.forEach(attempt => {
      const identifier = attempt.username || attempt.email || 'Unknown';
      usernameCounts[identifier] = (usernameCounts[identifier] || 0) + 1;
    });
    
    return Object.entries(usernameCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([username, count]) => ({
        username: username.length > 15 ? `${username.substring(0, 15)}...` : username,
        attempts: count
      }));
  };

  const data = processData();

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Attempted Usernames</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="username" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="attempts" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};