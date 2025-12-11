-- Final fix for infinite recursion in profiles RLS policy
-- Run this in Supabase SQL Editor

-- The issue is that the admin policy queries profiles table while checking profiles table
-- Solution: Use SECURITY DEFINER function to bypass RLS when checking admin status

-- Create a function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate with the function (function bypasses RLS so no recursion)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_user_admin());

