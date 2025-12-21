import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not set')
}

if (!webhookSecret) {
  console.error('STRIPE_WEBHOOK_SECRET is not set')
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
}) : null

export async function POST(request: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const bookingId = paymentIntent.metadata.booking_id

    if (bookingId) {
      // Update booking payment status using service role for webhook
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method: paymentIntent.payment_method_types[0] || 'card',
        })
        .eq('id', bookingId)
    }
  }

  return NextResponse.json({ received: true })
}

