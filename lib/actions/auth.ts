'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(
  email: string, 
  password: string, 
  name?: string
) {
  const supabase = await createClient()
  
  const fullName = name?.trim() || ''
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: undefined, // Disable email confirmation redirect
    },
  })

  if (error) {
    throw new Error(`Sign up failed: ${error.message}`)
  }

  if (!data.user) {
    throw new Error('Sign up failed: User was not created')
  }

  // Wait a bit for the trigger to create the profile
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Ensure profile exists - create it if trigger didn't work
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .single()
  
  if (!existingProfile) {
    // Profile wasn't created by trigger, create it manually
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email || email,
        full_name: fullName,
        role: 'customer'
      })
    
    if (insertError) {
      console.error('Error creating profile:', insertError)
      throw new Error(`Failed to create user profile: ${insertError.message}`)
    }
  } else if (fullName) {
    // Profile exists, update with full name
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', data.user.id)
    
    if (updateError) {
      console.error('Error updating profile:', updateError)
      // Don't fail signup if profile update fails
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(`Sign in failed: ${error.message}`)
  }

  // Get user profile to determine redirect
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Redirect based on role
    if (profile?.role === 'provider') {
      redirect('/provider/dashboard')
    } else if (profile?.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/')
    }
  } else {
    redirect('/')
  }
}

export async function signOut() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(`Sign out failed: ${error.message}`)
  }

  redirect('/')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    return null
  }

  if (!user) {
    return null
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    ...user,
    profile,
  }
}

