-- Populate Services and Providers
-- Run this in your Supabase SQL Editor after running the initial migration
-- This script will:
-- 1. Ensure service categories exist (update if needed)
-- 2. Create sample provider profiles (you'll need to create auth users first)
-- 3. Create service providers linked to those profiles

-- ============================================
-- STEP 1: Insert/Update Service Categories
-- ============================================
-- First, let's ensure we only have the 4 active services
-- Deactivate the ones we don't want
UPDATE public.service_categories 
SET active = false 
WHERE slug NOT IN ('chef-prive', 'coiffeur-prive', 'stylist', 'interior-stylist');

-- Insert or update the 4 active service categories
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
-- STEP 2: Create Test Provider Users
-- ============================================
-- NOTE: You need to create auth users first via Supabase Auth or the app
-- Then run the following to create profiles and providers
-- 
-- For testing, you can create users via:
-- 1. Supabase Dashboard > Authentication > Add User
-- 2. Or sign up through your app
--
-- After creating users, get their user IDs and update the UUIDs below

-- ============================================
-- STEP 3: Create Sample Providers
-- ============================================
-- This assumes you have created auth users with these emails
-- Replace the profile_id UUIDs with actual user IDs from your auth.users table

-- Helper function to get user ID by email (if users exist)
DO $$
DECLARE
  chef_user_id UUID;
  coiffeur_user_id UUID;
  stylist_user_id UUID;
  interior_user_id UUID;
  chef_category_id UUID;
  coiffeur_category_id UUID;
  stylist_category_id UUID;
  interior_category_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO chef_category_id FROM public.service_categories WHERE slug = 'chef-prive';
  SELECT id INTO coiffeur_category_id FROM public.service_categories WHERE slug = 'coiffeur-prive';
  SELECT id INTO stylist_category_id FROM public.service_categories WHERE slug = 'stylist';
  SELECT id INTO interior_category_id FROM public.service_categories WHERE slug = 'interior-stylist';

  -- Try to get user IDs by email (create these users first via Supabase Auth)
  -- If users don't exist, this will skip provider creation
  SELECT id INTO chef_user_id FROM auth.users WHERE email = 'chef.provider@example.com' LIMIT 1;
  SELECT id INTO coiffeur_user_id FROM auth.users WHERE email = 'coiffeur.provider@example.com' LIMIT 1;
  SELECT id INTO stylist_user_id FROM auth.users WHERE email = 'stylist.provider@example.com' LIMIT 1;
  SELECT id INTO interior_user_id FROM auth.users WHERE email = 'interior.provider@example.com' LIMIT 1;

  -- Create/Update profiles for providers
  IF chef_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, location, languages, bio)
    VALUES (
      chef_user_id,
      'chef.provider@example.com',
      'Chef Marie Dubois',
      'provider',
      'Nice',
      ARRAY['French', 'English'],
      'Award-winning private chef with 15 years of experience. Specializing in French cuisine and Mediterranean dishes.'
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = 'provider',
      location = EXCLUDED.location,
      languages = EXCLUDED.languages,
      bio = EXCLUDED.bio;

    -- Create service provider
    INSERT INTO public.service_providers (
      profile_id, service_category_id, business_name, bio,
      hourly_rate, min_duration_hours, max_duration_hours,
      rating, total_reviews, status, verified, available,
      service_area, languages_spoken
    ) VALUES (
      chef_user_id, chef_category_id, 'Chef Privé by Marie',
      'Experience fine dining in the comfort of your home. Specializing in French and Mediterranean cuisine with a focus on fresh, local ingredients.',
      120.00, 3.0, 8.0,
      4.8, 24, 'approved', true, true,
      ARRAY['Nice', 'Cannes', 'Antibes', 'Monaco'],
      ARRAY['French', 'English', 'Italian']
    )
    ON CONFLICT (profile_id, service_category_id) DO UPDATE SET
      business_name = EXCLUDED.business_name,
      bio = EXCLUDED.bio,
      hourly_rate = EXCLUDED.hourly_rate,
      available = EXCLUDED.available,
      status = 'approved';
  END IF;

  IF coiffeur_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, location, languages, bio)
    VALUES (
      coiffeur_user_id,
      'coiffeur.provider@example.com',
      'Sophie Martin',
      'provider',
      'Cannes',
      ARRAY['French', 'English'],
      'Professional hairstylist with expertise in modern cuts, color, and styling. Mobile service available.'
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = 'provider',
      location = EXCLUDED.location,
      languages = EXCLUDED.languages,
      bio = EXCLUDED.bio;

    INSERT INTO public.service_providers (
      profile_id, service_category_id, business_name, bio,
      hourly_rate, min_duration_hours, max_duration_hours,
      rating, total_reviews, status, verified, available,
      service_area, languages_spoken
    ) VALUES (
      coiffeur_user_id, coiffeur_category_id, 'Sophie Coiffure Privée',
      'Professional mobile hairdressing service. Specializing in cuts, color, highlights, and special occasion styling.',
      80.00, 1.5, 4.0,
      4.9, 18, 'approved', true, true,
      ARRAY['Cannes', 'Nice', 'Antibes'],
      ARRAY['French', 'English']
    )
    ON CONFLICT (profile_id, service_category_id) DO UPDATE SET
      business_name = EXCLUDED.business_name,
      bio = EXCLUDED.bio,
      hourly_rate = EXCLUDED.hourly_rate,
      available = EXCLUDED.available,
      status = 'approved';
  END IF;

  IF stylist_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, location, languages, bio)
    VALUES (
      stylist_user_id,
      'stylist.provider@example.com',
      'Emma Laurent',
      'provider',
      'Monaco',
      ARRAY['French', 'English', 'Italian'],
      'Personal stylist and fashion consultant helping clients discover their unique style.'
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = 'provider',
      location = EXCLUDED.location,
      languages = EXCLUDED.languages,
      bio = EXCLUDED.bio;

    INSERT INTO public.service_providers (
      profile_id, service_category_id, business_name, bio,
      hourly_rate, min_duration_hours, max_duration_hours,
      rating, total_reviews, status, verified, available,
      service_area, languages_spoken
    ) VALUES (
      stylist_user_id, stylist_category_id, 'Style by Emma',
      'Personal styling services including wardrobe consultation, shopping assistance, and style transformation.',
      100.00, 2.0, 6.0,
      4.7, 15, 'approved', true, true,
      ARRAY['Monaco', 'Nice', 'Cannes'],
      ARRAY['French', 'English', 'Italian']
    )
    ON CONFLICT (profile_id, service_category_id) DO UPDATE SET
      business_name = EXCLUDED.business_name,
      bio = EXCLUDED.bio,
      hourly_rate = EXCLUDED.hourly_rate,
      available = EXCLUDED.available,
      status = 'approved';
  END IF;

  IF interior_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, location, languages, bio)
    VALUES (
      interior_user_id,
      'interior.provider@example.com',
      'Jean-Pierre Rousseau',
      'provider',
      'Antibes',
      ARRAY['French', 'English'],
      'Interior designer specializing in modern and contemporary spaces with a Mediterranean touch.'
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = 'provider',
      location = EXCLUDED.location,
      languages = EXCLUDED.languages,
      bio = EXCLUDED.bio;

    INSERT INTO public.service_providers (
      profile_id, service_category_id, business_name, bio,
      hourly_rate, min_duration_hours, max_duration_hours,
      rating, total_reviews, status, verified, available,
      service_area, languages_spoken
    ) VALUES (
      interior_user_id, interior_category_id, 'Rousseau Interior Design',
      'Full-service interior design and styling. From consultation to complete room transformation, creating beautiful and functional spaces.',
      90.00, 2.0, 8.0,
      4.6, 12, 'approved', true, true,
      ARRAY['Antibes', 'Nice', 'Cannes', 'Monaco'],
      ARRAY['French', 'English']
    )
    ON CONFLICT (profile_id, service_category_id) DO UPDATE SET
      business_name = EXCLUDED.business_name,
      bio = EXCLUDED.bio,
      hourly_rate = EXCLUDED.hourly_rate,
      available = EXCLUDED.available,
      status = 'approved';
  END IF;

END $$;

-- ============================================
-- STEP 4: Add More Providers (Optional)
-- ============================================
-- You can add more providers by creating auth users and running similar inserts
-- Or use the pattern above with different emails

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the data:

-- Check service categories
SELECT id, name, slug, active FROM public.service_categories WHERE active = true ORDER BY name;

-- Check providers
SELECT 
  sp.id,
  p.full_name,
  sc.name as service_name,
  sp.business_name,
  sp.hourly_rate,
  sp.rating,
  sp.available,
  sp.status
FROM public.service_providers sp
JOIN public.profiles p ON sp.profile_id = p.id
JOIN public.service_categories sc ON sp.service_category_id = sc.id
WHERE sc.active = true
ORDER BY sc.name, sp.rating DESC;

