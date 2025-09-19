export interface VictimAttempt {
  id: string;
  username: string | null;
  email: string | null;
  password: string | null;
  full_name: string | null;
  attempt_type: 'login' | 'signup';
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Admin {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface DashboardStats {
  totalAttempts: number;
  uniqueUsers: number;
  loginAttempts: number;
  signupAttempts: number;
  todayAttempts: number;
}