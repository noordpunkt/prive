-- Set Andres as admin user
UPDATE public.profiles
SET role = 'admin'
WHERE id = '6773717e-764d-4cfe-a2ab-40d0b2e161c1';

-- Verify the update
SELECT id, email, full_name, role
FROM public.profiles
WHERE id = '6773717e-764d-4cfe-a2ab-40d0b2e161c1';

