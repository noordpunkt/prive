// Quick test script to verify Supabase connection
// IMPORTANT: Replace the placeholder values with your actual Supabase credentials from .env.local
const { createClient } = require('@supabase/supabase-js')

// Get credentials from environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE'

if (supabaseUrl === 'YOUR_SUPABASE_URL_HERE' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
  console.error('❌ Error: Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  // Test 1: Check if service_categories table exists
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
    return
  }
  
  console.log('✅ Connection successful!')
  console.log('Found', data?.length || 0, 'service categories')
  if (data && data.length > 0) {
    console.log('Sample:', data[0])
  }
}

testConnection()

