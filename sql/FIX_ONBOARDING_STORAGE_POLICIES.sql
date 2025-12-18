-- Fix RLS policies to allow users to upload their own images during onboarding
-- Run this in Supabase SQL Editor

-- ============================================
-- PROVIDER IMAGES BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own provider images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own provider images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own provider images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view provider images" ON storage.objects;

-- Allow authenticated users to upload their own provider images
-- Users can only upload to their own folder: {user_id}/...
CREATE POLICY "Users can upload own provider images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'provider-images' AND
  name LIKE (auth.uid()::text || '/%')
);

-- Allow authenticated users to update their own provider images
CREATE POLICY "Users can update own provider images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'provider-images' AND
  name LIKE (auth.uid()::text || '/%')
)
WITH CHECK (
  bucket_id = 'provider-images' AND
  name LIKE (auth.uid()::text || '/%')
);

-- Allow authenticated users to delete their own provider images
CREATE POLICY "Users can delete own provider images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'provider-images' AND
  name LIKE (auth.uid()::text || '/%')
);

-- Allow public read access to provider images
CREATE POLICY "Public can view provider images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'provider-images');

-- ============================================
-- AVATARS BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;

-- Allow authenticated users to upload their own avatar
-- Users can only upload to their own folder: {user_id}/...
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  name LIKE (auth.uid()::text || '/%')
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  name LIKE (auth.uid()::text || '/%')
)
WITH CHECK (
  bucket_id = 'avatars' AND
  name LIKE (auth.uid()::text || '/%')
);

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  name LIKE (auth.uid()::text || '/%')
);

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================
-- NOTE: Admin policies should still work
-- The admin policies (if they exist) will allow admins to manage all files
-- These user policies allow regular users to manage their own files
-- ============================================

