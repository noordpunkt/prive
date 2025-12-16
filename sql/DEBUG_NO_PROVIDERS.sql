-- Debug Script: Why are providers not showing?
-- Run this to check what's in your database

-- 1. Check if service categories exist
SELECT 'Service Categories:' as check_type;
SELECT id, name, slug, active 
FROM public.service_categories 
ORDER BY name;

-- 2. Check if Chef Privé category exists
SELECT 'Chef Privé Category:' as check_type;
SELECT id, name, slug, active 
FROM public.service_categories 
WHERE slug = 'chef-prive';

-- 3. Check all providers (regardless of status)
SELECT 'All Providers:' as check_type;
SELECT 
  sp.id,
  p.email,
  p.full_name,
  sc.name as service_name,
  sc.slug as service_slug,
  sp.business_name,
  sp.status,
  sp.available,
  sp.verified,
  sp.hourly_rate
FROM public.service_providers sp
JOIN public.profiles p ON sp.profile_id = p.id
JOIN public.service_categories sc ON sp.service_category_id = sc.id
ORDER BY sc.name;

-- 4. Check providers that SHOULD be visible (approved + available)
SELECT 'Visible Providers (approved + available):' as check_type;
SELECT 
  sp.id,
  p.email,
  p.full_name,
  sc.name as service_name,
  sc.slug as service_slug,
  sp.business_name,
  sp.status,
  sp.available,
  sp.verified
FROM public.service_providers sp
JOIN public.profiles p ON sp.profile_id = p.id
JOIN public.service_categories sc ON sp.service_category_id = sc.id
WHERE sp.status = 'approved' 
  AND sp.available = true
  AND sc.active = true
ORDER BY sc.name;

-- 5. Check providers for Chef Privé specifically
SELECT 'Chef Privé Providers:' as check_type;
SELECT 
  sp.id,
  p.email,
  p.full_name,
  sp.business_name,
  sp.status,
  sp.available,
  sp.verified,
  sp.hourly_rate,
  sp.rating
FROM public.service_providers sp
JOIN public.profiles p ON sp.profile_id = p.id
JOIN public.service_categories sc ON sp.service_category_id = sc.id
WHERE sc.slug = 'chef-prive';

-- 6. Count providers by status
SELECT 'Provider Count by Status:' as check_type;
SELECT 
  status,
  available,
  COUNT(*) as count
FROM public.service_providers
GROUP BY status, available
ORDER BY status, available;

-- 7. Check if you have any users
SELECT 'Users in auth.users:' as check_type;
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 8. Check if profiles exist for users
SELECT 'Profiles:' as check_type;
SELECT id, email, full_name, role 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

