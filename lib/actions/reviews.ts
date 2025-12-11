'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createReview(
  bookingId: string,
  providerId: string,
  rating: number,
  comment?: string
) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Verify booking belongs to user and is completed
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('customer_id, status')
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    throw new Error('Booking not found')
  }

  if (booking.customer_id !== user.id) {
    throw new Error('Unauthorized')
  }

  if (booking.status !== 'completed') {
    throw new Error('Can only review completed bookings')
  }

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', bookingId)
    .eq('customer_id', user.id)
    .single()

  if (existingReview) {
    throw new Error('Review already exists for this booking')
  }

  // Create review
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      booking_id: bookingId,
      customer_id: user.id,
      provider_id: providerId,
      rating,
      comment: comment || null,
    })
    .select()
    .single()

  if (reviewError) {
    throw new Error(`Failed to create review: ${reviewError.message}`)
  }

  revalidatePath(`/bookings/${bookingId}`)
  return review
}

export async function getReviewsByProvider(providerId: string) {
  const supabase = await createClient()
  
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      *,
      customer:profiles!reviews_customer_id_fkey (
        id,
        full_name,
        avatar_url
      ),
      booking:bookings (*)
    `)
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`)
  }

  return reviews
}

