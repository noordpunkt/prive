# How to Get Your Supabase API Keys

## Current Location
You're currently on: **Settings → Data API**

## What You Need to Do

1. **In the left sidebar**, click on **"API Keys"** (it's right below "Data API" in the PROJECT SETTINGS section)

2. **Direct link to API Keys:**
   https://supabase.com/dashboard/project/dgpntdkjsvkcftleryjx/settings/api#api-keys

3. **On the API Keys page, you'll see:**
   - **Project URL**: `https://dgpntdkjsvkcftleryjx.supabase.co` ✅ (you already have this)
   - **anon public** key: A long JWT token (starts with `eyJ...`)
   - **service_role** key: Another long JWT token (starts with `eyJ...`)

## What the Keys Look Like

The keys are JWT tokens that look like this:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJfcHJvamVjdF9yZWYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMzg0NTYwMCwiZXhwIjoyMDQ5NDIxNjAwfQ.xxxxx...
```
(Note: This is just an example format - use your actual keys from the Supabase dashboard)

## Security Notes

- **anon public** key: Safe to use in browser (with RLS enabled) ✅
- **service_role** key: Has admin access - keep it secret! 🔒

## After You Get the Keys

Once you have both keys, I'll update your `.env.local` file with them, or you can share them here and I'll help you set it up.

