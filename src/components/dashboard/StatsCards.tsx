import React from 'react';
import { Card } from '../ui/Card';
import { Users, UserCheck, LogIn, UserPlus, TrendingUp } from 'lucide-react';
import { DashboardStats } from '../../types/database';

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Attempts',
      value: stats.totalAttempts,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Unique Users',
      value: stats.uniqueUsers,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Login Attempts',
      value: stats.loginAttempts,
      icon: LogIn,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Signup Attempts',
      value: stats.signupAttempts,
      icon: UserPlus,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Today\'s Attempts',
      value: stats.todayAttempts,
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <Card key={card.title} padding="md">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};