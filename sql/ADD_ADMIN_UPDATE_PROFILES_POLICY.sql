-- Add RLS policy to allow admins to update any profile
-- Run this in Supabase SQL Editor

-- First, check if we need to create a function to check admin status
-- (This avoids recursion issues with RLS policies)
-- This matches the admin check in the code: user ID 'c4d7378a-1bc5-4844-860d-d1f65e1f26ee' or email 'privealacarte@gmail.com'

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

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Add policy for admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (is_admin());

