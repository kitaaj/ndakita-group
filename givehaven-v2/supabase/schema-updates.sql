-- GiveHaven Database Update: Account Status & Documents Management
-- Run these SQL statements in your Supabase SQL Editor

-- ============================================
-- 1. ADD ACCOUNT STATUS FIELD TO HOMES TABLE
-- ============================================
-- This allows admins to set home accounts as active, suspended, or banned

ALTER TABLE homes ADD COLUMN IF NOT EXISTS account_status TEXT 
  CHECK (account_status IN ('active', 'suspended', 'banned')) 
  DEFAULT 'active';

-- Update all existing homes to have 'active' status
UPDATE homes SET account_status = 'active' WHERE account_status IS NULL;


-- ============================================
-- 2. ADD DOCUMENTS LOCK FIELD (Optional)
-- ============================================
-- This field controls whether home owners can upload new documents
-- When true, document uploads are disabled (read-only mode)

ALTER TABLE homes ADD COLUMN IF NOT EXISTS documents_locked BOOLEAN DEFAULT false;


-- ============================================
-- 3. MULTIPLE DOCUMENTS SUPPORT (Optional)
-- ============================================
-- This adds a JSONB field to store multiple document URLs
-- Format: [{ "name": "doc1.pdf", "url": "bucket:path", "uploaded_at": "2024-..." }, ...]

ALTER TABLE homes ADD COLUMN IF NOT EXISTS additional_documents JSONB DEFAULT '[]';


-- ============================================
-- VERIFICATION:
-- ============================================
-- Run this to verify the columns were added successfully:
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'homes' 
AND column_name IN ('account_status', 'documents_locked', 'additional_documents', 'cover_image_url');


-- ============================================
-- 4. COVER IMAGE FOR PROFILE
-- ============================================
-- This adds a cover image URL field for the Twitter-style profile banner

ALTER TABLE homes ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
