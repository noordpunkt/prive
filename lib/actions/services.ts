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
    throw new Error(`Failed to fetch service: ${error.message}`)
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
    .order('rating', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch providers: ${error.message}`)
  }

  return data
}

