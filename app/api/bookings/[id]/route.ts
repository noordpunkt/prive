import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service_category:service_categories (*),
        provider:service_providers (
          *,
          profiles:profile_id (
            id,
            full_name,
            avatar_url,
            phone
          )
        ),
        customer:profiles!bookings_customer_id_fkey (
          id,
          full_name,
          avatar_url,
          phone
        ),
        reviews (*)
      `)
      .eq('id', id)
      .single()

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this booking
    if (booking.customer_id !== user.id && booking.provider?.profile_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, scheduled_at, duration_hours, address, notes } = body

    // Get booking to check permissions
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('customer_id, provider:service_providers(profile_id)')
      .eq('id', id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const providerProfileId = (booking.provider as any)?.profile_id
    if (booking.customer_id !== user.id && providerProfileId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update booking
    const updateData: any = {}
    if (status) updateData.status = status
    if (scheduled_at) updateData.scheduled_at = scheduled_at
    if (duration_hours) updateData.duration_hours = duration_hours
    if (address) updateData.address = address
    if (notes !== undefined) updateData.notes = notes

    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating booking:', updateError)
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

