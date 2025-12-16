-- Populate All Service Categories with 4 French Providers Each
-- This script creates 16 providers total (4 per category)
-- 
-- IMPORTANT: You need to have at least 16 user accounts in auth.users
-- If you don't have enough users, create them first via:
-- 1. Supabase Dashboard > Authentication > Users > Add User
-- 2. Or sign up through your app
--
-- After creating users, get their IDs:
-- SELECT id, email FROM auth.users ORDER BY created_at;

-- ============================================
-- STEP 1: Ensure All Service Categories Exist
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
-- STEP 2: Create Providers Using Existing Users
-- ============================================
-- This script will use the first 16 users from your auth.users table
-- If you have fewer users, it will create providers for as many as possible

DO $$
DECLARE
  -- Category IDs
  chef_cat_id UUID;
  coiffeur_cat_id UUID;
  stylist_cat_id UUID;
  interior_cat_id UUID;
  
  -- User IDs (will be populated from auth.users)
  user_ids UUID[];
  user_count INTEGER;
  provider_index INTEGER := 0;
  
  -- Provider data arrays
  chef_names TEXT[] := ARRAY[
    'Marie Dubois',
    'Pierre Moreau',
    'Sophie Laurent',
    'Antoine Rousseau'
  ];
  chef_businesses TEXT[] := ARRAY[
    'Cuisine Privée by Marie',
    'Chef Privé Pierre',
    'Sophie''s Table d''Exception',
    'Rousseau Gastronomie'
  ];
  chef_bios TEXT[] := ARRAY[
    'Chef étoilée avec 15 ans d''expérience. Spécialisée en cuisine française moderne et méditerranéenne.',
    'Ancien chef de restaurant étoilé, je propose des expériences culinaires raffinées à domicile.',
    'Passionnée de cuisine gastronomique, je crée des menus sur mesure pour vos événements privés.',
    'Chef cuisinier spécialisé en cuisine française traditionnelle et fusion moderne.'
  ];
  chef_rates DECIMAL[] := ARRAY[120.00, 150.00, 110.00, 130.00];
  chef_ratings DECIMAL[] := ARRAY[4.8, 4.9, 4.7, 4.6];
  chef_reviews INTEGER[] := ARRAY[24, 31, 18, 22];
  
  coiffeur_names TEXT[] := ARRAY[
    'Camille Martin',
    'Julien Bernard',
    'Élise Petit',
    'Thomas Durand'
  ];
  coiffeur_businesses TEXT[] := ARRAY[
    'Salon Privé Camille',
    'Julien Coiffure à Domicile',
    'Élise Beauté Privée',
    'Thomas Style & Coiffure'
  ];
  coiffeur_bios TEXT[] := ARRAY[
    'Coiffeuse professionnelle avec expertise en coupes modernes, colorations et coiffures de soirée.',
    'Coiffeur mobile spécialisé en coupes masculines et féminines. Service à domicile disponible.',
    'Styliste capillaire expérimentée, je propose des services de coiffure et coloration haut de gamme.',
    'Coiffeur coloriste expert en balayage, mèches et coupes tendance. Service mobile sur la Côte d''Azur.'
  ];
  coiffeur_rates DECIMAL[] := ARRAY[80.00, 75.00, 85.00, 90.00];
  coiffeur_ratings DECIMAL[] := ARRAY[4.9, 4.7, 4.8, 4.9];
  coiffeur_reviews INTEGER[] := ARRAY[18, 15, 20, 17];
  
  stylist_names TEXT[] := ARRAY[
    'Emma Rousseau',
    'Lucas Girard',
    'Chloé Moreau',
    'Alexandre Lefebvre'
  ];
  stylist_businesses TEXT[] := ARRAY[
    'Style by Emma',
    'Lucas Personal Styling',
    'Chloé Mode & Style',
    'Alexandre Fashion Consulting'
  ];
  stylist_bios TEXT[] := ARRAY[
    'Styliste personnelle et consultante en mode. Je vous aide à découvrir votre style unique et à créer une garde-robe élégante.',
    'Conseiller en image et styliste personnel. Spécialisé dans le style masculin et féminin moderne.',
    'Styliste mode et consultante shopping. Je transforme votre garde-robe et votre image personnelle.',
    'Consultant en mode et styliste. Expertise en relooking et création de looks sur mesure.'
  ];
  stylist_rates DECIMAL[] := ARRAY[100.00, 95.00, 105.00, 110.00];
  stylist_ratings DECIMAL[] := ARRAY[4.7, 4.6, 4.8, 4.7];
  stylist_reviews INTEGER[] := ARRAY[15, 12, 19, 16];
  
  interior_names TEXT[] := ARRAY[
    'Isabelle Dubois',
    'Marc Lefevre',
    'Julie Martin',
    'Nicolas Bernard'
  ];
  interior_businesses TEXT[] := ARRAY[
    'Intérieur Design by Isabelle',
    'Marc Design Intérieur',
    'Julie Home Styling',
    'Nicolas Architecture d''Intérieur'
  ];
  interior_bios TEXT[] := ARRAY[
    'Designer d''intérieur spécialisée en décoration moderne et contemporaine avec une touche méditerranéenne.',
    'Architecte d''intérieur et décorateur. Création d''espaces élégants et fonctionnels sur la Côte d''Azur.',
    'Styliste d''intérieur et décoratrice. Transformation complète de vos espaces de vie.',
    'Designer d''intérieur expert en rénovation et décoration. Du concept à la réalisation.'
  ];
  interior_rates DECIMAL[] := ARRAY[90.00, 95.00, 85.00, 100.00];
  interior_ratings DECIMAL[] := ARRAY[4.6, 4.7, 4.5, 4.8];
  interior_reviews INTEGER[] := ARRAY[12, 14, 10, 16];
  
BEGIN
  -- Get category IDs
  SELECT id INTO chef_cat_id FROM public.service_categories WHERE slug = 'chef-prive';
  SELECT id INTO coiffeur_cat_id FROM public.service_categories WHERE slug = 'coiffeur-prive';
  SELECT id INTO stylist_cat_id FROM public.service_categories WHERE slug = 'stylist';
  SELECT id INTO interior_cat_id FROM public.service_categories WHERE slug = 'interior-stylist';
  
  -- Get user IDs (first 16 users)
  SELECT ARRAY_AGG(id ORDER BY created_at), COUNT(*) 
  INTO user_ids, user_count
  FROM auth.users
  LIMIT 16;
  
  IF user_count < 16 THEN
    RAISE NOTICE 'Warning: Only % users found. Need 16 users for all providers. Creating providers for available users.', user_count;
  END IF;
  
  -- Create Chef Privé providers (users 0-3)
  FOR i IN 1..LEAST(4, user_count) LOOP
    IF user_ids[i] IS NOT NULL THEN
      -- Update profile
      INSERT INTO public.profiles (id, email, full_name, role, location, languages, bio)
      SELECT 
        user_ids[i],
        email,
        chef_names[i],
        'provider',
        'Nice',
        ARRAY['French', 'English'],
        chef_bios[i]
      FROM auth.users WHERE id = user_ids[i]
      ON CONFLICT (id) DO UPDATE SET
        full_name = chef_names[i],
        role = 'provider',
        location = 'Nice',
        languages = ARRAY['French', 'English'],
        bio = chef_bios[i];
      
      -- Create service provider
      INSERT INTO public.service_providers (
        profile_id, service_category_id, business_name, bio,
        hourly_rate, min_duration_hours, max_duration_hours,
        rating, total_reviews, status, verified, available,
        service_area, languages_spoken
      ) VALUES (
        user_ids[i], chef_cat_id, chef_businesses[i], chef_bios[i],
        chef_rates[i], 3.0, 8.0,
        chef_ratings[i], chef_reviews[i], 'approved', true, true,
        ARRAY['Nice', 'Cannes', 'Antibes', 'Monaco'],
        ARRAY['French', 'English']
      )
      ON CONFLICT (profile_id, service_category_id) DO UPDATE SET
        business_name = EXCLUDED.business_name,
        bio = EXCLUDED.bio,
        hourly_rate = EXCLUDED.hourly_rate,
        status = 'approved',
        verified = true,
        available = true;
    END IF;
  END LOOP;
  
  -- Create Coiffeur Privé providers (users 4-7)
  FOR i IN 1..LEAST(4, GREATEST(0, user_count - 4)) LOOP
    IF user_ids[i + 4] IS NOT NULL THEN
      INSERT INTO public.profiles (id, email, full_name, role, location, languages, bio)
      SELECT 
        user_ids[i + 4],
        email,
        coiffeur_names[i],
        'provider',
        'Cannes',
        ARRAY['French', 'English'],
        coiffeur_bios[i]
      FROM auth.users WHERE id = user_ids[i + 4]
      ON CONFLICT (id) DO UPDATE SET
        full_name = coiffeur_names[i],
        role = 'provider',
        location = 'Cannes',
        languages = ARRAY['French', 'English'],
        bio = coiffeur_bios[i];
      
      INSERT INTO public.service_providers (
        profile_id, service_category_id, business_name, bio,
        hourly_rate, min_duration_hours, max_duration_hours,
        rating, total_reviews, status, verified, available,
        service_area, languages_spoken
      ) VALUES (
        user_ids[i + 4], coiffeur_cat_id, coiffeur_businesses[i], coiffeur_bios[i],
        coiffeur_rates[i], 1.5, 4.0,
        coiffeur_ratings[i], coiffeur_reviews[i], 'approved', true, true,
        ARRAY['Cannes', 'Nice', 'Antibes'],
        ARRAY['French', 'English']
      )
      ON CONFLICT (profile_id, service_category_id) DO UPDATE SET
        business_name = EXCLUDED.business_name,
        bio = EXCLUDED.bio,
        hourly_rate = EXCLUDED.hourly_rate,
        status = 'approved',
        verified = true,
        available = true;
    END IF;
  END LOOP;
  
  -- Create Stylist providers (users 8-11)
  FOR i IN 1..LEAST(4, GREATEST(0, user_count - 8)) LOOP
    IF user_ids[i + 8] IS NOT NULL THEN
      INSERT INTO public.profiles (id, email, full_name, role, location, languages, bio)
      SELECT 
        user_ids[i + 8],
        email,
        stylist_names[i],
        'provider',
        'Monaco',
        ARRAY['French', 'English', 'Italian'],
        stylist_bios[i]
      FROM auth.users WHERE id = user_ids[i + 8]
      ON CONFLICT (id) DO UPDATE SET
        full_name = stylist_names[i],
        role = 'provider',
        location = 'Monaco',
        languages = ARRAY['French', 'English', 'Italian'],
        bio = stylist_bios[i];
      
      INSERT INTO public.service_providers (
        profile_id, service_category_id, business_name, bio,
        hourly_rate, min_duration_hours, max_duration_hours,
        rating, total_reviews, status, verified, available,
        service_area, languages_spoken
      ) VALUES (
        user_ids[i + 8], stylist_cat_id, stylist_businesses[i], stylist_bios[i],
        stylist_rates[i], 2.0, 6.0,
        stylist_ratings[i], stylist_reviews[i], 'approved', true, true,
        ARRAY['Monaco', 'Nice', 'Cannes'],
        ARRAY['French', 'English', 'Italian']
      )
      ON CONFLICT (profile_id, service_category_id) DO UPDATE SET
        business_name = EXCLUDED.business_name,
        bio = EXCLUDED.bio,
        hourly_rate = EXCLUDED.hourly_rate,
        status = 'approved',
        verified = true,
        available = true;
    END IF;
  END LOOP;
  
  -- Create Interior Stylist providers (users 12-15)
  FOR i IN 1..LEAST(4, GREATEST(0, user_count - 12)) LOOP
    IF user_ids[i + 12] IS NOT NULL THEN
      INSERT INTO public.profiles (id, email, full_name, role, location, languages, bio)
      SELECT 
        user_ids[i + 12],
        email,
        interior_names[i],
        'provider',
        'Antibes',
        ARRAY['French', 'English'],
        interior_bios[i]
      FROM auth.users WHERE id = user_ids[i + 12]
      ON CONFLICT (id) DO UPDATE SET
        full_name = interior_names[i],
        role = 'provider',
        location = 'Antibes',
        languages = ARRAY['French', 'English'],
        bio = interior_bios[i];
      
      INSERT INTO public.service_providers (
        profile_id, service_category_id, business_name, bio,
        hourly_rate, min_duration_hours, max_duration_hours,
        rating, total_reviews, status, verified, available,
        service_area, languages_spoken
      ) VALUES (
        user_ids[i + 12], interior_cat_id, interior_businesses[i], interior_bios[i],
        interior_rates[i], 2.0, 8.0,
        interior_ratings[i], interior_reviews[i], 'approved', true, true,
        ARRAY['Antibes', 'Nice', 'Cannes', 'Monaco'],
        ARRAY['French', 'English']
      )
      ON CONFLICT (profile_id, service_category_id) DO UPDATE SET
        business_name = EXCLUDED.business_name,
        bio = EXCLUDED.bio,
        hourly_rate = EXCLUDED.hourly_rate,
        status = 'approved',
        verified = true,
        available = true;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Provider creation completed. Created providers for % users.', user_count;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  'Provider Summary by Category:' as check_type,
  sc.name as service_name,
  COUNT(*) as provider_count
FROM public.service_providers sp
JOIN public.service_categories sc ON sp.service_category_id = sc.id
WHERE sp.status = 'approved' AND sp.available = true
GROUP BY sc.name, sc.slug
ORDER BY sc.name;

-- Show all providers
SELECT 
  sc.name as service,
  p.full_name,
  sp.business_name,
  sp.hourly_rate,
  sp.rating,
  sp.total_reviews,
  sp.status,
  sp.available
FROM public.service_providers sp
JOIN public.profiles p ON sp.profile_id = p.id
JOIN public.service_categories sc ON sp.service_category_id = sc.id
WHERE sp.status = 'approved' AND sp.available = true
ORDER BY sc.name, sp.rating DESC;



