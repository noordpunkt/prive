'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createBooking } from '@/lib/actions/bookings'
import { getProviderById } from '@/lib/actions/services'
import { Star, MapPin, Euro, Clock } from 'lucide-react'
import Link from 'next/link'

export default function BookPage() {
  const router = useRouter()
  const params = useParams()
  const providerId = params.id as string
  
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    scheduled_at: '',
    duration_hours: 2,
    address: '',
    address_details: '',
    notes: '',
  })

  useEffect(() => {
    async function loadProvider() {
      if (!providerId) return
      
      try {
        const providerData = await getProviderById(providerId)
        setProvider(providerData)
        if (providerData?.min_duration_hours) {
          setFormData(prev => ({
            ...prev,
            duration_hours: providerData.min_duration_hours
          }))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load provider')
      } finally {
        setLoading(false)
      }
    }
    loadProvider()
  }, [providerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!provider || !providerId) return

    setSubmitting(true)
    setError(null)

    try {
      if (!providerId) {
        setError('Provider ID is missing')
        return
      }
      
      await createBooking({
        provider_id: providerId,
        service_category_id: provider.service_category_id,
        scheduled_at: formData.scheduled_at,
        duration_hours: formData.duration_hours,
        address: formData.address,
        address_details: formData.address_details || undefined,
        notes: formData.notes || undefined,
      })
      
      router.push('/bookings?success=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setSubmitting(false)
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

  if (!provider || error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-16 text-center">
            <p className="text-muted-foreground mb-4">
              {error || 'Provider not found'}
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

  const displayName = provider.business_name || provider.profiles?.full_name || 'Provider'
  const totalPrice = (provider.hourly_rate || 0) * formData.duration_hours
  const minDate = new Date().toISOString().slice(0, 16)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <div className="mb-8">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-grand-medium)' }}
            >
              Book {displayName}
            </h1>
            {provider.service_category && (
              <p className="text-xl text-muted-foreground mb-6">
                {provider.service_category.name}
              </p>
            )}
          </div>

          {!provider.available && (
            <Card className="mb-6 shadow-none">
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  This provider is currently unavailable for bookings.
                </p>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Time */}
            <div>
              <Label htmlFor="scheduled_at">Date & Time *</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                min={minDate}
                required
                disabled={!provider.available}
                className="mt-2"
              />
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration_hours">Duration (hours) *</Label>
              <Input
                id="duration_hours"
                type="number"
                min={provider.min_duration_hours || 1}
                max={provider.max_duration_hours || 24}
                value={formData.duration_hours}
                onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 1 })}
                required
                disabled={!provider.available}
                className="mt-2"
              />
              {provider.min_duration_hours && provider.max_duration_hours && (
                <p className="text-sm text-muted-foreground mt-1">
                  Minimum: {provider.min_duration_hours}h, Maximum: {provider.max_duration_hours}h
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, city, postal code"
                required
                disabled={!provider.available}
                className="mt-2"
              />
            </div>

            {/* Address Details */}
            <div>
              <Label htmlFor="address_details">Address Details (Optional)</Label>
              <Textarea
                id="address_details"
                value={formData.address_details}
                onChange={(e) => setFormData({ ...formData, address_details: e.target.value })}
                placeholder="Apartment number, floor, access code, etc."
                disabled={!provider.available}
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Special Requests (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special requests or notes for the provider"
                disabled={!provider.available}
                className="mt-2"
                rows={4}
              />
            </div>

            {/* Price Summary */}
            <Card className="shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formData.duration_hours} {formData.duration_hours === 1 ? 'hour' : 'hours'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="w-5 h-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      €{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  €{provider.hourly_rate?.toFixed(2)} per hour
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="shadow-none border-red-500">
                <CardContent className="p-6">
                  <p className="text-red-500">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={!provider.available || submitting}
                className="flex-1"
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                asChild
              >
                <Link href={providerId ? `/providers/${providerId}` : '/'}>Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}

