-- GiveHaven Complete RLS Fix
-- Run this ENTIRE script in Supabase SQL Editor
-- This creates the super admin function AND all required policies

-- ============================================
-- STEP 1: Create the is_super_admin function (if not exists)
-- ============================================

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
-- STEP 2: HOMES - Read access for super admins
-- ============================================

DROP POLICY IF EXISTS "Super admins can view all homes" ON homes;
CREATE POLICY "Super admins can view all homes"
  ON homes FOR SELECT
  USING (is_super_admin() = TRUE);

-- ============================================
-- STEP 3: HOMES - Update access for super admins
-- ============================================

DROP POLICY IF EXISTS "Super admins can update homes" ON homes;
CREATE POLICY "Super admins can update homes"
  ON homes FOR UPDATE
  USING (is_super_admin() = TRUE)
  WITH CHECK (is_super_admin() = TRUE);

-- ============================================
-- STEP 4: NEEDS - Read access for super admins
-- ============================================

DROP POLICY IF EXISTS "Super admins can view all needs" ON needs;
CREATE POLICY "Super admins can view all needs"
  ON needs FOR SELECT
  USING (is_super_admin() = TRUE);

-- ============================================
-- STEP 5: ACTIVITY LOGS - Full access for super admins
-- ============================================

DROP POLICY IF EXISTS "Super admins can view all activity logs" ON activity_logs;
CREATE POLICY "Super admins can view all activity logs"
  ON activity_logs FOR SELECT
  USING (is_super_admin() = TRUE);

DROP POLICY IF EXISTS "Super admins can insert activity logs" ON activity_logs;
CREATE POLICY "Super admins can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (is_super_admin() = TRUE);

-- ============================================
-- VERIFICATION: Check if it worked
-- ============================================

-- This should return TRUE if you're logged in as a super admin
SELECT is_super_admin() as "You are super admin";

-- ============================================
-- DONE! 
-- After running this, try updating a home's status again.
-- ============================================
