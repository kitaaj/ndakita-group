-- GiveHaven Storage Policies
-- Run this in your Supabase SQL Editor after creating the buckets

-- ============================================
-- IMAGES BUCKET POLICIES (Public bucket)
-- ============================================

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to images (since bucket is public)
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- ============================================
-- DOCUMENTS BUCKET POLICIES (Private bucket)
-- ============================================

-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow users to read their own documents
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'documents');

-- Allow users to delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- SIMPLIFIED VERSION (if above doesn't work)
-- Use this for development/testing
-- ============================================

-- Uncomment below if the policies above cause issues:

-- DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
-- DROP POLICY IF EXISTS "Public read access for images" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can read own documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;

-- Simple allow-all for authenticated users (development only):
-- CREATE POLICY "Allow all for authenticated" ON storage.objects
-- FOR ALL TO authenticated USING (true) WITH CHECK (true);
