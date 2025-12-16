-- Fix: Ensure Chef Privé category exists and is linked correctly
-- Run this to fix the service category issue

-- 1. Insert/Update Chef Privé category
INSERT INTO public.service_categories (name, description, icon, slug, active) VALUES
  ('Chef Privé', 'Private chef services for intimate dining experiences', 'chef-hat', 'chef-prive', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  active = EXCLUDED.active;

-- 2. Verify the category exists
SELECT 
  'Category Check:' as check_type,
  id,
  name,
  slug,
  active
FROM public.service_categories
WHERE slug = 'chef-prive';

-- 3. Check if provider is linked to correct category
SELECT 
  'Provider-Category Link:' as check_type,
  sp.id as provider_id,
  sp.business_name,
  sp.service_category_id,
  sc.id as category_id,
  sc.name as category_name,
  sc.slug as category_slug,
  CASE 
    WHEN sp.service_category_id = sc.id THEN '✅ Linked correctly'
    ELSE '❌ Category mismatch'
  END as link_status
FROM public.service_providers sp
CROSS JOIN public.service_categories sc
WHERE sc.slug = 'chef-prive'
  AND sp.business_name = 'Test Chef Privé';

-- 4. If provider is linked to wrong category, update it
DO $$
DECLARE
  chef_category_id UUID;
  provider_record RECORD;
BEGIN
  -- Get Chef Privé category ID
  SELECT id INTO chef_category_id 
  FROM public.service_categories 
  WHERE slug = 'chef-prive' 
  LIMIT 1;

  IF chef_category_id IS NULL THEN
    RAISE EXCEPTION 'Chef Privé category not found';
  END IF;

  -- Find the provider
  SELECT sp.id, sp.service_category_id INTO provider_record
  FROM public.service_providers sp
  JOIN public.profiles p ON sp.profile_id = p.id
  WHERE p.email = 'andresbuzzio@gmail.com'
    AND sp.business_name = 'Test Chef Privé'
  LIMIT 1;

  IF provider_record.id IS NOT NULL THEN
    -- Update if category doesn't match
    IF provider_record.service_category_id != chef_category_id THEN
      UPDATE public.service_providers
      SET service_category_id = chef_category_id
      WHERE id = provider_record.id;
      
      RAISE NOTICE 'Updated provider category from % to %', 
        provider_record.service_category_id, 
        chef_category_id;
    ELSE
      RAISE NOTICE 'Provider is already linked to correct category';
    END IF;
  ELSE
    RAISE NOTICE 'Provider not found';
  END IF;
END $$;

-- 5. Final verification - this should return the provider
SELECT 
  'Final Check - Should see provider:' as check_type,
  sp.id,
  sp.business_name,
  sp.status,
  sp.available,
  sc.name as service_name,
  sc.slug as service_slug
FROM public.service_providers sp
JOIN public.service_categories sc ON sp.service_category_id = sc.id
WHERE sc.slug = 'chef-prive'
  AND sp.status = 'approved'
  AND sp.available = true;

