# How to Upload Profile Pictures to Supabase

## Overview
Profile pictures (avatars) are stored in Supabase Storage and the URL is saved in the `profiles` table's `avatar_url` column.

## Step 1: Set Up Supabase Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Create a bucket named `avatars` with these settings:
   - **Public bucket**: ✅ Yes (so images can be accessed via URL)
   - **File size limit**: 5MB (or your preferred limit)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

## Step 2: Set Up Storage Policies (RLS)

In the Supabase SQL Editor, run this to allow authenticated users to upload their own avatars:

```sql
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Step 3: Upload via Frontend (Recommended)

Create a file upload component that:
1. Takes a file input
2. Uploads to Supabase Storage
3. Updates the profile's `avatar_url`

### Example Upload Function

```typescript
// lib/actions/profile.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function uploadAvatar(file: File) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Create a unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Failed to upload: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (updateError) {
    throw new Error(`Failed to update profile: ${updateError.message}`)
  }

  return publicUrl
}
```

## Step 4: Manual Upload via Supabase Dashboard

If you need to upload manually for testing:

1. Go to **Storage** → **avatars** bucket
2. Click **Upload file**
3. Select your image file
4. After upload, right-click the file → **Copy URL**
5. Update the profile in the database:

```sql
UPDATE profiles
SET avatar_url = 'https://your-project.supabase.co/storage/v1/object/public/avatars/user-id/filename.jpg'
WHERE id = 'user-uuid-here';
```

## Step 5: Upload via API (Alternative)

You can also create an API route for file uploads:

```typescript
// app/api/upload/avatar/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Update profile
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  return NextResponse.json({ url: publicUrl })
}
```

## Notes

- **File Size**: Keep images under 2MB for best performance
- **Image Format**: JPEG or PNG recommended
- **Dimensions**: Square images (e.g., 400x400px) work best for avatars
- **Caching**: Supabase Storage URLs are cached, so updates may take a moment to appear

