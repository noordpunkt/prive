'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { getBookingById, confirmPayment } from '@/lib/actions/bookings'
import { StripeProvider } from '@/components/StripeProvider'
import { PaymentForm } from '@/components/PaymentForm'
import { Euro } from 'lucide-react'
import Link from 'next/link'

export default function BookPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) return
      
      try {
        const bookingData = await getBookingById(bookingId)
        setBooking(bookingData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking')
      } finally {
        setLoading(false)
      }
    }
    loadBooking()
  }, [bookingId])

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      await confirmPayment(bookingId, paymentIntentId)
      router.push(`/bookings?success=true&booking=${bookingId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm payment')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-16 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!booking || error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-16 text-center">
            <p className="text-muted-foreground mb-4">
              {error || 'Booking not found'}
            </p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Check if already paid
  if (booking.payment_status === 'paid') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-16 text-center max-w-3xl">
            <Card className="shadow-none">
              <CardContent className="p-6">
                <h1
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: 'var(--font-au-bold)' }}
                >
                  Payment Already Completed
                </h1>
                <p className="text-muted-foreground mb-6">
                  This booking has already been paid.
                </p>
                <Button asChild>
                  <Link href="/bookings">View Bookings</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const provider = booking.provider
  const displayName = provider?.business_name || provider?.profiles?.full_name || 'Provider'
  const scheduledDate = new Date(booking.scheduled_at)
  const formattedDate = scheduledDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <StripeProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-24 pb-32">
          <div className="container mx-auto px-4 py-16 max-w-3xl">
            <div className="mb-8 text-center">
              <h1
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-au-bold)' }}
              >
                Complete Your Booking
              </h1>
            </div>

            {/* Booking Summary */}
            <Card className="mb-6 shadow-none">
              <CardContent className="p-6 space-y-4">
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: 'var(--font-au-bold)' }}
                >
                  Booking Details
                </h2>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>Provider: </span>
                    <span style={{ fontFamily: 'var(--font-au-regular)' }}>{displayName}</span>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>Date & Time: </span>
                    <span style={{ fontFamily: 'var(--font-au-regular)' }}>{formattedDate}</span>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>Duration: </span>
                    <span style={{ fontFamily: 'var(--font-au-regular)' }}>{booking.duration_hours} {booking.duration_hours === 1 ? 'hour' : 'hours'}</span>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>Address: </span>
                    <span style={{ fontFamily: 'var(--font-au-regular)' }}>{booking.address}</span>
                  </div>
                  
                  {booking.notes && (
                    <div>
                      <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>Special Requests: </span>
                      <span style={{ fontFamily: 'var(--font-au-regular)' }}>{booking.notes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card className="mb-6 shadow-none">
              <CardContent className="p-6">
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ fontFamily: 'var(--font-au-bold)' }}
                >
                  Payment Information
                </h2>

                <PaymentForm
                  bookingId={bookingId}
                  amount={booking.total_price}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => setError(err)}
                />

                {/* Price Summary */}
                <div className="pt-6 mt-6 border-t border-black/10 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-lg" style={{ fontFamily: 'var(--font-au-regular)' }}>Total</span>
                    <div className="flex items-center gap-2">
                      <Euro className="w-5 h-5 text-muted-foreground" />
                      <span className="text-2xl font-bold font-mono" style={{ fontFamily: 'var(--font-source-code-pro)' }}>
                        €{booking.total_price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <Card className="mt-6 shadow-none border-rose-500">
                    <CardContent className="p-6">
                      <p className="text-rose-500">{error}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </StripeProvider>
  )
}
