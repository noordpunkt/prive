'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Star, MapPin, Euro, Clock, X } from 'lucide-react'

interface Provider {
  id: string
  business_name: string | null
  bio: string | null
  hourly_rate: number
  rating: number
  total_reviews: number
  available: boolean
  status: string
  service_area: string[] | null
  service_category: {
    id: string
    name: string
    slug: string
  } | null
  profiles: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  } | null
}

export default function AdminProvidersPage() {
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<{ providerId: string; field: 'business_name' | 'bio' | 'service_area' } | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Handle fade out animation
  useEffect(() => {
    if (showSuccess) {
      const fadeTimer = setTimeout(() => {
        setFadeOut(true)
      }, 2500) // Start fading after 2.5 seconds
      
      const hideTimer = setTimeout(() => {
        setShowSuccess(false)
        setFadeOut(false)
      }, 3000) // Completely hide after 3 seconds

      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [showSuccess])

  // Set cursor to end of title input when modal opens
  useEffect(() => {
    if (modalOpen && editingField?.field === 'business_name' && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus()
        titleInputRef.current?.setSelectionRange(
          titleInputRef.current.value.length,
          titleInputRef.current.value.length
        )
      }, 100)
    }
  }, [modalOpen, editingField])

  useEffect(() => {
    async function checkAdminAndLoad() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/')
        return
      }

      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role !== 'admin') {
        router.push('/')
        return
      }

      // Load all providers (including non-approved)
      const { data: allProviders, error } = await supabase
        .from('service_providers')
        .select(`
          *,
          service_category:service_categories (
            id,
            name,
            slug
          ),
          profiles:profile_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        setError('Failed to load providers')
      } else {
        setProviders(allProviders || [])
      }
      setLoading(false)
    }

    checkAdminAndLoad()
  }, [router])

  const handleUpdateField = async (providerId: string, field: 'business_name' | 'bio' | 'service_area', value: string) => {
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      
      console.log('Updating provider:', providerId, 'field:', field, 'value:', value)
      
      let updateData: any = {}
      
      if (field === 'service_area') {
        // Parse comma-separated locations into array
        const locations = value
          .split(',')
          .map(loc => loc.trim())
          .filter(loc => loc.length > 0)
        updateData.service_area = locations.length > 0 ? locations : null
      } else {
        updateData[field] = value.trim() || null
      }
      
      console.log('Update data:', updateData)
      
      const { data, error: updateError } = await supabase
        .from('service_providers')
        .update(updateData)
        .eq('id', providerId)
        .select()

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error(`Failed to update ${field}: ${updateError.message}`)
      }

      console.log('Update successful:', data)

      setEditingField(null)
      setEditingValue('')
      setModalOpen(false)
      
      // Reload providers
      const { data: updatedProviders, error: fetchError } = await supabase
        .from('service_providers')
        .select(`
          *,
          service_category:service_categories (
            id,
            name,
            slug
          ),
          profiles:profile_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
      
      if (fetchError) {
        console.error('Fetch providers error:', fetchError)
        throw new Error(`Failed to reload providers: ${fetchError.message}`)
      }
      
      setProviders(updatedProviders || [])
      
      // Show success notification
      setShowSuccess(true)
    } catch (err) {
      console.error('Error in handleUpdateField:', err)
      setError(err instanceof Error ? err.message : `Failed to update ${field}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-16 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative flex overflow-hidden">
      {/* Main Content - 1/3 width when panel is open, full width otherwise */}
      <div className={`flex flex-col transition-all duration-300 flex-shrink-0 ${modalOpen ? 'w-1/3' : 'w-full'}`}>
        <Header />
        
        <main className="pt-24 flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-grand-medium)' }}
              >
                Manage Providers
              </h1>
              <p className="text-xl text-muted-foreground">
                View and manage all service providers
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/admin">Back to Dashboard</Link>
            </Button>
          </div>

          {error && (
            <Card className="mb-6 shadow-none border-red-500">
              <CardContent className="p-6">
                <p className="text-red-500">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Success Notification Pill */}
          {showSuccess && (
            <div 
              className={`fixed top-24 left-0 right-0 z-50 transition-opacity duration-300 animate-slide-down ${
                fadeOut ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div className="w-full">
                <div className="bg-green-500 text-white px-6 py-3 text-center font-medium">
                  Success! Changes saved successfully.
                </div>
              </div>
            </div>
          )}

          {/* Providers List */}
          {providers.length === 0 ? (
            <Card className="shadow-none">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground text-lg">
                  No providers found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {providers.map((provider) => {
                const displayName = provider.business_name || provider.profiles?.full_name || 'Provider'
                const avatarUrl = provider.profiles?.avatar_url
                
                return (
                  <Card key={provider.id} className="shadow-none">
                    <CardContent className="p-6">
                      <div className={`flex items-start gap-6 ${modalOpen ? 'flex-col' : ''}`}>
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={displayName}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-muted text-muted-foreground text-2xl font-semibold">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Provider Info */}
                        <div className="flex-1 w-full">
                          <div className={`flex items-start justify-between mb-2 ${modalOpen ? 'flex-col gap-2' : ''}`}>
                            <div className="flex-1 w-full">
                              {/* Business Name / Experience Title - Clickable Box */}
                              <div 
                                onClick={() => {
                                  setEditingField({ providerId: provider.id, field: 'business_name' })
                                  setEditingValue(provider.business_name || '')
                                  setModalOpen(true)
                                }}
                                className={`mb-1 p-3 border cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors ${
                                  modalOpen && editingField?.providerId === provider.id && editingField?.field === 'business_name'
                                    ? 'border-black dark:border-white'
                                    : 'border-black/10 dark:border-white/10'
                                }`}
                              >
                                <h3 className="text-xl font-bold">
                                  {displayName}
                                </h3>
                              </div>
                              {provider.service_category && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {provider.service_category.name}
                                </p>
                              )}
                            </div>
                            <div className={`flex gap-2 ${modalOpen ? 'flex-row' : 'flex-col items-end'}`}>
                              <span className={`px-2 py-1 text-xs font-medium ${
                                provider.status === 'approved'
                                  ? 'bg-green-500 text-white'
                                  : provider.status === 'pending_approval'
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-red-500 text-white'
                              }`}>
                                {provider.status}
                              </span>
                              {provider.available ? (
                                <span className="px-2 py-1 text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black">
                                  Available
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white">
                                  Unavailable
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Details */}
                          <div className={`flex gap-4 text-sm ${modalOpen ? 'flex-col' : 'flex-wrap'}`}>
                            {provider.hourly_rate && (
                              <div className="flex items-center gap-1">
                                <Euro className="w-4 h-4 text-muted-foreground" />
                                <span className="font-semibold">€{provider.hourly_rate.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-black dark:text-white fill-current" />
                              <span>{provider.rating.toFixed(1)}</span>
                              {provider.total_reviews > 0 && (
                                <span className="text-muted-foreground">
                                  ({provider.total_reviews})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {provider.service_area && provider.service_area.length > 0
                                  ? provider.service_area.join(', ')
                                  : 'No location set'}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingField({ providerId: provider.id, field: 'service_area' })
                                  setEditingValue(provider.service_area?.join(', ') || '')
                                  setModalOpen(true)
                                }}
                                className="h-6 px-2 text-xs ml-1"
                              >
                                Edit
                              </Button>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Min: 1h - Max: 4h
                              </span>
                            </div>
                          </div>

                          <div className="mt-3">
                            {provider.bio ? (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {provider.bio}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">No description</p>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingField({ providerId: provider.id, field: 'bio' })
                                setEditingValue(provider.bio || '')
                                setModalOpen(true)
                              }}
                              className="h-6 px-2 text-xs mt-1"
                            >
                              {provider.bio ? 'Edit' : 'Add'} Description
                            </Button>
                          </div>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
        </main>

        {!modalOpen && <Footer />}
      </div>

      {/* Edit Side Panel - Slides from Right */}
      {modalOpen && (
        <>
          {/* Side Panel - 2/3 width, slides from right */}
          <div className="fixed top-0 right-0 h-full w-2/3 bg-background z-50 shadow-xl flex flex-col slide-in-from-right overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setModalOpen(false)
                setTimeout(() => {
                  setEditingField(null)
                  setEditingValue('')
                }, 200)
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {editingField && (
              <>
                {/* Main Content Area */}
                <div className="flex-1 flex items-center justify-center p-12 overflow-y-auto">
                {editingField.field === 'business_name' && (
                  <div className="w-full text-center">
                    <Input
                      ref={titleInputRef}
                      value={editingValue}
                      onChange={(e) => {
                        const value = e.target.value
                        // Always allow the update - maxLength will prevent exceeding 50 on input
                        // This allows deletions even if current value is > 50
                        setEditingValue(value)
                      }}
                      onFocus={(e) => {
                        // Set cursor to end when focused
                        e.target.setSelectionRange(e.target.value.length, e.target.value.length)
                      }}
                      placeholder="Atelier raviolis maison & dîner gourmet à Nice"
                      className="w-full text-2xl md:text-3xl font-bold text-center mb-4"
                      disabled={saving}
                      maxLength={50}
                      style={{ fontFamily: 'var(--font-grand-medium)' }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Characters remaining: {Math.max(0, 50 - editingValue.length)}/50
                    </p>
                  </div>
                )}

                {editingField.field === 'bio' && (
                  <div className="w-full max-w-3xl">
                    <Textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      placeholder="Les voyageurs cuisineront avec un chef italo-méditerranéen et apprendront à façonner la pasta fresca transmise dans sa famille..."
                      className="min-h-[400px] w-full text-base resize-none"
                      disabled={saving}
                    />
                  </div>
                )}

                {editingField.field === 'service_area' && (
                  <div className="w-full max-w-2xl text-center">
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      placeholder="Nice, Cannes"
                      className="w-full text-2xl md:text-3xl font-semibold text-center mb-4"
                      disabled={saving}
                    />
                    <p className="text-sm text-muted-foreground">
                      Séparez les emplacements par des virgules
                    </p>
                  </div>
                )}
              </div>

              {/* Save Button at Bottom */}
              <div className="border-t border-black/10 dark:border-white/10 p-6 flex justify-center">
                <Button
                  onClick={() => handleUpdateField(editingField.providerId, editingField.field, editingValue)}
                  disabled={saving || (editingField.field === 'business_name' && editingValue.length === 0)}
                  className="w-1/3"
                  size="lg"
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

