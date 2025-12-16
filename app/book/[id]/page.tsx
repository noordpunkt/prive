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
import { AddressAutocomplete } from '@/components/AddressAutocomplete'
import { createBooking } from '@/lib/actions/bookings'
import { getProviderById } from '@/lib/actions/services'
import { Star, MapPin, Euro } from 'lucide-react'
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
    duration_hours: 1,
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
        // Set default duration to 1 hour
        setFormData(prev => ({
          ...prev,
          duration_hours: 1
        }))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load provider')
      } finally {
        setLoading(false)
      }
    }
    loadProvider()
  }, [providerId])

  const validateForm = (): string | null => {
    if (!formData.scheduled_at) {
      return 'Please select a date and time'
    }

    const selectedDate = new Date(formData.scheduled_at)
    const now = new Date()
    if (selectedDate <= now) {
      return 'Please select a future date and time'
    }

    if (!formData.address.trim()) {
      return 'Please enter an address'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!provider || !providerId) return

    // Validate form
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

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
  const price = provider.hourly_rate || 0
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

            {/* Address */}
            <div>
              <Label htmlFor="address">Address *</Label>
              <div className="mt-2">
                <AddressAutocomplete
                  id="address"
                  value={formData.address}
                  onChange={(value) => setFormData({ ...formData, address: value })}
                  placeholder="Street address, city, postal code"
                  required
                  disabled={!provider.available}
                />
              </div>
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
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <Euro className="w-5 h-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      €{price.toFixed(2)}
                    </span>
                  </div>
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
            <Button
              type="submit"
              size="lg"
              disabled={!provider.available || submitting}
              className="w-full"
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}

