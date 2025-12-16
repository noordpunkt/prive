-- Simple Script to Create Test Providers
-- This version creates providers without requiring pre-existing auth users
-- It uses a simpler approach: just insert service categories and create placeholder providers
-- 
-- NOTE: For real providers, you'll need actual auth.users. This is for testing the UI.

-- ============================================
-- 1. Ensure Service Categories Exist
-- ============================================
INSERT INTO public.service_categories (name, description, icon, slug, active) VALUES
  ('Chef Privé', 'Private chef services for intimate dining experiences', 'chef-hat', 'chef-prive', true),
  ('Coiffeur Privé', 'Private hairdressing services at your location', 'scissors', 'coiffeur-prive', true),
  ('Stylist', 'Personal styling and fashion consultation', 'shirt', 'stylist', true),
  ('Interior Stylist', 'Interior design and home styling services', 'home', 'interior-stylist', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  active = EXCLUDED.active;

-- ============================================
-- 2. Create Providers (Requires Existing Users)
-- ============================================
-- To create providers, you need to:
-- 
-- OPTION A: Create users via Supabase Dashboard
-- 1. Go to Authentication > Users > Add User
-- 2. Create users with these emails:
--    - chef.provider@example.com
--    - coiffeur.provider@example.com
--    - stylist.provider@example.com
--    - interior.provider@example.com
-- 3. Note their user IDs
-- 4. Run the POPULATE_SERVICES_AND_PROVIDERS.sql script
--
-- OPTION B: Create users via your app
-- 1. Sign up 4 new accounts with the emails above
-- 2. Then run the provider insertion part of POPULATE_SERVICES_AND_PROVIDERS.sql
--
-- OPTION C: Use existing users
-- 1. Get user IDs from: SELECT id, email FROM auth.users;
-- 2. Update the UUIDs in POPULATE_SERVICES_AND_PROVIDERS.sql with real user IDs
-- 3. Run that script

-- ============================================
-- Quick Provider Insert (if you have user IDs)
-- ============================================
-- Replace USER_ID_1, USER_ID_2, etc. with actual UUIDs from auth.users

/*
DO $$
DECLARE
  chef_cat_id UUID;
  coiffeur_cat_id UUID;
  stylist_cat_id UUID;
  interior_cat_id UUID;
BEGIN
  SELECT id INTO chef_cat_id FROM public.service_categories WHERE slug = 'chef-prive';
  SELECT id INTO coiffeur_cat_id FROM public.service_categories WHERE slug = 'coiffeur-prive';
  SELECT id INTO stylist_cat_id FROM public.service_categories WHERE slug = 'stylist';
  SELECT id INTO interior_cat_id FROM public.service_categories WHERE slug = 'interior-stylist';

  -- Chef Privé Provider
  INSERT INTO public.service_providers (
    profile_id, service_category_id, business_name, bio,
    hourly_rate, min_duration_hours, max_duration_hours,
    rating, total_reviews, status, verified, available,
    service_area, languages_spoken
  ) VALUES (
    'USER_ID_1'::UUID, chef_cat_id, 'Chef Privé by Marie',
    'Experience fine dining in the comfort of your home. Specializing in French and Mediterranean cuisine.',
    120.00, 3.0, 8.0, 4.8, 24, 'approved', true, true,
    ARRAY['Nice', 'Cannes', 'Antibes'], ARRAY['French', 'English']
  )
  ON CONFLICT (profile_id, service_category_id) DO NOTHING;

  -- Coiffeur Privé Provider
  INSERT INTO public.service_providers (
    profile_id, service_category_id, business_name, bio,
    hourly_rate, min_duration_hours, max_duration_hours,
    rating, total_reviews, status, verified, available,
    service_area, languages_spoken
  ) VALUES (
    'USER_ID_2'::UUID, coiffeur_cat_id, 'Sophie Coiffure Privée',
    'Professional mobile hairdressing service. Specializing in cuts, color, and styling.',
    80.00, 1.5, 4.0, 4.9, 18, 'approved', true, true,
    ARRAY['Cannes', 'Nice'], ARRAY['French', 'English']
  )
  ON CONFLICT (profile_id, service_category_id) DO NOTHING;

  -- Stylist Provider
  INSERT INTO public.service_providers (
    profile_id, service_category_id, business_name, bio,
    hourly_rate, min_duration_hours, max_duration_hours,
    rating, total_reviews, status, verified, available,
    service_area, languages_spoken
  ) VALUES (
    'USER_ID_3'::UUID, stylist_cat_id, 'Style by Emma',
    'Personal styling services including wardrobe consultation and shopping assistance.',
    100.00, 2.0, 6.0, 4.7, 15, 'approved', true, true,
    ARRAY['Monaco', 'Nice'], ARRAY['French', 'English', 'Italian']
  )
  ON CONFLICT (profile_id, service_category_id) DO NOTHING;

  -- Interior Stylist Provider
  INSERT INTO public.service_providers (
    profile_id, service_category_id, business_name, bio,
    hourly_rate, min_duration_hours, max_duration_hours,
    rating, total_reviews, status, verified, available,
    service_area, languages_spoken
  ) VALUES (
    'USER_ID_4'::UUID, interior_cat_id, 'Rousseau Interior Design',
    'Full-service interior design and styling. Creating beautiful and functional spaces.',
    90.00, 2.0, 8.0, 4.6, 12, 'approved', true, true,
    ARRAY['Antibes', 'Nice', 'Cannes'], ARRAY['French', 'English']
  )
  ON CONFLICT (profile_id, service_category_id) DO NOTHING;
END $$;
*/

-- ============================================
-- Verification
-- ============================================
-- Check categories
SELECT id, name, slug, active FROM public.service_categories WHERE active = true;

-- Check if any providers exist
SELECT COUNT(*) as provider_count FROM public.service_providers;

