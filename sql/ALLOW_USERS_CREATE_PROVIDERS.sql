-- Allow users to create their own provider records during onboarding
-- Run this in Supabase SQL Editor

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can create their own provider profile" ON public.service_providers;

-- Allow authenticated users to insert provider records where profile_id matches their user ID
CREATE POLICY "Users can create their own provider profile"
  ON public.service_providers FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
  );

-- Verify the policy was created
SELECT 
  'User insert policy on service_providers' as check_type,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'service_providers' 
  AND policyname = 'Users can create their own provider profile';

