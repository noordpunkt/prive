import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
}) : null

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        provider:service_providers (
          business_name,
          profiles:profile_id (
            full_name
          )
        )
      `)
      .eq('id', bookingId)
      .eq('customer_id', user.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if already paid
    if (booking.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Booking already paid' },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.total_price * 100), // Convert to cents
      currency: 'eur',
      metadata: {
        booking_id: bookingId,
        customer_id: user.id,
        provider_id: booking.provider_id,
      },
      description: `Booking for ${booking.provider?.business_name || booking.provider?.profiles?.full_name || 'Provider'}`,
    })

    // Update booking with payment intent ID
    await supabase
      .from('bookings')
      .update({ payment_id: paymentIntent.id })
      .eq('id', bookingId)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

