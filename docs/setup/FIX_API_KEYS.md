# Fix: API Keys Format Issue

## Problem
The error "Failed to fetch services" is likely because:
1. **The new API key format (`sb_publishable_...`) is not compatible** with the Supabase client library
2. **The database migration hasn't been run yet** (tables don't exist)

## Solution: Get Legacy JWT Keys

The Supabase client library (`@supabase/ssr`) requires **JWT token format** keys, not the new `sb_publishable_` format.

### Steps:

1. **In Supabase Dashboard**, go to the **API Keys** page:
   https://supabase.com/dashboard/project/dgpntdkjsvkcftleryjx/settings/api-keys

2. **Click on the tab**: **"Legacy anon, service_role API keys"**
   (It's the second tab on the API Keys page)

3. **Copy these keys**:
   - **anon public** key: Should be a JWT token starting with `eyJ...`
   - **service_role** key: Should be a JWT token starting with `eyJ...`

4. **Update `.env.local`** with the JWT format keys

## Also Check: Database Migration

Make sure you've run the database migration:
1. Go to Supabase Dashboard → SQL Editor
2. Run the `MIGRATION_READY.sql` file
3. Verify tables are created

## After Getting Legacy Keys

Once you have the JWT format keys, share them and I'll update your `.env.local` file, or update it yourself:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dgpntdkjsvkcftleryjx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<JWT token starting with eyJ...>
SUPABASE_SERVICE_ROLE_KEY=<JWT token starting with eyJ...>
```

Then restart your dev server and test again.

