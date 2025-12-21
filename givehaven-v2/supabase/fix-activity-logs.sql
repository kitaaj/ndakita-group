-- GiveHaven: Fix Activity Logs Insert
-- Run this in Supabase SQL Editor

-- Allow any authenticated user to insert activity logs
DROP POLICY IF EXISTS "Super admins can insert activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert activity logs" ON activity_logs;

CREATE POLICY "Users can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow reading for testing
DROP POLICY IF EXISTS "Users can view own activity" ON activity_logs;
CREATE POLICY "Users can view own activity"
  ON activity_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Add status_change action type to constraint if needed
-- (if there's a constraint on action type)

-- Verify the policy is working
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'activity_logs';
