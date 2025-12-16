# Populate Database with Services and Providers

This guide will help you populate your Supabase database with service categories and sample providers.

## Prerequisites

1. ✅ Database migration has been run (`001_initial_schema.sql` or `MIGRATION_READY.sql`)
2. ✅ You have access to Supabase SQL Editor
3. ✅ (Optional) You want to create test provider accounts

## Step 1: Insert Service Categories

The service categories should already be inserted by the migration, but you can ensure they're correct:

1. Open Supabase Dashboard → SQL Editor
2. Run this query to check existing categories:

```sql
SELECT id, name, slug, active FROM public.service_categories;
```

3. If categories are missing or incorrect, run:

```sql
-- Update service categories
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
```

## Step 2: Create Test Provider Users

To create providers, you first need user accounts. Choose one method:

### Method A: Create Users via Supabase Dashboard

1. Go to **Authentication** → **Users** → **Add User**
2. Create 4 users with these details:
   - Email: `chef.provider@example.com` (password: your choice)
   - Email: `coiffeur.provider@example.com`
   - Email: `stylist.provider@example.com`
   - Email: `interior.provider@example.com`
3. Note down their user IDs (you'll see them in the users list)

### Method B: Create Users via Your App

1. Sign up 4 new accounts through your app's registration
2. Use the emails above or any emails you prefer
3. Get their user IDs by running:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 10;
```

## Step 3: Create Provider Profiles and Service Providers

1. Open the file `sql/POPULATE_SERVICES_AND_PROVIDERS.sql`
2. If you used different emails, update the email addresses in the script
3. Run the entire script in Supabase SQL Editor

The script will:
- Create/update profiles for the provider users
- Create service provider entries linked to service categories
- Set providers as approved and available

## Step 4: Verify Data

Run these queries to verify everything is set up correctly:

```sql
-- Check service categories
SELECT id, name, slug, active 
FROM public.service_categories 
WHERE active = true 
ORDER BY name;

-- Check providers
SELECT 
  sp.id,
  p.full_name,
  p.email,
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
```

## Quick Alternative: Manual Provider Creation

If you prefer to create providers manually for specific users:

1. Get a user ID:
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

2. Get a service category ID:
```sql
SELECT id FROM public.service_categories WHERE slug = 'chef-prive';
```

3. Create the profile (if it doesn't exist):
```sql
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('USER_ID_HERE', 'email@example.com', 'Provider Name', 'provider')
ON CONFLICT (id) DO UPDATE SET role = 'provider';
```

4. Create the service provider:
```sql
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
  'USER_ID_HERE',
  'CATEGORY_ID_HERE',
  'Business Name',
  'Provider bio and description',
  100.00,  -- hourly rate
  2.0,     -- minimum hours
  8.0,     -- maximum hours
  4.5,     -- rating
  10,      -- number of reviews
  'approved',
  true,    -- verified
  true,    -- available
  ARRAY['Nice', 'Cannes'],  -- service areas
  ARRAY['French', 'English']  -- languages
);
```

## Troubleshooting

### No providers showing up?

1. Check if providers exist:
```sql
SELECT COUNT(*) FROM public.service_providers;
```

2. Check if providers are approved and available:
```sql
SELECT status, available, COUNT(*) 
FROM public.service_providers 
GROUP BY status, available;
```

3. Make sure service categories are active:
```sql
SELECT slug, active FROM public.service_categories;
```

### RLS (Row Level Security) blocking access?

If you can't see providers, check RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'service_providers';
```

The migration should have set up proper RLS policies, but you can verify they exist.

## Next Steps

Once providers are created, you should be able to:
- ✅ See providers on service detail pages (`/services/chef-prive`, etc.)
- ✅ Filter and search providers
- ✅ View provider details
- ✅ Book services (once booking flow is implemented)

