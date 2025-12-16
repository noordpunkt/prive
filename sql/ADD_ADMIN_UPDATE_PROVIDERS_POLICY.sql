-- Add RLS policy to allow admins to update any service provider
-- Run this in Supabase SQL Editor

-- Ensure the is_admin() function exists (from SETUP_ROLE_BASED_ADMIN.sql)
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

-- Drop existing admin update policy if it exists
DROP POLICY IF EXISTS "Admins can update any provider" ON public.service_providers;

-- Add policy for admins to update any service provider
CREATE POLICY "Admins can update any provider"
  ON public.service_providers FOR UPDATE
  USING (is_admin());

-- Verify the policy was created
SELECT 
  'Admin update policy on service_providers' as check_type,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'service_providers' 
  AND policyname = 'Admins can update any provider';

