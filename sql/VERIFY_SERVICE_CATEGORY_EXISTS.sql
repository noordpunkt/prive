-- Verify service category exists and is active
-- This is what the app is looking for

SELECT 
  'Service Category Check:' as check_type,
  id,
  name,
  slug,
  active,
  description
FROM public.service_categories
WHERE slug = 'chef-prive';

-- If the above returns nothing, run this to create it:
INSERT INTO public.service_categories (name, description, icon, slug, active) VALUES
  ('Chef Privé', 'Private chef services for intimate dining experiences', 'chef-hat', 'chef-prive', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  active = EXCLUDED.active;

-- Then verify again
SELECT 
  'After insert/update:' as check_type,
  id,
  name,
  slug,
  active
FROM public.service_categories
WHERE slug = 'chef-prive';

