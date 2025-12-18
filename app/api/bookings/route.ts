import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's bookings (both as customer and provider)
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service_category:service_categories (*),
        provider:service_providers (
          id,
          business_name,
          price,
          profiles:profile_id (
            id,
            full_name,
            avatar_url
          )
        ),
        customer:profiles!bookings_customer_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .or(`customer_id.eq.${user.id},provider.profile_id.eq.${user.id}`)
      .order('scheduled_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      provider_id,
      service_category_id,
      scheduled_at,
      duration_hours,
      address,
      notes
    } = body

    // Validate required fields
    if (!provider_id || !service_category_id || !scheduled_at || !duration_hours || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get provider to calculate price
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('price')
      .eq('id', provider_id)
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    // Price is fixed per service/experience, not per hour
    const total_price = provider.price || 0

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        customer_id: user.id,
        provider_id,
        service_category_id,
        scheduled_at,
        duration_hours,
        total_price,
        address,
        notes: notes || null,
        status: 'pending'
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

