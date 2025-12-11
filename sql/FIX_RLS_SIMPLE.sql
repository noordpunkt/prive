-- Simple fix for infinite recursion in profiles RLS policy
-- Run this in Supabase SQL Editor

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a simpler admin policy that checks auth metadata first
-- This avoids recursion by checking the user's role from auth context
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    -- Check if current user's profile has admin role
    -- This is safe because we're checking the current user's own profile
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'admin'
    )
  );

-- Actually, the simplest fix is to just allow admins to see all profiles
-- by checking their own profile role (which doesn't cause recursion)
-- Let's use a different approach - check the role from the current user's profile
-- but do it in a way that doesn't cause recursion

-- Better solution: Use SECURITY DEFINER function
CREATE OR REPLACE FUNCTION check_is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Drop and recreate policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (check_is_admin(auth.uid()));

