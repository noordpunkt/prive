-- Add RLS policies to allow admins to upload avatars for any user
-- Run this in Supabase SQL Editor

-- First, ensure the is_admin() function exists (from ADD_ADMIN_UPDATE_PROFILES_POLICY.sql)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is the specific admin user by ID or email
  RETURN (
    auth.uid() = 'c4d7378a-1bc5-4844-860d-d1f65e1f26ee'::uuid OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'privealacarte@gmail.com')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing admin storage policies if they exist
DROP POLICY IF EXISTS "Admins can upload any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any avatar" ON storage.objects;

-- Allow admins to insert (upload) avatars for any user
CREATE POLICY "Admins can upload any avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND is_admin()
);

-- Allow admins to update avatars for any user
CREATE POLICY "Admins can update any avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND is_admin()
)
WITH CHECK (
  bucket_id = 'avatars' AND is_admin()
);

-- Allow admins to delete avatars for any user
CREATE POLICY "Admins can delete any avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND is_admin()
);

