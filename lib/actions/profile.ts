'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ProfileUpdateData {
  full_name?: string
  phone?: string
  avatar_url?: string
  location?: string
  languages?: string[]
  bio?: string
  onboarding_completed?: boolean
}

/**
 * Get current user profile
 */
export async function getCurrentProfile() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }

  return profile
}

/**
 * Update user profile
 */
export async function updateProfile(data: ProfileUpdateData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to update profile: ${updateError.message}`)
  }

  revalidatePath('/profile')
  return updatedProfile
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(data: ProfileUpdateData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update({
      ...data,
      onboarding_completed: true,
    })
    .eq('id', user.id)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to complete onboarding: ${updateError.message}`)
  }

  revalidatePath('/')
  return updatedProfile
}

