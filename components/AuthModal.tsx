'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp, signIn } from '@/lib/actions/auth'
import { useRouter } from 'next/navigation'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Reset error when modal opens/closes
  useEffect(() => {
    if (!open) {
      setError(null)
      setSuccess(false)
      setSuccessMessage('')
      setActiveTab('signup')
    }
  }, [open])

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
  })

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  })

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setSuccess(false)

    // Validation
    if (!signUpData.name || !signUpData.email || !signUpData.password) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (signUpData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      await signUp(
        signUpData.email,
        signUpData.password,
        signUpData.name
      )
      // Show success message and keep modal open
      setSuccess(true)
      setSuccessMessage('Account created successfully! Signing you in...')
      setLoading(true)
      
      // Wait for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Trigger auth state check
      window.dispatchEvent(new Event('auth-state-changed'))
      
      // Wait a bit more for UserMenu to update
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Close modal and refresh
      onOpenChange(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setSuccess(false)

    if (!signInData.email || !signInData.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      await signIn(signInData.email, signInData.password)
      // Show success message
      setSuccess(true)
      setSuccessMessage('Signing you in...')
      setLoading(true)
      
      // Wait for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Trigger auth state check
      window.dispatchEvent(new Event('auth-state-changed'))
      
      // Close modal first
      onOpenChange(false)
      
      // Wait a bit more for auth to settle
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Force a hard navigation to ensure redirect works
      // Check if this is the admin user
      const ADMIN_USER_EMAIL = 'privealacarte@gmail.com'
      if (signInData.email === ADMIN_USER_EMAIL) {
        window.location.href = '/admin'
      } else {
        window.location.href = '/'
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border p-0 overflow-hidden min-h-[450px]"
        showCloseButton={false}
      >
        {/* Dialog Title for accessibility */}
        <DialogTitle className="sr-only">
          Authentication
        </DialogTitle>

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full size-8 flex items-center justify-center opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10 bg-background/50 hover:bg-background/80"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Content */}
        <div className="p-6 pt-16 min-h-[450px] flex flex-col">
          {success ? (
            // Success state - only show centered message
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg text-center font-semibold" style={{ fontFamily: 'var(--font-au-bold)' }}>
                {successMessage}
              </p>
            </div>
          ) : (
            // Normal state - show tabs with forms
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signup">Register</TabsTrigger>
                <TabsTrigger value="signin">Sign In</TabsTrigger>
              </TabsList>

              {error && (
                <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 mb-6" style={{ fontFamily: 'var(--font-au-regular)' }}>
                  {error}
                </div>
              )}

              <TabsContent value="signup" className="flex-1 mt-0">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                      className="bg-white/5 backdrop-blur-sm border-white/10"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      className="bg-white/5 backdrop-blur-sm border-white/10"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      className="bg-white/5 backdrop-blur-sm border-white/10"
                      disabled={loading}
                      required
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full relative" loading={loading}>
                    Register
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signin" className="flex-1 mt-0">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      className="bg-white/5 backdrop-blur-sm border-white/10"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      className="bg-white/5 backdrop-blur-sm border-white/10"
                      disabled={loading}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full relative" loading={loading}>
                    Sign in
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
