# Running Database Migration

## Option 1: Using Supabase CLI (Recommended)

### Step 1: Link your project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

You'll need:
- Your Supabase project reference (found in your project URL: `https://YOUR_PROJECT_REF.supabase.co`)
- Your database password (set when creating the project)

### Step 2: Push the migration
```bash
supabase db push
```

This will apply the migration file `supabase/migrations/001_initial_schema.sql` to your database.

## Option 2: Using Supabase Dashboard (Manual)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

## Option 3: Using Supabase Management API

If you provide me with:
- Your Supabase project reference
- A service role key (or access token)

I can run the migration via API.

**Note:** Service role key has full database access - only share if you're comfortable with that level of access.

## What the Migration Does

The migration will:
- Create all necessary tables (profiles, service_categories, service_providers, bookings, reviews, etc.)
- Set up indexes for performance
- Create triggers for automatic updates (ratings, timestamps)
- Set up Row Level Security (RLS) policies
- Insert initial service categories
- Create functions for user signup and rating calculations

## Verification

After running the migration, verify it worked by checking:
1. Tables appear in **Table Editor**
2. Service categories are populated (9 categories)
3. RLS policies are enabled (check in **Authentication > Policies**)

