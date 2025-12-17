'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Star, MapPin, Euro, Clock, X, Upload, Trash2, Image as ImageIcon, Check } from 'lucide-react'
import { uploadProviderImage, deleteProviderImage, setCoverImage } from '@/lib/actions/providers'

interface Provider {
  id: string
  business_name: string | null
  bio: string | null
  hourly_rate: number
  total_hours: number | null
  rating: number
  total_reviews: number
  available: boolean
  status: string
  service_area: string[] | null
  portfolio_images: string[] | null
  cover_image_index: number | null
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
  const [editingField, setEditingField] = useState<{ providerId: string; field: 'business_name' | 'bio' | 'service_area' | 'hourly_rate' | 'total_hours' } | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const [sliderValue, setSliderValue] = useState<number[]>([0])
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({})
  const [managingImages, setManagingImages] = useState<string | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

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

  // Set cursor to end of input when modal opens and initialize slider values
  useEffect(() => {
    if (modalOpen && editingField?.field === 'business_name' && titleInputRef.current) {
      setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus()
          // Only set selection range for text inputs, not number inputs
          if (titleInputRef.current.type !== 'number') {
            titleInputRef.current.setSelectionRange(
              titleInputRef.current.value.length,
              titleInputRef.current.value.length
            )
          }
        }
      }, 100)
    } else if (modalOpen && editingField) {
      // Initialize slider values when opening panel
      const provider = providers.find(p => p.id === editingField.providerId)
      if (provider) {
        if (editingField.field === 'hourly_rate') {
          setSliderValue([Math.max(20, provider.hourly_rate || 100)])
        } else if (editingField.field === 'total_hours') {
          setSliderValue([provider.total_hours || 2])
        }
      }
    }
  }, [modalOpen, editingField, providers])

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

  const handleUpdateField = async (providerId: string, field: 'business_name' | 'bio' | 'service_area' | 'hourly_rate' | 'total_hours', value: string | number) => {
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      
      console.log('Updating provider:', providerId, 'field:', field, 'value:', value)
      
      let updateData: any = {}
      
      if (field === 'service_area') {
        // Parse comma-separated locations into array
        const locations = String(value)
          .split(',')
          .map(loc => loc.trim())
          .filter(loc => loc.length > 0)
        updateData.service_area = locations.length > 0 ? locations : null
      } else if (field === 'hourly_rate') {
        // Handle hourly rate from slider (number) or string
        const rate = typeof value === 'number' ? value : parseFloat(value.toString().trim())
        if (isNaN(rate) || rate < 20) {
          throw new Error('Invalid price. Minimum price is €20.')
        }
        updateData.hourly_rate = rate
      } else if (field === 'total_hours') {
        // Handle total hours from slider (number) or string
        const hours = typeof value === 'number' ? value : parseFloat(value.toString().trim())
        if (isNaN(hours) || hours <= 0) {
          throw new Error('Invalid hours. Please enter a valid number greater than 0.')
        }
        updateData.total_hours = hours
      } else {
        updateData[field] = typeof value === 'string' ? value.trim() || null : value
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

  const handleImageUpload = async (providerId: string, file: File) => {
    setUploadingImages(prev => ({ ...prev, [providerId]: true }))
    setError(null)

    try {
      const imageUrl = await uploadProviderImage(providerId, file)
      
      // Reload providers
      const supabase = createClient()
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
        throw new Error(`Failed to reload providers: ${fetchError.message}`)
      }
      
      setProviders(updatedProviders || [])
      setShowSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploadingImages(prev => ({ ...prev, [providerId]: false }))
    }
  }

  const handleApproveProvider = async (providerId: string) => {
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { error: updateError } = await supabase
        .from('service_providers')
        .update({ status: 'approved' })
        .eq('id', providerId)

      if (updateError) {
        throw new Error(`Failed to approve provider: ${updateError.message}`)
      }

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
        throw new Error(`Failed to reload providers: ${fetchError.message}`)
      }
      
      setProviders(updatedProviders || [])
      setShowSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve provider')
    } finally {
      setSaving(false)
    }
  }

  const handleImageDelete = async (providerId: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return
    }

    setError(null)

    try {
      await deleteProviderImage(providerId, imageUrl)
      
      // Reload providers
      const supabase = createClient()
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
        throw new Error(`Failed to reload providers: ${fetchError.message}`)
      }
      
      setProviders(updatedProviders || [])
      setShowSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image')
    }
  }

  const handleSetCoverImage = async (providerId: string, imageIndex: number) => {
    setError(null)

    try {
      await setCoverImage(providerId, imageIndex)
      
      // Reload providers
      const supabase = createClient()
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
        throw new Error(`Failed to reload providers: ${fetchError.message}`)
      }
      
      setProviders(updatedProviders || [])
      setShowSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set cover image')
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
          <div className={`mb-8 flex ${modalOpen ? 'flex-col' : 'flex-col md:flex-row'} ${modalOpen ? '' : 'md:items-center md:justify-between'} gap-4`}>
            <div>
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-au-bold)' }}
              >
                Manage Providers
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
                View and manage all service providers
              </p>
            </div>
            <Button variant="outline" asChild className="w-full md:w-auto">
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
                          <div className="flex-1 w-full">
                            {/* Business Name / Experience Title - Clickable Box */}
                            <div 
                              onClick={() => {
                                setEditingField({ providerId: provider.id, field: 'business_name' })
                                setEditingValue(provider.business_name || '')
                                setModalOpen(true)
                              }}
                              className={`mb-3 pb-3 border-b cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors ${
                                modalOpen && editingField?.providerId === provider.id && editingField?.field === 'business_name'
                                  ? 'border-black dark:border-white'
                                  : 'border-black/10 dark:border-white/10'
                              }`}
                            >
                              <h3 className="text-xl font-bold text-left">
                                {displayName}
                              </h3>
                            </div>
                            
                            {/* Status and Available - Left aligned text below title */}
                            <div className="flex flex-col gap-1 mb-3 pb-3 border-b border-black/10 dark:border-white/10">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {provider.status === 'approved' ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : provider.status === 'pending_approval' ? (
                                    <Clock className="w-4 h-4 text-orange-500" />
                                  ) : (
                                    <X className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className={`text-sm ${
                                    provider.status === 'approved'
                                      ? 'text-green-500'
                                      : provider.status === 'pending_approval'
                                      ? 'text-orange-500'
                                      : 'text-red-500'
                                  }`}>
                                    {provider.status === 'approved' 
                                      ? 'Approved' 
                                      : provider.status === 'pending_approval'
                                      ? 'Pending approval'
                                      : provider.status === 'rejected'
                                      ? 'Rejected'
                                      : provider.status === 'suspended'
                                      ? 'Suspended'
                                      : provider.status}
                                  </span>
                                </div>
                                {provider.status === 'pending_approval' && (
                                  <button
                                    onClick={() => handleApproveProvider(provider.id)}
                                    disabled={saving}
                                    className="h-7 px-3 text-xs bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 font-sans border border-black/10 dark:border-white/10 rounded-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    style={{ fontFamily: 'inherit' }}
                                  >
                                    Approve
                                  </button>
                                )}
                              </div>
                              <span className={`text-sm ${
                                provider.available 
                                  ? 'text-black dark:text-white' 
                                  : 'text-muted-foreground'
                              }`}>
                                {provider.available ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Price Row - Clickable like title */}
                          <div 
                            onClick={() => {
                              setEditingField({ providerId: provider.id, field: 'hourly_rate' })
                              setEditingValue(provider.hourly_rate?.toString() || '')
                              setModalOpen(true)
                            }}
                            className={`py-3 pb-3 border-b cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors ${
                              modalOpen && editingField?.providerId === provider.id && editingField?.field === 'hourly_rate'
                                ? 'border-black dark:border-white'
                                : 'border-black/10 dark:border-white/10'
                            }`}
                          >
                            <span className="text-xl font-bold text-left" style={{ fontFamily: 'var(--font-au-bold)' }}>
                              €{provider.hourly_rate?.toFixed(2) || '0.00'}
                            </span>
                          </div>

                          {/* Location - Clickable like title and price */}
                          <div 
                            onClick={() => {
                              setEditingField({ providerId: provider.id, field: 'service_area' })
                              setEditingValue(provider.service_area?.join(', ') || '')
                              setModalOpen(true)
                            }}
                            className={`mt-3 py-3 pb-3 border-b cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors ${
                              modalOpen && editingField?.providerId === provider.id && editingField?.field === 'service_area'
                                ? 'border-black dark:border-white'
                                : 'border-black/10 dark:border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-left" style={{ fontFamily: 'var(--font-au-regular)' }}>
                                {provider.service_area && provider.service_area.length > 0
                                  ? provider.service_area.join(', ')
                                  : 'No location set'}
                              </span>
                            </div>
                          </div>

                          {/* Duration - Clickable like title and price */}
                          <div 
                            onClick={() => {
                              setEditingField({ providerId: provider.id, field: 'total_hours' })
                              setSliderValue([provider.total_hours || 2])
                              setModalOpen(true)
                            }}
                            className={`mt-3 py-3 pb-3 border-b cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors ${
                              modalOpen && editingField?.providerId === provider.id && editingField?.field === 'total_hours'
                                ? 'border-black dark:border-white'
                                : 'border-black/10 dark:border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-left" style={{ fontFamily: 'var(--font-au-regular)' }}>
                                {provider.total_hours ? `${provider.total_hours}h` : '2h'}
                              </span>
                            </div>
                          </div>

                          {/* Description - Clickable like title and price */}
                          <div 
                            onClick={() => {
                              setEditingField({ providerId: provider.id, field: 'bio' })
                              setEditingValue(provider.bio || '')
                              setModalOpen(true)
                            }}
                            className={`mt-3 py-3 pb-3 border-b cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors ${
                              modalOpen && editingField?.providerId === provider.id && editingField?.field === 'bio'
                                ? 'border-black dark:border-white'
                                : 'border-black/10 dark:border-white/10'
                            }`}
                          >
                            {provider.bio ? (
                              <p className="text-sm text-left line-clamp-2" style={{ fontFamily: 'var(--font-au-light)' }}>
                                {provider.bio}
                              </p>
                            ) : (
                              <p className="text-sm text-left italic text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>No description</p>
                            )}
                          </div>

                          {/* Image Management Section */}
                          <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Portfolio Images ({provider.portfolio_images?.length || 0}/6)
                              </h4>
                              {managingImages === provider.id ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setManagingImages(null)}
                                  className="h-6 px-2 text-xs"
                                >
                                  Done
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setManagingImages(provider.id)}
                                  className="h-6 px-2 text-xs"
                                >
                                  Manage Images
                                </Button>
                              )}
                            </div>

                            {managingImages === provider.id && (
                              <div className="space-y-3">
                                {/* Existing Images Grid */}
                                {provider.portfolio_images && provider.portfolio_images.length > 0 && (
                                  <div className="grid grid-cols-3 gap-2">
                                    {provider.portfolio_images.map((imageUrl, index) => {
                                      const isCover = provider.cover_image_index === index || 
                                                      (provider.cover_image_index === null && index === 0)
                                      return (
                                        <div key={index} className="relative group">
                                          <img
                                            src={imageUrl}
                                            alt={`Portfolio ${index + 1}`}
                                            className={`w-full h-24 object-cover border-2 ${
                                              isCover 
                                                ? 'border-green-500' 
                                                : 'border-transparent'
                                            }`}
                                          />
                                          {isCover && (
                                            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5">
                                              Cover
                                            </div>
                                          )}
                                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            {!isCover && (
                                              <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleSetCoverImage(provider.id, index)}
                                                className="h-7 px-2 text-xs"
                                              >
                                                Set Cover
                                              </Button>
                                            )}
                                            <Button
                                              size="sm"
                                              variant="destructive"
                                              onClick={() => handleImageDelete(provider.id, imageUrl)}
                                              className="h-7 px-2 text-xs"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}

                                {/* Upload Button */}
                                {(!provider.portfolio_images || provider.portfolio_images.length < 6) && (
                                  <div>
                                    <input
                                      ref={(el) => {
                                        fileInputRefs.current[provider.id] = el
                                      }}
                                      type="file"
                                      accept="image/jpeg,image/png,image/webp,image/gif"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                          handleImageUpload(provider.id, file)
                                          e.target.value = '' // Reset input
                                        }
                                      }}
                                      disabled={uploadingImages[provider.id]}
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => fileInputRefs.current[provider.id]?.click()}
                                      disabled={uploadingImages[provider.id]}
                                      className="w-full"
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      {uploadingImages[provider.id] ? 'Uploading...' : 'Upload Image'}
                                    </Button>
                                  </div>
                                )}

                                {provider.portfolio_images && provider.portfolio_images.length === 0 && (
                                  <p className="text-xs text-muted-foreground text-center py-4">
                                    No images uploaded yet. Upload up to 6 images.
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Preview when not managing */}
                            {managingImages !== provider.id && provider.portfolio_images && provider.portfolio_images.length > 0 && (
                              <div className="flex gap-2 overflow-x-auto pb-2">
                                {provider.portfolio_images.slice(0, 3).map((imageUrl, index) => {
                                  const isCover = provider.cover_image_index === index || 
                                                  (provider.cover_image_index === null && index === 0)
                                  return (
                                    <div key={index} className="relative flex-shrink-0">
                                      <img
                                        src={imageUrl}
                                        alt={`Portfolio ${index + 1}`}
                                        className={`w-16 h-16 object-cover border ${
                                          isCover 
                                            ? 'border-green-500' 
                                            : 'border-black/10 dark:border-white/10'
                                        }`}
                                      />
                                      {isCover && (
                                        <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-1">
                                          Cover
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                                {provider.portfolio_images.length > 3 && (
                                  <div className="w-16 h-16 flex items-center justify-center bg-muted text-muted-foreground text-xs">
                                    +{provider.portfolio_images.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
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
                        // Always allow the update - maxLength will prevent exceeding 30 on input
                        // This allows deletions even if current value is > 30
                        setEditingValue(value)
                      }}
                      onFocus={(e) => {
                        // Set cursor to end when focused
                        e.target.setSelectionRange(e.target.value.length, e.target.value.length)
                      }}
                      placeholder="Atelier raviolis maison & dîner gourmet à Nice"
                      className="w-full text-2xl md:text-3xl font-bold text-center mb-4"
                      disabled={saving}
                      maxLength={30}
                      style={{ fontFamily: 'var(--font-au-bold)' }}
                    />
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
                      Characters remaining: {Math.max(0, 30 - editingValue.length)}/30
                    </p>
                  </div>
                )}

                {editingField.field === 'hourly_rate' && (
                  <div className="w-full max-w-2xl mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-au-bold)' }}>
                        €{sliderValue[0].toFixed(0)}
                      </span>
                    </div>
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      min={20}
                      max={500}
                      step={5}
                      disabled={saving}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>€20</span>
                      <span>€500</span>
                    </div>
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
                  </div>
                )}

                {editingField.field === 'total_hours' && (
                  <div className="w-full max-w-2xl mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <Clock className="w-6 h-6 text-muted-foreground" />
                      <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-au-bold)' }}>
                        {sliderValue[0]}h
                      </span>
                    </div>
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      min={1}
                      max={4}
                      step={0.5}
                      disabled={saving}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>1h</span>
                      <span>4h</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button at Bottom */}
              <div className="border-t border-black/10 dark:border-white/10 p-6 flex justify-center">
                <Button
                  onClick={() => {
                    if (editingField.field === 'hourly_rate' || editingField.field === 'total_hours') {
                      handleUpdateField(editingField.providerId, editingField.field, sliderValue[0])
                    } else {
                      handleUpdateField(editingField.providerId, editingField.field, editingValue)
                    }
                  }}
                  disabled={
                    saving || 
                    (editingField.field === 'business_name' && editingValue.length === 0) ||
                    (editingField.field === 'hourly_rate' && sliderValue[0] < 20) ||
                    (editingField.field === 'total_hours' && sliderValue[0] <= 0)
                  }
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

