# Supabase CLI Setup Guide

This guide will help you set up the Supabase CLI so you can run migrations and manage your database directly from the command line.

## Step 1: Install Supabase CLI

### macOS (using Homebrew)
```bash
brew install supabase/tap/supabase
```

### Or download directly
Visit: https://github.com/supabase/cli/releases

## Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for you to authenticate.

## Step 3: Link Your Project

```bash
# Navigate to your project directory
cd /Users/andresbuzzio/prive

# Link to your Supabase project
supabase link --project-ref dgpntdkjsvkcftleryjx
```

You'll need your database password. You can find it in:
- Supabase Dashboard → Project Settings → Database → Database Password

## Step 4: Initialize Supabase (if not already done)

```bash
supabase init
```

This creates a `supabase/` folder with migration templates.

## Step 5: Create and Run Migrations

Once linked, you can:

### Create a new migration
```bash
supabase migration new add_provider_images
```

### Run migrations
```bash
supabase db push
```

### Or run a specific SQL file
```bash
supabase db execute -f sql/ADD_PROVIDER_IMAGES.sql
```

## Benefits

✅ **Version Control**: All migrations are tracked in Git
✅ **Automated**: Run migrations with a single command
✅ **Safe**: Migrations are tested before applying
✅ **Rollback**: Can revert migrations if needed

## Current Workflow

After setup, when I create SQL files, you can run:

```bash
# For new migrations
supabase migration new migration_name
# Then copy the SQL into the generated file
supabase db push

# For existing SQL files
supabase db execute -f sql/FILENAME.sql
```

## Troubleshooting

If you get connection errors:
1. Check your project ref: `dgpntdkjsvkcftleryjx`
2. Verify your database password
3. Make sure you're logged in: `supabase login`

