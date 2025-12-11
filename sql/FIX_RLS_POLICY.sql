-- Fix infinite recursion in profiles RLS policy
-- Run this in Supabase SQL Editor

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a better admin policy that doesn't cause recursion
-- This uses a function to check admin role without querying profiles table
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    -- Check if user is admin by looking at auth.users metadata or using a function
    -- For now, we'll use a simpler approach that checks the profile directly
    -- but only if it's not causing recursion
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Actually, let's use a better approach - check auth metadata or use a function
-- Drop and recreate with a safer check
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Use a function-based approach to avoid recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create the policy using the function
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (is_admin());

