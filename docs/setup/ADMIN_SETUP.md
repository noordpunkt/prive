# Admin Setup Guide

## Step 1: Set User as Admin

Run this SQL script in your Supabase SQL Editor:

```sql
-- Set Andres as admin user
UPDATE public.profiles
SET role = 'admin'
WHERE id = '6773717e-764d-4cfe-a2ab-40d0b2e161c1';
```

Or use the provided file: `sql/SET_USER_AS_ADMIN.sql`

## Step 2: Set Up Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Create a bucket named `avatars`
3. Set it as **Public**
4. Set up RLS policies (see `UPLOAD_PROFILE_PICTURE.md`)

## Step 3: Access Admin Dashboard

1. Sign in as the admin user (andresbuzzio@gmail.com)
2. Navigate to `/admin`
3. You'll see the admin dashboard with options to:
   - Manage Profiles
   - Manage Providers
   - Manage Service Packages

## Admin Features

### Profile Management (`/admin/profiles`)
- View all user profiles
- Upload profile pictures for any user
- See user information (name, email, role, etc.)

### How to Upload Profile Pictures

1. Go to `/admin/profiles`
2. Find the user you want to update
3. Click "Upload Photo" button
4. Select an image file (JPEG, PNG, WebP, or GIF)
5. The image will be uploaded to Supabase Storage and the profile will be updated automatically

## Security

- Only users with `role = 'admin'` can access `/admin/*` routes
- Admin pages check authentication and role before displaying
- Non-admin users are redirected to the homepage

## Next Steps

You can extend the admin panel to:
- Edit profile information (name, email, phone, etc.)
- Manage provider approvals
- View and manage bookings
- Manage service packages
- View analytics and reports

