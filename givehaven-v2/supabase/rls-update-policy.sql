-- GiveHaven RLS Update Policy Fix
-- Run this in Supabase SQL Editor to allow super admins to update homes

-- ============================================
-- ADD UPDATE POLICY FOR SUPER ADMINS ON HOMES
-- ============================================

-- Create/update super admin update policy for homes
DROP POLICY IF EXISTS "Super admins full access to homes" ON homes;
DROP POLICY IF EXISTS "Super admins can update homes" ON homes;

-- Allow super admins to update any home
CREATE POLICY "Super admins can update homes"
  ON homes FOR UPDATE
  USING (is_super_admin() = TRUE)
  WITH CHECK (is_super_admin() = TRUE);

-- Also add insert policy for activity_logs
DROP POLICY IF EXISTS "Super admins can insert activity logs" ON activity_logs;

CREATE POLICY "Super admins can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (is_super_admin() = TRUE);

-- ============================================
-- DONE!
-- ============================================
-- Super admins can now:
-- ✓ Update any home's verification status
-- ✓ Insert activity log entries
