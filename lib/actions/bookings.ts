'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBooking(bookingData: {
  provider_id: string
  service_category_id: string
  scheduled_at: string
  duration_hours: number
  address: string
  address_details?: string
  notes?: string
}) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Get provider to calculate price and verify availability
  const { data: provider, error: providerError } = await supabase
    .from('service_providers')
    .select('price, status, available, total_hours')
    .eq('id', bookingData.provider_id)
    .single()

  if (providerError || !provider) {
    throw new Error('Provider not found')
  }

  // Price is fixed per service/experience, not per hour
  const total_price = provider.price || 0

  if (provider.status !== 'approved') {
    throw new Error('Provider is not approved')
  }

  if (!provider.available) {
    throw new Error('Provider is not currently available')
  }

  // Validate duration matches total_hours
  if (provider.total_hours && bookingData.duration_hours !== provider.total_hours) {
    throw new Error(`Duration must be exactly ${provider.total_hours} hours`)
  }

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      customer_id: user.id,
      provider_id: bookingData.provider_id,
      service_category_id: bookingData.service_category_id,
      scheduled_at: bookingData.scheduled_at,
      duration_hours: bookingData.duration_hours,
      total_price,
      address: bookingData.address,
      address_details: bookingData.address_details || null,
      notes: bookingData.notes || null,
      status: 'pending',
      payment_status: 'pending'
    })
    .select()
    .single()

  if (bookingError) {
    throw new Error(`Failed to create booking: ${bookingError.message}`)
  }

  revalidatePath('/bookings')
  return booking
}

export async function saveBookingDetails(bookingData: {
  provider_id: string
  service_category_id: string
  scheduled_at: string
  duration_hours: number
  address: string
  address_details?: string
  notes?: string
}) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Get provider to calculate price and verify availability
  const { data: provider, error: providerError } = await supabase
    .from('service_providers')
    .select('price, status, available, total_hours')
    .eq('id', bookingData.provider_id)
    .single()

  if (providerError || !provider) {
    throw new Error('Provider not found')
  }

  // Price is fixed per service/experience, not per hour
  const total_price = provider.price || 0

  if (provider.status !== 'approved') {
    throw new Error('Provider is not approved')
  }

  if (!provider.available) {
    throw new Error('Provider is not currently available')
  }

  // Validate duration matches total_hours
  if (provider.total_hours && bookingData.duration_hours !== provider.total_hours) {
    throw new Error(`Duration must be exactly ${provider.total_hours} hours`)
  }

  // Create booking with pending payment
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      customer_id: user.id,
      provider_id: bookingData.provider_id,
      service_category_id: bookingData.service_category_id,
      scheduled_at: bookingData.scheduled_at,
      duration_hours: bookingData.duration_hours,
      total_price,
      address: bookingData.address,
      address_details: bookingData.address_details || null,
      notes: bookingData.notes || null,
      status: 'pending',
      payment_status: 'pending'
    })
    .select()
    .single()

  if (bookingError) {
    throw new Error(`Failed to save booking details: ${bookingError.message}`)
  }

  revalidatePath('/bookings')
  return booking
}

export async function getBookingById(bookingId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service_category:service_categories (*),
      provider:service_providers (
        *,
        profiles:profile_id (
          id,
          full_name,
          avatar_url
        )
      ),
      customer:profiles!bookings_customer_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('id', bookingId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch booking: ${error.message}`)
  }

  // Verify user owns this booking
  if (booking.customer_id !== user.id) {
    throw new Error('Unauthorized')
  }

  return booking
}

export async function getBookings() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service_category:service_categories (*),
      provider:service_providers (
        *,
        profiles:profile_id (
          id,
          full_name,
          avatar_url
        )
      ),
      customer:profiles!bookings_customer_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .or(`customer_id.eq.${user.id},provider.profile_id.eq.${user.id}`)
    .order('scheduled_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`)
  }

  return bookings
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Check permissions
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('customer_id, provider:service_providers(profile_id)')
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    throw new Error('Booking not found')
  }

  const providerProfileId = (booking.provider as any)?.profile_id
  if (booking.customer_id !== user.id && providerProfileId !== user.id) {
    throw new Error('Unauthorized')
  }

  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to update booking: ${updateError.message}`)
  }

  revalidatePath('/bookings')
  return updatedBooking
}

