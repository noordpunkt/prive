-- Setup Storage Bucket and RLS Policies for Provider Images
-- Run this in Supabase SQL Editor after creating the 'provider-images' bucket in Storage

-- Step 1: Ensure is_admin() function exists (from SETUP_ROLE_BASED_ADMIN.sql)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role in profiles table
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can upload provider images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update provider images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete provider images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view provider images" ON storage.objects;

-- Step 3: Allow admins to insert (upload) provider images
CREATE POLICY "Admins can upload provider images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'provider-images' AND is_admin()
);

-- Step 4: Allow admins to update provider images
CREATE POLICY "Admins can update provider images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'provider-images' AND is_admin()
)
WITH CHECK (
  bucket_id = 'provider-images' AND is_admin()
);

-- Step 5: Allow admins to delete provider images
CREATE POLICY "Admins can delete provider images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'provider-images' AND is_admin()
);

-- Step 6: Allow public read access to provider images
CREATE POLICY "Public can view provider images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'provider-images');

