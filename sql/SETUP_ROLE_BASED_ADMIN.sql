-- Complete setup for role-based admin system
-- Run this in Supabase SQL Editor
-- This replaces all hardcoded user ID/email checks with role-based checks

-- Step 1: Create/Update is_admin() function to check role only
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

-- Step 2: Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can upload any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any avatar" ON storage.objects;

-- Step 3: Add/Update RLS policies for profiles table
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (is_admin());

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (is_admin());

-- Step 4: Add/Update RLS policies for storage (avatars bucket)
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

-- Step 5: Verify admin role for existing admin user (optional - update if needed)
-- Uncomment and modify the email if you want to set a specific user as admin:
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'privealacarte@gmail.com';

-- Step 6: Verify the setup
SELECT 
  'is_admin() function' as check_type,
  EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_admin'
  ) as exists;

SELECT 
  'Admin policies on profiles' as check_type,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND policyname LIKE '%admin%';

SELECT 
  'Admin policies on storage' as check_type,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%admin%';

