import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { submitProviderApplication } from '@/lib/actions/providers'

export async function POST(request: Request) {
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
    
    const application = await submitProviderApplication(body)

    return NextResponse.json(application, { status: 201 })
  } catch (error: any) {
    console.error('Error submitting application:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 400 }
    )
  }
}

