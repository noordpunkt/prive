'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AddressAutocomplete } from '@/components/AddressAutocomplete'
import { Calendar } from '@/components/ui/calendar'
import { saveBookingDetails } from '@/lib/actions/bookings'

interface BookingFormProps {
  providerId: string
  provider: any
}

export function BookingForm({ providerId, provider }: BookingFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState('')
  const [formData, setFormData] = useState({
    address: '',
    notes: '',
  })

  useEffect(() => {
    // Set default duration to provider's total_hours or 2 hours
    setFormData(prev => ({
      ...prev,
    }))
  }, [provider])

  // Set default time when date is selected
  useEffect(() => {
    if (selectedDate && !selectedTime) {
      setSelectedTime('14:00')
    }
  }, [selectedDate, selectedTime])

  // Update scheduled_at when date or time changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':')
      const dateTime = new Date(selectedDate)
      dateTime.setHours(parseInt(hours), parseInt(minutes))
    }
  }, [selectedDate, selectedTime])

  const validateForm = (): string | null => {
    if (!selectedDate) {
      return 'Please select a date'
    }

    if (!selectedTime) {
      return 'Please select a time'
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
      if (!selectedDate || !selectedTime) {
        setError('Please select date and time')
        return
      }

      const [hours, minutes] = selectedTime.split(':')
      const dateTime = new Date(selectedDate)
      dateTime.setHours(parseInt(hours), parseInt(minutes))
      const scheduled_at = dateTime.toISOString()

      const booking = await saveBookingDetails({
        provider_id: providerId,
        service_category_id: provider.service_category_id,
        scheduled_at,
        duration_hours: provider.total_hours || 2,
        address: formData.address,
        notes: formData.notes || undefined,
      })
      
      // Redirect to payment page with booking ID
      router.push(`/book/${booking.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save booking details')
    } finally {
      setSubmitting(false)
    }
  }

  const minDate = new Date()
  minDate.setHours(0, 0, 0, 0)
  
  // Disable dates before today
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate < today
  }

  if (!provider.available) {
    return (
      <Card className="mt-16 shadow-none">
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            This provider is currently unavailable for bookings.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div id="booking-form" className="mt-16 pt-8 border-t border-black/10 dark:border-white/10">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <Label>Select Your Date</Label>
          <div className="flex justify-center mt-2">
            <div className="bg-transparent border border-border overflow-hidden w-[360px] max-w-full">
              <Calendar
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
              />
            </div>
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div key="time-input" className="animate-fade-in">
            <Label htmlFor="time">Time *</Label>
            <Input
              id="time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              disabled={!provider.available}
              className="mt-2 text-2xl font-bold font-mono"
              style={{ fontFamily: 'var(--font-source-code-pro)' }}
            />
          </div>
        )}

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

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Special Requests (Optional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any special requests or notes for the provider"
            disabled={!provider.available}
            className="mt-2 text-lg resize-none"
            rows={3}
          />
        </div>

        {/* Error Message */}
        {error && (
          <Card className="shadow-none border-rose-500">
            <CardContent className="p-6">
              <p className="text-rose-500">{error}</p>
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
          {submitting ? 'Saving...' : 'Checkout'}
        </Button>
      </form>
    </div>
  )
}

