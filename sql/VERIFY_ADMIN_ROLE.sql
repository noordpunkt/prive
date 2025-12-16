-- Verify and set admin role for the admin user
-- Run this in Supabase SQL Editor

-- Check current role
SELECT id, email, role, full_name
FROM public.profiles
WHERE id = 'c4d7378a-1bc5-4844-860d-d1f65e1f26ee'::uuid
   OR email = 'privealacarte@gmail.com';

-- Set role to admin if not already set
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'c4d7378a-1bc5-4844-860d-d1f65e1f26ee'::uuid
   OR email = 'privealacarte@gmail.com';

-- Verify the update
SELECT id, email, role, full_name
FROM public.profiles
WHERE id = 'c4d7378a-1bc5-4844-860d-d1f65e1f26ee'::uuid
   OR email = 'privealacarte@gmail.com';

