-- ============================================
-- DROP ALL NEEDS UPDATE POLICIES AND CREATE SIMPLE ONE
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop ALL existing update policies on needs
DROP POLICY IF EXISTS "Home owners can update own needs" ON needs;
DROP POLICY IF EXISTS "Home owners and donors can update needs" ON needs;
DROP POLICY IF EXISTS "Authenticated users can pledge on active needs" ON needs;
DROP POLICY IF EXISTS "Authenticated users can update need status for pledging" ON needs;
DROP POLICY IF EXISTS "Home owners can update their own needs" ON needs;

-- Create a SIMPLE permissive policy: any authenticated user can update any need
-- This is intentionally permissive - we can restrict later
CREATE POLICY "Authenticated users can update needs" ON needs
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Verify: List all policies on needs table
-- SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'needs';
