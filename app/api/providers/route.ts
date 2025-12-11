import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')
    const available = searchParams.get('available')

    let query = supabase
      .from('service_providers')
      .select(`
        *,
        service_category:service_categories (*),
        profiles:profile_id (
          id,
          full_name,
          avatar_url,
          email
        )
      `)

    if (categoryId) {
      query = query.eq('service_category_id', categoryId)
    }

    if (available !== null) {
      query = query.eq('available', available === 'true')
    }

    const { data: providers, error } = await query
      .order('rating', { ascending: false })

    if (error) {
      console.error('Error fetching providers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch providers' },
        { status: 500 }
      )
    }

    return NextResponse.json(providers)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

