'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface OnboardingData {
  profile: {
    full_name: string | null
  }
  provider: {
    service_category_id: string
    business_name: string | null
    bio: string | null
    price: number
    total_hours: number | null
    service_area: string[] | null
    portfolio_images: string[] | null
    cover_image_index: number | null
  }
}

export async function saveOnboardingData(data: OnboardingData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Update profile
  if (data.profile.full_name !== null) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: data.profile.full_name })
      .eq('id', user.id)

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`)
    }
  }

  // Check if provider already exists
  const { data: existingProvider } = await supabase
    .from('service_providers')
    .select('id')
    .eq('profile_id', user.id)
    .eq('service_category_id', data.provider.service_category_id)
    .maybeSingle()

  const providerData = {
    profile_id: user.id,
    service_category_id: data.provider.service_category_id,
    business_name: data.provider.business_name,
    bio: data.provider.bio,
    price: data.provider.price,
    total_hours: data.provider.total_hours || 2,
    service_area: data.provider.service_area,
    portfolio_images: data.provider.portfolio_images,
    cover_image_index: data.provider.cover_image_index,
    status: 'pending_approval',
    available: true,
  }

  if (existingProvider) {
    // Update existing provider
    const { error: updateError } = await supabase
      .from('service_providers')
      .update(providerData)
      .eq('id', existingProvider.id)

    if (updateError) {
      throw new Error(`Failed to update provider: ${updateError.message}`)
    }
  } else {
    // Create new provider
    const { error: insertError } = await supabase
      .from('service_providers')
      .insert(providerData)

    if (insertError) {
      throw new Error(`Failed to create provider: ${insertError.message}`)
    }

    // Update user role to provider
    await supabase
      .from('profiles')
      .update({ role: 'provider' })
      .eq('id', user.id)
  }

  revalidatePath('/onboarding')
  revalidatePath('/')
}

