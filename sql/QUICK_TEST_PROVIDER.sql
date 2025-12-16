-- Quick Test: Add a Provider for Chef Privé
-- This script will work even if you don't have auth users yet
-- It creates a test provider that will show up on the service page

-- Step 1: Ensure Chef Privé category exists
INSERT INTO public.service_categories (name, description, icon, slug, active) VALUES
  ('Chef Privé', 'Private chef services for intimate dining experiences', 'chef-hat', 'chef-prive', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  active = EXCLUDED.active;

-- Step 2: Get the category ID
DO $$
DECLARE
  chef_category_id UUID;
  test_user_id UUID;
BEGIN
  -- Get Chef Privé category ID
  SELECT id INTO chef_category_id 
  FROM public.service_categories 
  WHERE slug = 'chef-prive' 
  LIMIT 1;

  IF chef_category_id IS NULL THEN
    RAISE EXCEPTION 'Chef Privé category not found. Please run the migration first.';
  END IF;

  -- Try to find any existing user (for testing)
  -- If you have any users in auth.users, we'll use the first one
  SELECT id INTO test_user_id 
  FROM auth.users 
  ORDER BY created_at 
  LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No users found in auth.users. You need to create a user first.';
    RAISE NOTICE 'Go to Supabase Dashboard > Authentication > Users > Add User';
    RAISE NOTICE 'Or sign up through your app, then run this script again.';
  ELSE
    -- Create/update profile for this user
    INSERT INTO public.profiles (id, email, full_name, role)
    SELECT 
      id,
      email,
      COALESCE(raw_user_meta_data->>'full_name', 'Test Chef Provider'),
      'provider'
    FROM auth.users
    WHERE id = test_user_id
    ON CONFLICT (id) DO UPDATE SET
      role = 'provider',
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

    -- Create the service provider
    INSERT INTO public.service_providers (
      profile_id,
      service_category_id,
      business_name,
      bio,
      hourly_rate,
      min_duration_hours,
      max_duration_hours,
      rating,
      total_reviews,
      status,
      verified,
      available,
      service_area,
      languages_spoken
    ) VALUES (
      test_user_id,
      chef_category_id,
      'Test Chef Privé',
      'This is a test provider to verify the service page is working. Experience fine dining in the comfort of your home.',
      100.00,
      2.0,
      6.0,
      4.5,
      10,
      'approved',  -- IMPORTANT: Must be 'approved'
      true,        -- IMPORTANT: Must be verified
      true,        -- IMPORTANT: Must be available
      ARRAY['Nice', 'Cannes'],
      ARRAY['French', 'English']
    )
    ON CONFLICT (profile_id, service_category_id) DO UPDATE SET
      business_name = EXCLUDED.business_name,
      bio = EXCLUDED.bio,
      status = 'approved',
      verified = true,
      available = true;

    RAISE NOTICE 'Provider created successfully!';
    RAISE NOTICE 'User ID used: %', test_user_id;
  END IF;

  -- Show what we created
  RAISE NOTICE 'Chef Privé category ID: %', chef_category_id;
END $$;

-- Step 3: Verify the provider was created
SELECT 
  sp.id,
  p.email,
  p.full_name,
  sp.business_name,
  sp.status,
  sp.available,
  sp.verified,
  sc.name as service_name
FROM public.service_providers sp
JOIN public.profiles p ON sp.profile_id = p.id
JOIN public.service_categories sc ON sp.service_category_id = sc.id
WHERE sc.slug = 'chef-prive';

