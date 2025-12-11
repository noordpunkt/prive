import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    
    const { data: category, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .single()

    if (error || !category) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Get providers for this service category
    const { data: providers } = await supabase
      .from('service_providers')
      .select(`
        *,
        profiles:profile_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('service_category_id', category.id)
      .eq('available', true)
      .order('rating', { ascending: false })

    return NextResponse.json({
      category,
      providers: providers || []
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

