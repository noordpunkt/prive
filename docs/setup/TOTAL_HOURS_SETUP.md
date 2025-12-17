# Total Hours Setup Guide

## Overview
The provider duration system has been updated to use a single `total_hours` field instead of `min_duration_hours` and `max_duration_hours`. The admin panel now uses sliders for both price and hours editing.

## Database Changes Required

### Step 1: Run the Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- File: sql/ADD_TOTAL_HOURS.sql
```

This will:
- Add `total_hours` column to `service_providers` table
- Set default value of 2.0 hours
- Update existing records with a default value based on their current min/max duration
- **Remove** `min_duration_hours` and `max_duration_hours` columns

### Step 2: Verify the Migration

After running the migration, verify it worked:

```sql
SELECT id, business_name, total_hours
FROM public.service_providers
LIMIT 5;
```

The `min_duration_hours` and `max_duration_hours` columns should no longer exist.

## UI Changes

### Price Editing
- **Before**: Number input field
- **After**: Slider (€0 - €500, step: 5)
- Shows current value: `€{value}`
- Live preview as you drag

### Hours Editing
- **Before**: Text display "Min: 1h - Max: 4h"
- **After**: Slider (1h - 8h, step: 0.5)
- Shows current value: `{value}h`
- Live preview as you drag

## Features

1. **Sliders**: Both price and hours use interactive sliders in the side panel
2. **Live Preview**: Current value displays above the slider
3. **Range Indicators**: Min/max values shown below sliders
4. **Clickable Fields**: Both fields are clickable (like title) to open the editing panel

## Code Changes Made

All references to `min_duration_hours` and `max_duration_hours` have been removed from:
- ✅ `lib/actions/bookings.ts` - Now uses `total_hours` for validation
- ✅ `lib/actions/providers.ts` - Interface and provider creation updated
- ✅ `app/admin/providers/page.tsx` - UI updated to show and edit `total_hours`
- ✅ `app/book/[id]/page.tsx` - Booking form uses `total_hours` as default

The old columns are automatically removed by the migration script.

