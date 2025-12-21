-- GiveHaven Verification Status Migration
-- Run this in Supabase SQL Editor to update verification status options

-- ============================================
-- UPDATE CONSTRAINT: Allow new verification statuses
-- ============================================

-- Remove old constraint
ALTER TABLE homes DROP CONSTRAINT IF EXISTS homes_verification_status_check;

-- Add new constraint with updated statuses
ALTER TABLE homes ADD CONSTRAINT homes_verification_status_check 
CHECK (verification_status IN ('received', 'reviewing', 'needs_documents', 'approved', 'rejected', 'pending', 'verified'));

-- ============================================
-- UPDATE EXISTING DATA: Migrate old statuses to new ones
-- ============================================

-- pending -> received
UPDATE homes SET verification_status = 'received' WHERE verification_status = 'pending';

-- verified -> approved  
UPDATE homes SET verification_status = 'approved' WHERE verification_status = 'verified';

-- ============================================
-- DONE!
-- ============================================
-- New verification workflow statuses:
-- ✓ received - Application received and queued
-- ✓ reviewing - Admin is reviewing the application
-- ✓ needs_documents - Additional documents required
-- ✓ approved - Home verified and approved
-- ✓ rejected - Application rejected
