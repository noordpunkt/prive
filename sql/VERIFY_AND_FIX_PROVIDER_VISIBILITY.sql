-- Verify and Fix Provider Visibility
-- This script checks if your provider will show up on the services page

-- 1. Check if the service category exists
SELECT 
  'Service Category Check:' as check_type,
  id,
  name,
  slug,
  active
FROM public.service_categories
WHERE slug = 'chef-prive';

-- 2. If category doesn't exist, create it:
INSERT INTO public.service_categories (name, description, icon, slug, active) VALUES
  ('Chef Privé', 'Private chef services for intimate dining experiences', 'chef-hat', 'chef-prive', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  active = EXCLUDED.active;

-- 3. Check your provider's current status and category link
SELECT 
  'Provider Status Check:' as check_type,
  sp.id,
  sp.business_name,
  sp.status,
  sp.available,
  sp.service_category_id,
  sc.id as category_id,
  sc.name as category_name,
  sc.slug as category_slug,
  sc.active as category_active,
  CASE 
    WHEN sp.status = 'approved' AND sp.available = true AND sc.slug = 'chef-prive' AND sc.active = true 
    THEN '✅ Will show on public page'
    WHEN sp.status != 'approved' 
    THEN '❌ Status is not approved - needs approval'
    WHEN sp.available != true 
    THEN '❌ Provider is not available'
    WHEN sc.slug != 'chef-prive' OR sc.id IS NULL 
    THEN '❌ Category mismatch or missing'
    WHEN sc.active != true 
    THEN '❌ Category is not active'
    ELSE '❌ Unknown issue'
  END as visibility_status
FROM public.service_providers sp
LEFT JOIN public.service_categories sc ON sp.service_category_id = sc.id
WHERE sp.business_name = 'Chef Privé couteau' OR sp.id = 'c826a4bd-f3ed-435d-9bce-e9553b01b844';

-- 4. Get the correct category ID for chef-prive
SELECT 
  'Correct Category ID:' as info,
  id as category_id,
  name,
  slug
FROM public.service_categories
WHERE slug = 'chef-prive';

-- 5. If provider is linked to wrong category, update it:
-- (Replace the category_id below with the correct one from step 4)
/*
UPDATE public.service_providers
SET service_category_id = (
  SELECT id FROM public.service_categories WHERE slug = 'chef-prive'
)
WHERE id = 'c826a4bd-f3ed-435d-9bce-e9553b01b844';
*/

-- 6. To approve the provider (run this after verifying category is correct):
/*
UPDATE public.service_providers
SET status = 'approved'
WHERE id = 'c826a4bd-f3ed-435d-9bce-e9553b01b844';
*/

