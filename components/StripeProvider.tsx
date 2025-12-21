'use client'

import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

export function StripeProvider({ children }: { children: React.ReactNode }) {
  if (!stripePublishableKey) {
    return (
      <div className="p-6 border border-rose-500 rounded">
        <p className="text-rose-500">
          Stripe is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables.
        </p>
      </div>
    )
  }

  if (!stripePromise) {
    return (
      <div className="p-6 border border-rose-500 rounded">
        <p className="text-rose-500">
          Failed to initialize Stripe.
        </p>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  )
}

