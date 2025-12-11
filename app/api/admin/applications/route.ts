import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getProviderApplications, reviewProviderApplication } from '@/lib/actions/providers'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as any

    const applications = await getProviderApplications(status)

    return NextResponse.json(applications)
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch applications' },
      { status: 400 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { application_id, decision, admin_notes } = body

    if (!application_id || !decision) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await reviewProviderApplication(application_id, decision, admin_notes)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error reviewing application:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to review application' },
      { status: 400 }
    )
  }
}

