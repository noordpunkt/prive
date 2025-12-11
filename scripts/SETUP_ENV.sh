#!/bin/bash
# Quick script to create .env.local file
# Run: bash SETUP_ENV.sh

cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dgpntdkjsvkcftleryjx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_JFejKohAvuA5f5zsQTekPg_tnI7I4Pg

# Supabase Service Role Key (for server-side operations only - never expose to client)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_-TK3R6rFnX9o1JUjRkMnlQ_03LMTX9f
EOF

echo "✅ .env.local file created!"
echo "⚠️  Note: Please verify these keys in Supabase Dashboard → Project Settings → API"
echo "   Standard Supabase keys are JWT tokens (start with 'eyJ...')"
echo ""
echo "Next steps:"
echo "1. Verify keys in Supabase Dashboard"
echo "2. Restart dev server: npm run dev"
echo "3. Test connection"

