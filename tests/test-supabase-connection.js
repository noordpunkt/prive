// Quick test script to verify Supabase connection
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dgpntdkjsvkcftleryjx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncG50ZGtqc3ZrY2Z0bGVyeWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzkwNjIsImV4cCI6MjA4MDk1NTA2Mn0.cAdPvfE1zJN_eHR0OlFpTI2Dia7ys8vJBLzFkfO4ZpA'

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

