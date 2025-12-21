-- GiveHaven RLS Fix for Admin Dashboard
-- Run this in Supabase SQL Editor to allow super admins to read all data

-- ============================================
-- FIX: Allow super admins to read all data
-- Using security definer functions to avoid recursion
-- ============================================

-- Create a function to check if user is super admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() 
    AND is_super_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HOMES: Allow super admins to read all
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view verified homes" ON homes;
DROP POLICY IF EXISTS "Owners can view own home" ON homes;

-- Create new policy allowing super admins to see all
CREATE POLICY "Super admins can view all homes"
  ON homes FOR SELECT
  USING (is_super_admin() = TRUE);

-- Keep verified homes visible to everyone
CREATE POLICY "Anyone can view verified homes"
  ON homes FOR SELECT
  USING (verified = TRUE);

-- ============================================
-- NEEDS: Allow super admins to read all
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active needs" ON needs;
DROP POLICY IF EXISTS "Super admins full access to needs" ON needs;

CREATE POLICY "Super admins can view all needs"
  ON needs FOR SELECT
  USING (is_super_admin() = TRUE);

CREATE POLICY "Anyone can view active needs from verified homes"
  ON needs FOR SELECT
  USING (
    status = 'active' AND
    home_id IN (SELECT id FROM homes WHERE verified = TRUE)
  );

-- ============================================
-- ACTIVITY LOGS: Allow super admins to read all
-- ============================================

DROP POLICY IF EXISTS "Users can view own activity" ON activity_logs;
DROP POLICY IF EXISTS "Super admins can view all activity" ON activity_logs;

CREATE POLICY "Super admins can view all activity logs"
  ON activity_logs FOR SELECT
  USING (is_super_admin() = TRUE);

-- ============================================
-- CHAT ROOMS: Allow super admins to read all
-- ============================================

DROP POLICY IF EXISTS "Participants can view chat rooms" ON chat_rooms;

CREATE POLICY "Super admins can view all chat rooms"
  ON chat_rooms FOR SELECT
  USING (is_super_admin() = TRUE);

-- ============================================
-- DONE!
-- ============================================
-- Super admins can now:
-- ✓ View all homes (pending, verified, rejected)
-- ✓ View all needs (active, pending, completed)
-- ✓ View all activity logs
-- ✓ View all chat rooms/pledges
