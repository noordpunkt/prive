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

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(file: File) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.')
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size too large. Maximum size is 5MB.')
  }

  // Create a unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Failed to upload: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (updateError) {
    throw new Error(`Failed to update profile: ${updateError.message}`)
  }

  revalidatePath('/profile')
  return publicUrl
}

