import {
  AlertCircle,
  Loader2,
  LogIn,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DashboardStats } from '../../types/database';
import { Card } from '../ui/Card';

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
  error?: string | null;
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// Utility function to format numbers with commas
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Utility function to calculate percentage change (mock implementation)
const calculateTrend = (current: number, previous: number = 0): { value: number; isPositive: boolean } => {
  if (previous === 0) return { value: 0, isPositive: true };
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change),
    isPositive: change >= 0
  };
};

// Skeleton component for loading state
const StatCardSkeleton: React.FC = () => (
  <Card padding="md" className="animate-pulse">
    <div className="flex items-center">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="ml-4 flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </Card>
);

// Error state component
const StatCardError: React.FC<{ message: string }> = ({ message }) => (
  <Card padding="md" className="border-red-200 bg-red-50">
    <div className="flex items-center">
      <div className="p-3 rounded-lg bg-red-100">
        <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-red-600">Error</p>
        <p className="text-sm text-red-500">{message}</p>
      </div>
    </div>
  </Card>
);

export const StatsCards: React.FC<StatsCardsProps> = ({ 
  stats, 
  loading = false, 
  error = null 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Mock previous stats for trend calculation (in real app, this would come from props or state)
  const previousStats: DashboardStats = {
    totalAttempts: Math.max(0, stats.totalAttempts - Math.floor(Math.random() * 50)),
    uniqueUsers: Math.max(0, stats.uniqueUsers - Math.floor(Math.random() * 10)),
    loginAttempts: Math.max(0, stats.loginAttempts - Math.floor(Math.random() * 30)),
    signupAttempts: Math.max(0, stats.signupAttempts - Math.floor(Math.random() * 20)),
    todayAttempts: Math.max(0, stats.todayAttempts - Math.floor(Math.random() * 15))
  };

  const cards: StatCard[] = [
    {
      title: 'Total Attempts',
      value: stats.totalAttempts,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'All recorded attempts',
      trend: calculateTrend(stats.totalAttempts, previousStats.totalAttempts)
    },
    {
      title: 'Unique Users',
      value: stats.uniqueUsers,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Distinct user accounts',
      trend: calculateTrend(stats.uniqueUsers, previousStats.uniqueUsers)
    },
    {
      title: 'Login Attempts',
      value: stats.loginAttempts,
      icon: LogIn,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Authentication attempts',
      trend: calculateTrend(stats.loginAttempts, previousStats.loginAttempts)
    },
    {
      title: 'Signup Attempts',
      value: stats.signupAttempts,
      icon: UserPlus,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Registration attempts',
      trend: calculateTrend(stats.signupAttempts, previousStats.signupAttempts)
    },
    {
      title: 'Today\'s Attempts',
      value: stats.todayAttempts,
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Attempts in last 24h',
      trend: calculateTrend(stats.todayAttempts, previousStats.todayAttempts)
    }
  ];

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-5">
          <StatCardError message={error} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        const animationDelay = index * 100; // Stagger animations
        
        return (
          <div
            key={card.title}
            className={`
              transition-all duration-300 ease-in-out
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
            style={{ 
              animationDelay: `${animationDelay}ms`,
              transitionDelay: `${animationDelay}ms`
            }}
          >
            <Card 
              padding="md"
              className={`
                group relative overflow-hidden transition-all duration-300 ease-in-out
                hover:shadow-lg hover:scale-105 hover:-translate-y-1
                border-l-4 ${card.borderColor}
              `}
            >
            {/* Hover effect background */}
            <div className={`absolute inset-0 ${card.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="relative flex items-center">
              <div className={`
                p-3 rounded-xl ${card.bgColor} 
                group-hover:scale-110 transition-transform duration-300
                shadow-sm group-hover:shadow-md
              `}>
                <IconComponent className={`w-6 h-6 ${card.color} transition-colors duration-300`} />
              </div>
              
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600 truncate" title={card.description}>
                    {card.title}
                  </p>
                  {card.trend && card.trend.value > 0 && (
                    <div className={`
                      flex items-center text-xs font-medium px-2 py-1 rounded-full
                      ${card.trend.isPositive 
                        ? 'text-green-700 bg-green-100' 
                        : 'text-red-700 bg-red-100'
                      }
                    `}>
                      <TrendingUp className={`w-3 h-3 mr-1 ${
                        card.trend.isPositive ? 'rotate-0' : 'rotate-180'
                      }`} />
                      {card.trend.value.toFixed(1)}%
                    </div>
                  )}
                </div>
                
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                    {formatNumber(card.value)}
                  </p>
                  
                  {loading && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-1 truncate" title={card.description}>
                  {card.description}
                </p>
              </div>
            </div>
            
            {/* Subtle gradient overlay for depth */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-3xl pointer-events-none" />
            </Card>
          </div>
        );
      })}
    </div>
  );
};