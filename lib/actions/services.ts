'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getServiceCategories() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch service categories: ${error.message}`)
  }

  return data
}

export async function getServiceBySlug(slug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error) {
    console.error(`Error fetching service by slug "${slug}":`, error)
    throw new Error(`Failed to fetch service: ${error.message}`)
  }

  if (data) {
    console.log(`Found service: ${data.name} (ID: ${data.id})`)
  }

  return data
}

export async function getProvidersByCategory(categoryId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_providers')
    .select(`
      *,
      profiles:profile_id (
        id,
        full_name,
        avatar_url,
        email
      )
    `)
    .eq('service_category_id', categoryId)
    .eq('available', true)
    .eq('status', 'approved')  // Explicitly filter by approved status
    .order('rating', { ascending: false })

  if (error) {
    console.error('Error fetching providers:', error)
    throw new Error(`Failed to fetch providers: ${error.message}`)
  }

  console.log(`Found ${data?.length || 0} providers for category ${categoryId}`)
  return data || []
}

export async function getProviderById(providerId: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('service_providers')
      .select(`
        *,
        service_category:service_categories (*),
        profiles:profile_id (
          id,
          full_name,
          avatar_url,
          email,
          phone,
          location,
          languages
        )
      `)
      .eq('id', providerId)
      .eq('status', 'approved')
      .single()

    if (error) {
      // If provider not found or not approved, return null instead of throwing
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching provider:', error)
      throw new Error(`Failed to fetch provider: ${error.message}`)
    }

    if (!data) {
      return null
    }

    return data
  } catch (err) {
    // Catch any unexpected errors and return null
    console.error('Unexpected error in getProviderById:', err)
    return null
  }
}

export async function getServicePackagesByProvider(providerId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_packages')
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching service packages:', error)
    throw new Error(`Failed to fetch service packages: ${error.message}`)
  }

  return data || []
}

