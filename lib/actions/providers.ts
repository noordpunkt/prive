'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ProviderApplicationData {
  service_category_id: string
  business_name?: string
  bio?: string
  price: number
  total_hours?: number
  service_area?: string[]
  portfolio_images?: string[]
  certifications?: string[]
  languages_spoken?: string[]
}

/**
 * Submit a provider application
 * This creates a pending application that needs admin approval
 */
export async function submitProviderApplication(data: ProviderApplicationData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Check if user already has a provider profile for this category
  const { data: existingProvider } = await supabase
    .from('service_providers')
    .select('id')
    .eq('profile_id', user.id)
    .eq('service_category_id', data.service_category_id)
    .single()

  if (existingProvider) {
    throw new Error('You already have a provider profile for this service category')
  }

  // Check if there's already a pending application
  const { data: existingApplication } = await supabase
    .from('provider_applications')
    .select('id')
    .eq('profile_id', user.id)
    .eq('service_category_id', data.service_category_id)
    .eq('status', 'pending_approval')
    .single()

  if (existingApplication) {
    throw new Error('You already have a pending application for this service category')
  }

  // Create application
  const { data: application, error: applicationError } = await supabase
    .from('provider_applications')
    .insert({
      profile_id: user.id,
      service_category_id: data.service_category_id,
      status: 'pending_approval',
      application_data: data as any,
    })
    .select()
    .single()

  if (applicationError) {
    throw new Error(`Failed to submit application: ${applicationError.message}`)
  }

  // Update user role to provider (they can still be a customer too)
  await supabase
    .from('profiles')
    .update({ role: 'provider' })
    .eq('id', user.id)

  revalidatePath('/provider/apply')
  return application
}

/**
 * Get provider profile for current user
 */
export async function getMyProviderProfile(categoryId?: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  let query = supabase
    .from('service_providers')
    .select(`
      *,
      service_category:service_categories (*),
      profiles:profile_id (
        id,
        full_name,
        email,
        phone,
        avatar_url,
        location,
        languages
      )
    `)
    .eq('profile_id', user.id)

  if (categoryId) {
    query = query.eq('service_category_id', categoryId)
  }

  const { data: providers, error } = await query

  if (error) {
    throw new Error(`Failed to fetch provider profile: ${error.message}`)
  }

  return categoryId ? providers?.[0] : providers
}

/**
 * Update provider profile
 */
export async function updateProviderProfile(
  providerId: string,
  updates: Partial<ProviderApplicationData & { available: boolean }>
) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Verify ownership
  const { data: provider, error: providerError } = await supabase
    .from('service_providers')
    .select('profile_id')
    .eq('id', providerId)
    .single()

  if (providerError || !provider || provider.profile_id !== user.id) {
    throw new Error('Unauthorized or provider not found')
  }

  // Update provider
  const { data: updatedProvider, error: updateError } = await supabase
    .from('service_providers')
    .update(updates)
    .eq('id', providerId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to update provider profile: ${updateError.message}`)
  }

  revalidatePath('/provider')
  return updatedProvider
}

/**
 * Get provider applications (for admin)
 */
export async function getProviderApplications(status?: 'pending_approval' | 'approved' | 'rejected') {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized - Admin access required')
  }

  let query = supabase
    .from('provider_applications')
    .select(`
      *,
      profile:profiles (*),
      service_category:service_categories (*),
      reviewer:profiles!provider_applications_reviewed_by_fkey (
        id,
        full_name
      )
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: applications, error } = await query

  if (error) {
    throw new Error(`Failed to fetch applications: ${error.message}`)
  }

  return applications
}

/**
 * Approve or reject provider application (admin only)
 */
export async function reviewProviderApplication(
  applicationId: string,
  decision: 'approved' | 'rejected',
  adminNotes?: string
) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized - Admin access required')
  }

  // Get application
  const { data: application, error: appError } = await supabase
    .from('provider_applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (appError || !application) {
    throw new Error('Application not found')
  }

  // Update application status
  const { error: updateError } = await supabase
    .from('provider_applications')
    .update({
      status: decision,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes || null,
    })
    .eq('id', applicationId)

  if (updateError) {
    throw new Error(`Failed to update application: ${updateError.message}`)
  }

  // If approved, create provider profile
  if (decision === 'approved') {
    const applicationData = application.application_data as ProviderApplicationData

    const { error: providerError } = await supabase
      .from('service_providers')
      .insert({
        profile_id: application.profile_id,
        service_category_id: application.service_category_id,
        business_name: applicationData.business_name || null,
        bio: applicationData.bio || null,
        price: applicationData.price,
        total_hours: applicationData.total_hours || 2.0,
        service_area: applicationData.service_area || null,
        portfolio_images: applicationData.portfolio_images || null,
        certifications: applicationData.certifications || null,
        languages_spoken: applicationData.languages_spoken || null,
        status: 'approved',
        verified: true,
      })

    if (providerError) {
      throw new Error(`Failed to create provider profile: ${providerError.message}`)
    }
  }

  revalidatePath('/admin/applications')
  return { success: true }
}

/**
 * Add provider image URL to database
 * Admin only - adds an already-uploaded image URL to the provider's portfolio
 * This is called after the file is uploaded directly to Supabase Storage from the client
 */
export async function addProviderImageUrl(providerId: string, imageUrl: string) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized - Admin access required')
  }

  // Get current provider to check image count
  const { data: provider, error: providerError } = await supabase
    .from('service_providers')
    .select('portfolio_images')
    .eq('id', providerId)
    .single()

  if (providerError || !provider) {
    throw new Error('Provider not found')
  }

  const currentImages = provider.portfolio_images || []
  if (currentImages.length >= 6) {
    throw new Error('Maximum 6 images allowed per provider')
  }

  // Add new image to portfolio_images array
  const updatedImages = [...currentImages, imageUrl]

  // Update provider with new image URL
  const { error: updateError } = await supabase
    .from('service_providers')
    .update({ portfolio_images: updatedImages })
    .eq('id', providerId)

  if (updateError) {
    throw new Error(`Failed to update provider: ${updateError.message}`)
  }

  revalidatePath('/admin/providers')
  return imageUrl
}

/**
 * @deprecated Use direct client-side upload to Supabase Storage instead
 * This function is kept for backward compatibility but uploads should be done client-side
 */
export async function uploadProviderImage(providerId: string, file: File) {
  // This is now a wrapper that throws an error to encourage client-side uploads
  throw new Error('Please use client-side upload to Supabase Storage. This function is deprecated.')
}

/**
 * Delete provider image
 * Admin only - can delete images for any provider
 */
export async function deleteProviderImage(providerId: string, imageUrl: string) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized - Admin access required')
  }

  // Get current provider
  const { data: provider, error: providerError } = await supabase
    .from('service_providers')
    .select('portfolio_images, cover_image_index')
    .eq('id', providerId)
    .single()

  if (providerError || !provider) {
    throw new Error('Provider not found')
  }

  const currentImages = provider.portfolio_images || []
  const imageIndex = currentImages.indexOf(imageUrl)

  if (imageIndex === -1) {
    throw new Error('Image not found')
  }

  // Remove image from array
  const updatedImages = currentImages.filter((url: string) => url !== imageUrl)

  // Update cover_image_index if needed
  let coverIndex = provider.cover_image_index
  if (coverIndex !== null) {
    if (imageIndex === coverIndex) {
      // Deleted image was the cover, set to first image (or null if no images left)
      coverIndex = updatedImages.length > 0 ? 0 : null
    } else if (imageIndex < coverIndex) {
      // Deleted image was before cover, adjust index
      coverIndex = coverIndex - 1
    }
  }

  // Delete file from storage
  // Extract file path from URL
  const urlParts = imageUrl.split('/')
  const fileName = urlParts[urlParts.length - 1]
  const filePath = `${providerId}/${fileName}`

  const { error: deleteError } = await supabase.storage
    .from('provider-images')
    .remove([filePath])

  if (deleteError) {
    console.error('Error deleting file from storage:', deleteError)
    // Continue with database update even if storage delete fails
  }

  // Update provider
  const { error: updateError } = await supabase
    .from('service_providers')
    .update({ 
      portfolio_images: updatedImages.length > 0 ? updatedImages : null,
      cover_image_index: coverIndex
    })
    .eq('id', providerId)

  if (updateError) {
    throw new Error(`Failed to update provider: ${updateError.message}`)
  }

  revalidatePath('/admin/providers')
  return { success: true }
}

/**
 * Set cover image for provider
 * Admin only
 */
export async function setCoverImage(providerId: string, imageIndex: number) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized - Admin access required')
  }

  // Get current provider
  const { data: provider, error: providerError } = await supabase
    .from('service_providers')
    .select('portfolio_images')
    .eq('id', providerId)
    .single()

  if (providerError || !provider) {
    throw new Error('Provider not found')
  }

  const currentImages = provider.portfolio_images || []
  if (imageIndex < 0 || imageIndex >= currentImages.length) {
    throw new Error('Invalid image index')
  }

  // Update cover_image_index
  const { error: updateError } = await supabase
    .from('service_providers')
    .update({ cover_image_index: imageIndex })
    .eq('id', providerId)

  if (updateError) {
    throw new Error(`Failed to update cover image: ${updateError.message}`)
  }

  revalidatePath('/admin/providers')
  return { success: true }
}

