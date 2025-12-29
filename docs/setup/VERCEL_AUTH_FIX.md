# Fix: Authentication Not Working in Production

## Problem
You're seeing "An error occurred in the Server Components render" when trying to register or sign in. This is because Supabase environment variables are missing or incorrect in Vercel.

## Required Environment Variables in Vercel

Go to: https://vercel.com/andres-buzzios-projects/prive/settings/environment-variables

### 1. Supabase URL (REQUIRED)
- **Variable Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://dgpntdkjsvkcftleryjx.supabase.co`
- **Environment**: Production, Preview, Development

### 2. Supabase Anon Key (REQUIRED)
- **Variable Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Your anon/public JWT key (starts with `eyJ...`)
- **Environment**: Production, Preview, Development
- **Get it from**: https://supabase.com/dashboard/project/dgpntdkjsvkcftleryjx/settings/api
- **Important**: Use the "Legacy anon, service_role API keys" tab

### 3. Supabase Service Role Key (REQUIRED for server actions)
- **Variable Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Your service_role JWT key (starts with `eyJ...`)
- **Environment**: Production, Preview, Development
- **Get it from**: https://supabase.com/dashboard/project/dgpntdkjsvkcftleryjx/settings/api
- **Important**: Use the "Legacy anon, service_role API keys" tab

### 4. Stripe Keys (REQUIRED for payments)
- **Variable Name**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value**: `pk_test_...`
- **Environment**: Production, Preview, Development

- **Variable Name**: `STRIPE_SECRET_KEY`
- **Value**: `sk_test_...`
- **Environment**: Production, Preview, Development

- **Variable Name**: `STRIPE_WEBHOOK_SECRET` (optional, for webhooks)
- **Value**: `whsec_...`
- **Environment**: Production, Preview, Development

## Steps to Fix

1. **Verify all variables are set** in Vercel:
   - Go to Settings → Environment Variables
   - Check that all variables above are present
   - Make sure they're set for **Production** environment

2. **Get your Supabase keys**:
   - Go to: https://supabase.com/dashboard/project/dgpntdkjsvkcftleryjx/settings/api
   - Click the **"Legacy anon, service_role API keys"** tab
   - Copy the **anon public** key (JWT format, starts with `eyJ...`)
   - Copy the **service_role** key (JWT format, starts with `eyJ...`)

3. **Add/Update variables in Vercel**:
   - If missing, add them
   - If present but wrong, update them
   - Make sure to select **Production, Preview, Development** for all

4. **Redeploy**:
   - Go to Deployments tab
   - Click the three dots (⋯) on the latest deployment
   - Select **"Redeploy"**
   - Wait for deployment to complete

5. **Test**:
   - Try to register a new account
   - Try to sign in
   - Check Vercel logs if still failing: https://vercel.com/andres-buzzios-projects/prive/logs

## Common Issues

- **"An error occurred in the Server Components render"**: Missing or incorrect Supabase environment variables
- **"Unauthorized"**: Supabase keys are wrong or not set
- **"Failed to create user profile"**: `SUPABASE_SERVICE_ROLE_KEY` is missing or incorrect

## Verify Your Keys Format

Supabase keys should be **JWT tokens** that look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncG50ZGtqc3ZrY2Z0bGVyeWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDUyMzYsImV4cCI6MjA4MTI2NTIzNn0.mmfIKbjWY9pce6TzQatdT_OkdgVhS6q8TVYrSuXyUII
```

If your keys start with `sb_publishable_` or `sb_secret_`, you need to get the **Legacy JWT keys** instead.



