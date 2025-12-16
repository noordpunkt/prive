#!/bin/bash
# Quick script to create .env.local file
# Run: bash SETUP_ENV.sh

cat > .env.local << 'EOF'
# Supabase Configuration
# Get these values from: Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here

# Supabase Service Role Key (for server-side operations only - never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
EOF

echo "✅ .env.local file created!"
echo "⚠️  Note: Please verify these keys in Supabase Dashboard → Project Settings → API"
echo "   Standard Supabase keys are JWT tokens (start with 'eyJ...')"
echo ""
echo "Next steps:"
echo "1. Verify keys in Supabase Dashboard"
echo "2. Restart dev server: npm run dev"
echo "3. Test connection"

