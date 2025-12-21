'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getBookingById } from '@/lib/actions/bookings'
import { Confetti } from '@/components/Confetti'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function BookingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  const success = searchParams.get('success')
  const bookingId = searchParams.get('booking')

  useEffect(() => {
    if (success === 'true' && bookingId) {
      setShowConfetti(true)
      // Hide confetti after animation
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      
      async function loadBooking() {
        try {
          const bookingData = await getBookingById(bookingId)
          setBooking(bookingData)
        } catch (err) {
          console.error('Failed to load booking:', err)
        } finally {
          setLoading(false)
        }
      }
      loadBooking()
      
      return () => clearTimeout(timer)
    } else {
      setLoading(false)
    }
  }, [success, bookingId])

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

  if (success === 'true' && booking) {
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
      <div className="min-h-screen bg-background">
        {showConfetti && <Confetti />}
        <Header />
        
        <main className="pt-24 pb-32">
          <div className="container mx-auto px-4 py-16 max-w-3xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-black/10 dark:bg-white/10 mb-6">
                <CheckCircle2 className="w-12 h-12 text-black dark:text-white" />
              </div>
              
              <h1
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-au-bold)' }}
              >
                Payment Successful!
              </h1>
              
              <p
                className="text-lg text-muted-foreground"
                style={{ fontFamily: 'var(--font-au-regular)' }}
              >
                Your booking has been confirmed
              </p>
            </div>

            <Card className="mb-6 shadow-none">
              <CardContent className="p-6 space-y-4">
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: 'var(--font-au-bold)' }}
                >
                  Booking Details
                </h2>
                
                <div className="space-y-3">
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
                  
                  <div className="pt-4 border-t border-black/10 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-lg" style={{ fontFamily: 'var(--font-au-regular)' }}>Total Paid</span>
                      <span className="text-2xl font-bold font-mono" style={{ fontFamily: 'var(--font-source-code-pro)' }}>
                        €{booking.total_price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/">Back to Home</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/providers/${booking.provider_id}`}>View Provider</Link>
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  // Default view when no success parameter
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-32">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-au-bold)' }}
          >
            My Bookings
          </h1>
          <p className="text-muted-foreground mb-8">
            Your bookings will appear here
          </p>
          <Button asChild>
            <Link href="/">Explore Services</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

