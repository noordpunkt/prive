# Provider Images Setup Guide

## Overview
Provider portfolio images are stored in Supabase Storage and managed through the admin panel. Each provider can have up to 6 images, with one designated as the cover photo.

## Step 1: Database Migration

Run the SQL migration to add the `cover_image_index` field:

```sql
-- Run this in Supabase SQL Editor
-- File: sql/ADD_PROVIDER_IMAGES.sql
```

This adds a field to track which image (by index) is the cover photo.

## Step 2: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Create a bucket named `provider-images` with these settings:
   - **Public bucket**: ✅ Yes (so images can be accessed via URL)
   - **File size limit**: 5MB (or your preferred limit)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

## Step 3: Set Up Storage Policies (RLS)

Run the SQL script to set up RLS policies for the storage bucket:

```sql
-- Run this in Supabase SQL Editor
-- File: sql/SETUP_PROVIDER_IMAGES_STORAGE.sql
```

This script:
- Ensures the `is_admin()` function exists
- Allows admins to upload, update, and delete provider images
- Allows public read access to provider images

## Step 4: Verify Setup

1. Go to `/admin/providers` in your app
2. Click "Manage Images" on any provider
3. Try uploading an image
4. Verify you can:
   - Upload up to 6 images
   - Set one as the cover photo
   - Delete images

## How It Works

### Image Storage Structure
- Images are stored in: `provider-images/{providerId}/{filename}`
- Each provider has their own folder
- Filenames include timestamp to ensure uniqueness

### Cover Photo
- The `cover_image_index` field stores the 0-based index of the cover photo
- If `cover_image_index` is `NULL`, the first image (index 0) is considered the cover
- The cover photo is displayed with a green border and "Cover" badge

### Image Limits
- Maximum 6 images per provider
- Upload button is disabled when limit is reached
- Images can be deleted to make room for new ones

## API Functions

The following server actions are available in `lib/actions/providers.ts`:

- `uploadProviderImage(providerId, file)` - Upload a new image (admin only)
- `deleteProviderImage(providerId, imageUrl)` - Delete an image (admin only)
- `setCoverImage(providerId, imageIndex)` - Set which image is the cover (admin only)

## Usage in Frontend

The provider profile page (`app/providers/[id]/page.tsx`) uses the first image from `portfolio_images` as the hero image. If a cover photo is set, it should be used instead.

To update the provider profile page to use the cover photo:

```typescript
const coverIndex = provider.cover_image_index ?? 0
const heroImage = provider.portfolio_images?.[coverIndex] || defaultImage
```

