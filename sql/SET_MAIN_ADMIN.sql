-- Set the main admin user
-- This user (privealacarte@gmail.com) is the ONLY admin
-- All other users will be redirected to homepage when trying to access admin pages

UPDATE public.profiles
SET role = 'admin'
WHERE id = 'c4d7378a-1bc5-4844-860d-d1f65e1f26ee'
  OR email = 'privealacarte@gmail.com';

-- Verify the admin user
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles
WHERE id = 'c4d7378a-1bc5-4844-860d-d1f65e1f26ee'
  OR email = 'privealacarte@gmail.com';

