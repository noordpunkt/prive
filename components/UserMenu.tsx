'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SmallButton } from '@/components/ui/small-button'
import { AuthModal } from '@/components/AuthModal'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    
    const fetchProfile = async (userId: string): Promise<any> => {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single()
        
        if (error) {
          console.error('Error fetching profile:', error)
          return null
        }
        
        return profileData
      } catch (err) {
        console.error('Error fetching profile:', err)
        return null
      }
    }
    
    const updateUserState = async (session: any) => {
      if (session?.user) {
        console.log('✅ Setting user:', session.user.email)
        setUser(session.user)
        setLoading(false)
        // Fetch profile in background
        fetchProfile(session.user.id).then(profileData => {
          console.log('📋 Profile fetch result:', profileData)
          setProfile(profileData)
        })
      } else {
        console.log('❌ No user - clearing state')
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }
    
    // Get initial session - check immediately, no delays
    supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }) => {
      console.log('🔐 Initial session check:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        error: sessionError 
      })
      
      await updateUserState(session)
    }).catch((error) => {
      console.error('❌ Error getting session:', error)
      setLoading(false)
    })

    // Listen for auth changes - this fires immediately on mount and on any auth change
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 Auth state changed:', _event, session?.user?.email)
      await updateUserState(session)
      // Force a re-render
      router.refresh()
    })

    // Also listen for custom auth state change event
    const handleAuthStateChange = () => {
      console.log('🔄 Custom auth state change event')
      supabase.auth.getSession().then(({ data: { session } }) => {
        updateUserState(session)
      })
    }
    
    window.addEventListener('auth-state-changed', handleAuthStateChange)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('auth-state-changed', handleAuthStateChange)
    }
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  // Debug logging
  console.log('🔍 UserMenu render:', { 
    loading, 
    hasUser: !!user, 
    userId: user?.id,
    userEmail: user?.email,
    hasProfile: !!profile,
    profileFullName: profile?.full_name
  })

  if (loading) {
    console.log('⏳ UserMenu: Loading...')
    return (
      <div className="flex gap-4 items-center">
        <div className="h-12 w-20 bg-muted animate-pulse" />
        <div className="h-12 w-24 bg-muted animate-pulse" />
      </div>
    )
  }

  if (user) {
    // Get name from profiles table - this is the source of truth
    const displayName = profile?.full_name?.trim() || user.email?.split('@')[0] || 'USER'
    
    console.log('✅ UserMenu: User logged in! Displaying:', displayName)
    
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-au-bold)' }}>
          Hi {displayName}!
        </span>
        <SmallButton 
          variant="ghost" 
          size="sm" 
          onClick={async () => {
            console.log('🚪 Signing out...')
            await handleSignOut()
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </SmallButton>
      </div>
    )
  }

  console.log('❌ UserMenu: No user - showing sign in buttons')

  return (
    <>
      <Button 
        onClick={() => {
          setAuthModalOpen(true)
        }}
      >
        Get Started
      </Button>
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />
    </>
  )
}

