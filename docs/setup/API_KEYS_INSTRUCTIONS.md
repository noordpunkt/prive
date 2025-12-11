# Getting Your Supabase API Keys

## Correct Location

You need to go to: **API Keys** section (not JWT Keys)

1. In your Supabase Dashboard, go to:
   **Settings** → **API** (or **API Keys**)

2. You should see:
   - **Project URL**: `https://dgpntdkjsvkcftleryjx.supabase.co`
   - **anon public** key: This is a JWT token (starts with `eyJ...`)
   - **service_role** key: This is also a JWT token (starts with `eyJ...`)

## What We Need

For `.env.local`, we need:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dgpntdkjsvkcftleryjx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon/public key from API Keys section>
SUPABASE_SERVICE_ROLE_KEY=<the service_role key from API Keys section>
```

## Direct Link

Go to: https://supabase.com/dashboard/project/dgpntdkjsvkcftleryjx/settings/api

## Key Format

- Standard Supabase API keys are **JWT tokens** that look like:
  - `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncG50ZGtqc3ZrY2Z0bGVyeWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NDU2MDAsImV4cCI6MjA0OTQyMTYwMH0...`

- The **anon/public** key is safe to use in the browser (with RLS enabled)
- The **service_role** key has admin access - keep it secret!

## After Getting the Keys

1. Update `.env.local` with the correct keys
2. Restart your dev server: `npm run dev`
3. Test the connection

