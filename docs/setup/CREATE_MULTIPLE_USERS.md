# Create Multiple Users for Testing

To populate the database with 16 providers (4 per category), you need 16 user accounts. Here are the easiest ways to create them:

## Method 1: Supabase Dashboard (Quick)

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **Add User** (or **Invite User**)
3. Create users with these emails (or any emails you prefer):
   - `chef1@example.com`
   - `chef2@example.com`
   - `chef3@example.com`
   - `chef4@example.com`
   - `coiffeur1@example.com`
   - `coiffeur2@example.com`
   - `coiffeur3@example.com`
   - `coiffeur4@example.com`
   - `stylist1@example.com`
   - `stylist2@example.com`
   - `stylist3@example.com`
   - `stylist4@example.com`
   - `interior1@example.com`
   - `interior2@example.com`
   - `interior3@example.com`
   - `interior4@example.com`

4. Set temporary passwords (users can change them later)
5. After creating all users, run `sql/POPULATE_ALL_PROVIDERS_FRENCH.sql`

## Method 2: Bulk Create via SQL (Advanced)

You can create users programmatically, but this requires disabling email confirmation temporarily:

```sql
-- This creates users in auth.users (but they won't have profiles yet)
-- The provider script will create the profiles

-- Note: This is for testing only. In production, use proper signup flow.
```

## Method 3: Use Your App's Signup

1. Sign up 16 times through your app's registration
2. Use the emails from Method 1
3. Then run the provider population script

## After Creating Users

1. Verify users exist:
```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at 
LIMIT 20;
```

2. Run the provider script:
```sql
-- Run: sql/POPULATE_ALL_PROVIDERS_FRENCH.sql
```

3. Verify providers were created:
```sql
SELECT 
  sc.name as service,
  COUNT(*) as provider_count
FROM public.service_providers sp
JOIN public.service_categories sc ON sp.service_category_id = sc.id
WHERE sp.status = 'approved'
GROUP BY sc.name;
```

## Expected Result

You should see:
- **Chef Privé**: 4 providers
- **Coiffeur Privé**: 4 providers  
- **Stylist**: 4 providers
- **Interior Stylist**: 4 providers

Total: **16 providers**



