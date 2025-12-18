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
import { deleteProviderImage, setCoverImage, addProviderImageUrl } from '@/lib/actions/providers'

interface Provider {
  id: string
  business_name: string | null
  bio: string | null
  price: number
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
  const [editingField, setEditingField] = useState<{ providerId: string; field: 'business_name' | 'bio' | 'service_area' | 'price' | 'total_hours' } | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const [sliderValue, setSliderValue] = useState<number[]>([0])
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({})
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
        if (editingField.field === 'price') {
          setSliderValue([Math.max(20, provider.price || 100)])
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

  const handleUpdateField = async (providerId: string, field: 'business_name' | 'bio' | 'service_area' | 'price' | 'total_hours', value: string | number) => {
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
      } else if (field === 'price') {
        // Handle price from slider (number) or string
        const rate = typeof value === 'number' ? value : parseFloat(value.toString().trim())
        if (isNaN(rate) || rate < 20) {
          throw new Error('Invalid price. Minimum price is €20.')
        }
        updateData.price = rate
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
      const supabase = createClient()
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.')
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 5MB.')
      }

      // Get current provider to check image count
      const { data: provider } = await supabase
        .from('service_providers')
        .select('portfolio_images')
        .eq('id', providerId)
        .single()

      if (!provider) {
        throw new Error('Provider not found')
      }

      const currentImages = provider.portfolio_images || []
      if (currentImages.length >= 6) {
        throw new Error('Maximum 6 images allowed per provider')
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${providerId}-${Date.now()}.${fileExt}`
      const filePath = `${providerId}/${fileName}`

      // Upload directly to Supabase Storage from client
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('provider-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Failed to upload: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('provider-images')
        .getPublicUrl(filePath)

      // Add image URL to database via Server Action (small payload)
      await addProviderImageUrl(providerId, publicUrl)
      
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
      <div className={`flex flex-col transition-all duration-300 flex-shrink-0 ${modalOpen ? 'w-full md:w-1/3' : 'w-full'}`}>
        <Header />
        
        <main className="pt-24 flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          <div className={`mb-8 flex ${modalOpen ? 'flex-col' : 'flex-col md:flex-row'} ${modalOpen ? '' : 'md:items-center md:justify-between'} gap-4`}>
            <div>
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-au-bold)' }}
              >
                Providers
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
            <Card className="mb-6 shadow-none border-rose-500">
              <CardContent className="p-6">
                <p className="text-rose-500">{error}</p>
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
                    <CardContent className="p-4 sm:p-6">
                      <div className={`flex items-start gap-4 sm:gap-6 ${modalOpen ? 'flex-col' : 'flex-col sm:flex-row'}`}>
                        {/* Avatar */}
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
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
                              <h3 className="text-lg sm:text-xl font-bold text-left">
                                {displayName}
                              </h3>
                            </div>
                            
                            {/* Status and Available - Left aligned text below title */}
                            <div className="flex flex-col gap-1 mb-3 pb-3 border-b border-black/10 dark:border-white/10">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {provider.status === 'approved' ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : provider.status === 'pending_approval' ? (
                                    <Clock className="w-4 h-4 text-orange-500" />
                                  ) : (
                                    <X className="w-4 h-4 text-rose-500" />
                                  )}
                                  <span className={`text-sm ${
                                    provider.status === 'approved'
                                      ? 'text-green-500'
                                      : provider.status === 'pending_approval'
                                      ? 'text-orange-500'
                                      : 'text-rose-500'
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
                                    className="h-7 px-3 text-xs bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 font-sans border border-black/10 dark:border-white/10 rounded-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
                                    style={{ fontFamily: 'inherit' }}
                                  >
                                    Approve
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 flex items-center justify-center">
                                  <div className={`w-2 h-2 rounded-full animate-pulse-slow ${
                                    provider.available ? 'bg-green-500' : 'bg-rose-500'
                                  }`}></div>
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
                          </div>
                          
                          {/* Price Row - Clickable like title */}
                          <div 
                            onClick={() => {
                              setEditingField({ providerId: provider.id, field: 'price' })
                              setEditingValue(provider.price?.toString() || '')
                              setModalOpen(true)
                            }}
                            className={`py-3 pb-3 border-b cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors ${
                              modalOpen && editingField?.providerId === provider.id && editingField?.field === 'price'
                                ? 'border-black dark:border-white'
                                : 'border-black/10 dark:border-white/10'
                            }`}
                          >
                            <span className="text-lg sm:text-xl font-bold text-left font-mono" style={{ fontFamily: 'var(--font-source-code-pro)' }}>
                              €{provider.price?.toFixed(2) || '0.00'}
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
                            <span className="text-sm text-left font-mono" style={{ fontFamily: 'var(--font-source-code-pro)' }}>
                              {provider.total_hours ? `${provider.total_hours}h` : '2h'}
                            </span>
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
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Portfolio Images ({provider.portfolio_images?.length || 0}/6)
                              </h4>
                            </div>

                            <div className="space-y-3">
                              {/* 6 Image Holders Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {Array.from({ length: 6 }).map((_, index) => {
                                  const imageUrl = provider.portfolio_images?.[index]
                                  const isCover = provider.cover_image_index === index || 
                                                  (provider.cover_image_index === null && index === 0 && imageUrl)
                                  const isEmpty = !imageUrl
                                  const canUpload = !provider.portfolio_images || provider.portfolio_images.length < 6
                                  
                                  return (
                                    <div 
                                      key={index} 
                                      className={`relative group aspect-video ${
                                        isEmpty 
                                          ? 'border-2 border-dashed border-neutral-300 dark:border-neutral-700' 
                                          : ''
                                      }`}
                                    >
                                      {imageUrl ? (
                                        <>
                                          <img
                                            src={imageUrl}
                                            alt={`Portfolio ${index + 1}`}
                                            className={`w-full h-full object-cover border-2 ${
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
                                          {!isCover && (
                                            <button
                                              onClick={() => handleSetCoverImage(provider.id, index)}
                                              className="absolute top-3 left-3 text-white text-sm font-bold hover:opacity-80 transition-opacity z-10"
                                              style={{ fontFamily: 'var(--font-au-bold)' }}
                                            >
                                              Set Cover
                                            </button>
                                          )}
                                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                            <button
                                              onClick={() => handleImageDelete(provider.id, imageUrl)}
                                              className="flex items-center justify-center p-2 hover:opacity-80 transition-opacity"
                                              aria-label="Delete image"
                                            >
                                              <Trash2 className="w-6 h-6 text-white" />
                                            </button>
                                          </div>
                                        </>
                                      ) : (
                                        <div 
                                          className={`w-full h-full flex items-center justify-center ${
                                            index === (provider.portfolio_images?.length || 0) && canUpload
                                              ? 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors'
                                              : ''
                                          }`}
                                          onClick={() => {
                                            if (index === (provider.portfolio_images?.length || 0) && canUpload && !uploadingImages[provider.id]) {
                                              fileInputRefs.current[provider.id]?.click()
                                            }
                                          }}
                                        >
                                          {index === (provider.portfolio_images?.length || 0) && canUpload && !uploadingImages[provider.id] && (
                                            <div className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
                                              <Upload className="w-5 h-5 mx-auto mb-1" />
                                              <span>Upload</span>
                                            </div>
                                          )}
                                          {index === (provider.portfolio_images?.length || 0) && uploadingImages[provider.id] && (
                                            <div className="text-xs text-muted-foreground text-center">
                                              Uploading...
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>

                              {/* Hidden File Input */}
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
                                disabled={uploadingImages[provider.id] || (provider.portfolio_images?.length || 0) >= 6}
                              />
                            </div>
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
          {/* Side Panel - Full width on mobile, 2/3 width on desktop, slides from right */}
          <div className="fixed top-0 right-0 h-full w-full md:w-2/3 bg-background z-50 shadow-xl flex flex-col slide-in-from-right overflow-y-auto">
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
                <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 overflow-y-auto">
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
                      className="w-full text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4"
                      disabled={saving}
                      maxLength={30}
                      style={{ fontFamily: 'var(--font-au-bold)' }}
                    />
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
                      Characters remaining: {Math.max(0, 30 - editingValue.length)}/30
                    </p>
                  </div>
                )}

                {editingField.field === 'price' && (
                  <div className="w-full max-w-2xl mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <span className="text-3xl sm:text-4xl font-bold font-mono" style={{ fontFamily: 'var(--font-source-code-pro)' }}>
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
                      className="min-h-[300px] sm:min-h-[400px] w-full text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold resize-none"
                      disabled={saving}
                      maxLength={200}
                      style={{ fontFamily: 'var(--font-au-bold)' }}
                    />
                    <p className="text-sm text-muted-foreground mt-4" style={{ fontFamily: 'var(--font-au-light)' }}>
                      Characters remaining: {Math.max(0, 200 - editingValue.length)}/200
                    </p>
                  </div>
                )}

                {editingField.field === 'service_area' && (
                  <div className="w-full max-w-2xl text-center">
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      placeholder="Monaco, Montecarlo"
                      className="w-full text-xl sm:text-2xl md:text-3xl font-semibold text-center mb-4"
                      disabled={saving}
                    />
                  </div>
                )}

                {editingField.field === 'total_hours' && (
                  <div className="w-full max-w-2xl mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <span className="text-3xl sm:text-4xl font-bold font-mono" style={{ fontFamily: 'var(--font-source-code-pro)' }}>
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
              <div className="border-t border-black/10 dark:border-white/10 p-4 sm:p-6 flex justify-center">
                <Button
                  onClick={() => {
                    if (editingField.field === 'price' || editingField.field === 'total_hours') {
                      handleUpdateField(editingField.providerId, editingField.field, sliderValue[0])
                    } else {
                      handleUpdateField(editingField.providerId, editingField.field, editingValue)
                    }
                  }}
                  disabled={
                    saving || 
                    (editingField.field === 'business_name' && editingValue.length === 0) ||
                    (editingField.field === 'price' && sliderValue[0] < 20) ||
                    (editingField.field === 'total_hours' && sliderValue[0] <= 0)
                  }
                  className="w-full sm:w-1/2 md:w-1/3"
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

