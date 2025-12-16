-- Verify why provider is not showing
-- Run this to check the exact data

-- 1. Check the provider details
SELECT 
  'Provider Details:' as check_type,
  sp.id as provider_id,
  sp.profile_id,
  sp.service_category_id,
  sp.business_name,
  sp.status,
  sp.available,
  sp.verified,
  p.email,
  p.full_name,
  sc.id as category_id,
  sc.name as category_name,
  sc.slug as category_slug,
  sc.active as category_active
FROM public.service_providers sp
JOIN public.profiles p ON sp.profile_id = p.id
JOIN public.service_categories sc ON sp.service_category_id = sc.id
WHERE p.email = 'andresbuzzio@gmail.com';

-- 2. Check what getProvidersByCategory would return
-- (This simulates the exact query used in the app)
SELECT 
  'Query Result (simulating app query):' as check_type,
  sp.*,
  json_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'avatar_url', p.avatar_url,
    'email', p.email
  ) as profiles
FROM public.service_providers sp
JOIN public.profiles p ON sp.profile_id = p.id
JOIN public.service_categories sc ON sp.service_category_id = sc.id
WHERE sc.slug = 'chef-prive'
  AND sp.available = true
  AND sc.active = true;

-- 3. Check RLS policy would allow this
-- (This checks if RLS would block the query)
SELECT 
  'RLS Check:' as check_type,
  sp.id,
  sp.status = 'approved' as status_check,
  sp.available = true as available_check,
  (sp.status = 'approved' AND sp.available = true) as rls_passes
FROM public.service_providers sp
JOIN public.service_categories sc ON sp.service_category_id = sc.id
WHERE sc.slug = 'chef-prive';

-- 4. Get the exact category ID for chef-prive
SELECT 
  'Chef Privé Category:' as check_type,
  id,
  name,
  slug,
  active
FROM public.service_categories
WHERE slug = 'chef-prive';

