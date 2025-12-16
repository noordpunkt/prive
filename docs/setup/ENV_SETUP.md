# Environment Variables Setup

## Create `.env.local` file

Create a file named `.env.local` in the root of your project with the following content:

```env
# Supabase Configuration
# Get these values from: Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here

# Supabase Service Role Key (for server-side operations only - never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Important Notes

⚠️ **The keys you provided look different from standard Supabase JWT keys.**

Standard Supabase keys usually look like:
- Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT format)
- Service role: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT format)

Your keys start with `sb_publishable_` and `sb_secret_` which might be:
1. A newer Supabase format
2. From a different Supabase service
3. Project-specific keys

## Verify Your Keys

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/dgpntdkjsvkcftleryjx
2. Navigate to **Project Settings** → **API**
3. Check the keys shown there:
   - **Project URL**: Should be `https://dgpntdkjsvkcftleryjx.supabase.co`
   - **anon/public key**: This is what you need for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: This is what you need for `SUPABASE_SERVICE_ROLE_KEY`

## After Creating .env.local

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Test the connection by checking if the app loads without errors

3. Verify Supabase connection works by trying to:
   - Sign up a test user
   - Query the service_categories table

## Security Reminders

- ✅ `.env.local` is already in `.gitignore` - it won't be committed
- ✅ Never commit `.env.local` to git
- ✅ Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- ✅ For Vercel deployment, add these as environment variables in Vercel dashboard

## For Vercel Deployment

When deploying to Vercel, add these environment variables in:
**Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional, for admin operations)

