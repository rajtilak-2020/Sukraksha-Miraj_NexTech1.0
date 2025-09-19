import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '../ui/Card';
import { VictimAttempt } from '../../types/database';

interface AttemptTypeDistributionProps {
  attempts: VictimAttempt[];
}

export const AttemptTypeDistribution: React.FC<AttemptTypeDistributionProps> = ({ attempts }) => {
  const data = [
    {
      name: 'Login Attempts',
      value: attempts.filter(a => a.attempt_type === 'login').length,
      color: '#3b82f6'
    },
    {
      name: 'Signup Attempts',
      value: attempts.filter(a => a.attempt_type === 'signup').length,
      color: '#10b981'
    }
  ];

  const COLORS = ['#3b82f6', '#10b981'];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Attempt Type Distribution</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};