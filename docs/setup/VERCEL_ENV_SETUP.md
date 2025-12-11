# Vercel Environment Variables Setup

## Required Environment Variables

Add these to your Vercel project:

### 1. Go to Vercel Dashboard
- Navigate to: https://vercel.com/andres-buzzios-projects/prive
- Go to **Settings** → **Environment Variables**

### 2. Add These Variables

#### Required (for client-side):
- **Variable Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://dgpntdkjsvkcftleryjx.supabase.co`
- **Environment**: Production, Preview, Development

- **Variable Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Your anon/public JWT key (starts with `eyJ...`)
- **Environment**: Production, Preview, Development

#### Optional (for server-side admin operations):
- **Variable Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Your service_role JWT key (starts with `eyJ...`)
- **Environment**: Production, Preview, Development

## Getting Your Keys

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/dgpntdkjsvkcftleryjx/settings/api
2. Click on the **"Legacy anon, service_role API keys"** tab
3. Copy the **anon public** key (JWT format starting with `eyJ...`)
4. Copy the **service_role** key (JWT format starting with `eyJ...`)

## After Adding Variables

1. **Redeploy** your project:
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Select **Redeploy**

2. Or wait for the next automatic deployment

## Verify It Works

After redeploying, check:
- The app loads without errors
- UserMenu component works
- Authentication works

## Troubleshooting

If you still see errors:
- Make sure variables are set for **Production** environment
- Check that keys are in JWT format (start with `eyJ...`)
- Verify the Supabase URL is correct
- Redeploy after adding variables

