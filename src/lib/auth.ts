import bcrypt from 'bcryptjs';

import { supabase } from './supabase';

export const verifyAdminCredentials = async (username: string, password: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('admins')
    .select('password_hash')
    .eq('username', username)
    .single();
  
  if (error || !data) return false;
  return bcrypt.compareSync(password, data.password_hash);
};

export const getClientInfo = () => {
  return {
    user_agent: navigator.userAgent,
    ip_address: 'Client IP' // In production, this would be captured server-side
  };
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('nextech_admin') === 'authenticated';
};

export const setAuthenticated = () => {
  localStorage.setItem('nextech_admin', 'authenticated');
};

export const logout = () => {
  localStorage.removeItem('nextech_admin');
};