'use client'

import { useState, useEffect } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { CardContent } from '@/components/ui/card'

interface PaymentFormProps {
  bookingId: string
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
}

export function PaymentForm({ bookingId, amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    async function createPaymentIntent() {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bookingId }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create payment intent')
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to initialize payment')
      } finally {
        setLoading(false)
      }
    }

    createPaymentIntent()
  }, [bookingId, onError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setSubmitting(true)
    onError('')

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      onError('Card element not found')
      setSubmitting(false)
      return
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (error) {
        onError(error.message || 'Payment failed')
        setSubmitting(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment failed')
      setSubmitting(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '18px',
        color: isDarkMode ? '#ffffff' : '#000000',
        fontFamily: 'var(--font-source-code-pro), monospace',
        '::placeholder': {
          color: isDarkMode ? '#a0a0a0' : '#a0a0a0',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  }

  if (loading) {
    return (
      <div className="py-4">
        <p className="text-muted-foreground">Loading payment form...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="card-element">Card Details *</Label>
        <div className="mt-2 p-4 border-b border-black/30 dark:border-white/30">
          <CardElement
            key={isDarkMode ? 'dark' : 'light'}
            id="card-element"
            options={cardElementOptions}
            className="stripe-card-element"
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!stripe || submitting || !clientSecret}
        className="w-full"
      >
        {submitting ? 'Processing...' : 'Complete Payment'}
      </Button>
    </form>
  )
}

