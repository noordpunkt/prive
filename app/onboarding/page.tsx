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
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Upload, Trash2, Image as ImageIcon, Check } from 'lucide-react'
import { SERVICE_CATEGORIES } from '@/types/services'
import { saveOnboardingData } from '@/lib/actions/onboarding'

interface ProfileData {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
}

interface ProviderData {
  id?: string
  business_name: string | null
  bio: string | null
  price: number
  total_hours: number | null
  service_area: string[] | null
  portfolio_images: string[] | null
  cover_image_index: number | null
  service_category_id: string | null
}

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [provider, setProvider] = useState<ProviderData>({
    business_name: null,
    bio: null,
    price: 100,
    total_hours: 2,
    service_area: null,
    portfolio_images: null,
    cover_image_index: null,
    service_category_id: null,
  })
  
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({}) // slug -> id
  const [uploadingImages, setUploadingImages] = useState(false)
  const [locationInput, setLocationInput] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/')
        return
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Load existing provider data if exists
      const { data: providerData } = await supabase
        .from('service_providers')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle()

      if (providerData) {
        setProvider({
          id: providerData.id,
          business_name: providerData.business_name,
          bio: providerData.bio,
          price: providerData.price || 100,
          total_hours: providerData.total_hours || 2,
          service_area: providerData.service_area,
          portfolio_images: providerData.portfolio_images,
          cover_image_index: providerData.cover_image_index,
          service_category_id: providerData.service_category_id,
        })
        setLocationInput(providerData.service_area?.join(', ') || '')
        setSelectedCategory(providerData.service_category_id || '')
      }

      // Load category IDs from database
      const { data: categories } = await supabase
        .from('service_categories')
        .select('id, slug')
        .eq('active', true)

      if (categories) {
        const map: Record<string, string> = {}
        categories.forEach(cat => {
          map[cat.slug] = cat.id
        })
        setCategoryMap(map)
      }

      setLoading(false)
    }

    loadUserData()
  }, [router])

  const handleImageUpload = async (file: File) => {
    if ((provider.portfolio_images?.length || 0) >= 6) {
      setError('Maximum 6 images allowed')
      return
    }

    setUploadingImages(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('provider-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('provider-images')
        .getPublicUrl(filePath)

      // Update local state
      const currentImages = provider.portfolio_images || []
      setProvider({
        ...provider,
        portfolio_images: [...currentImages, publicUrl],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleImageDelete = (imageUrl: string) => {
    const currentImages = provider.portfolio_images || []
    const newImages = currentImages.filter(url => url !== imageUrl)
    const newCoverIndex = provider.cover_image_index !== null && 
                          provider.cover_image_index >= newImages.length 
                          ? null 
                          : provider.cover_image_index
    
    setProvider({
      ...provider,
      portfolio_images: newImages.length > 0 ? newImages : null,
      cover_image_index: newCoverIndex,
    })
  }

  const handleSetCoverImage = (index: number) => {
    setProvider({
      ...provider,
      cover_image_index: index,
    })
  }

  const handleAvatarUpload = async (file: File) => {
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      if (profile) {
        setProfile({ ...profile, avatar_url: publicUrl })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
    }
  }

  const handleSave = async () => {
    if (!selectedCategory) {
      setError('Please select a service category')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await saveOnboardingData({
        profile: {
          full_name: profile?.full_name || null,
        },
        provider: {
          service_category_id: selectedCategory,
          business_name: provider.business_name || null,
          bio: provider.bio || null,
          price: provider.price,
          total_hours: provider.total_hours || 2,
          service_area: locationInput.trim()
            ? locationInput
                .split(',')
                .map(loc => loc.trim())
                .filter(loc => loc.length > 0)
            : null,
          portfolio_images: provider.portfolio_images || null,
          cover_image_index: provider.cover_image_index || null,
        },
      })

      setShowSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-32">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          <div className="mb-8">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-au-bold)' }}
            >
              Complete Your Profile
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
              Set up your service provider profile
            </p>
          </div>

          {error && (
            <Card className="mb-6 shadow-none border-rose-500">
              <CardContent className="p-6">
                <p className="text-rose-500">{error}</p>
              </CardContent>
            </Card>
          )}

          {showSuccess && (
            <Card className="mb-6 shadow-none border-green-500">
              <CardContent className="p-6">
                <p className="text-green-500">Profile saved successfully! Redirecting...</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-8">
            {/* Profile Section */}
            <Card className="shadow-none">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-au-bold)' }}>
                  Profile Information
                </h2>
                
                {/* Avatar */}
                <div className="mb-6">
                  <Label className="mb-2 block">Profile Photo</Label>
                  <div className="border border-black/10 dark:border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-muted text-muted-foreground text-2xl font-semibold">
                          {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => {
                        if (el) {
                          el.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) handleAvatarUpload(file)
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) handleAvatarUpload(file)
                        }
                        input.click()
                      }}
                    >
                      Upload Photo
                    </Button>
                  </div>
                </div>

                {/* Name */}
                <div className="mb-4">
                  <Label className="mb-2 block">Name</Label>
                  <Input
                    value={profile?.full_name || ''}
                    onChange={(e) => {
                      if (profile) {
                        setProfile({ ...profile, full_name: e.target.value })
                      }
                    }}
                    placeholder="Your name"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service Category Selection */}
            <Card className="shadow-none">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-au-bold)' }}>
                  Service Category
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SERVICE_CATEGORIES.map((category) => {
                    const categoryId = categoryMap[category.slug]
                    const isSelected = selectedCategory === categoryId
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          if (categoryId) {
                            setSelectedCategory(categoryId)
                          }
                        }}
                        className={`p-4 border-2 text-left transition-colors ${
                          isSelected
                            ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-900'
                            : 'border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'
                        }`}
                      >
                        <h3 className="font-semibold mb-1" style={{ fontFamily: 'var(--font-au-bold)' }}>
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
                          {category.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Service Provider Details */}
            <Card className="shadow-none">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-au-bold)' }}>
                  Service Details
                </h2>

                {/* Business Name / Title */}
                <div className="mb-6 pb-6 border-b border-black/10 dark:border-white/10">
                  <Label className="mb-2 block">Title</Label>
                  <Input
                    ref={titleInputRef}
                    value={provider.business_name || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value.length <= 30) {
                        setProvider({ ...provider, business_name: value })
                      }
                    }}
                    className="w-full text-xl sm:text-2xl md:text-3xl font-bold"
                    maxLength={30}
                    style={{ fontFamily: 'var(--font-au-bold)' }}
                  />
                  <p className="text-sm text-muted-foreground mt-2" style={{ fontFamily: 'var(--font-au-light)' }}>
                    Characters remaining: {Math.max(0, 30 - (provider.business_name?.length || 0))}/30
                  </p>
                </div>

                {/* Description */}
                <div className="mb-6 pb-6 border-b border-black/10 dark:border-white/10">
                  <Label className="mb-2 block">Description</Label>
                  <Textarea
                    ref={descriptionInputRef}
                    value={provider.bio || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value.length <= 200) {
                        setProvider({ ...provider, bio: value })
                      }
                    }}
                    className="min-h-[200px] w-full text-lg sm:text-xl md:text-2xl font-bold resize-none"
                    maxLength={200}
                    style={{ fontFamily: 'var(--font-au-bold)' }}
                  />
                  <p className="text-sm text-muted-foreground mt-2" style={{ fontFamily: 'var(--font-au-light)' }}>
                    Characters remaining: {Math.max(0, 200 - (provider.bio?.length || 0))}/200
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-black/10 dark:border-white/10">
                  <Label className="mb-4 block">Price</Label>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="text-3xl sm:text-4xl font-bold font-mono" style={{ fontFamily: 'var(--font-source-code-pro)' }}>
                      €{provider.price.toFixed(0)}
                    </span>
                  </div>
                  <Slider
                    value={[provider.price]}
                    onValueChange={(value) => setProvider({ ...provider, price: value[0] })}
                    min={20}
                    max={500}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>€20</span>
                    <span>€500</span>
                  </div>
                </div>

                {/* Duration */}
                <div className="mb-6 pb-6 border-b border-black/10 dark:border-white/10">
                  <Label className="mb-4 block">Duration</Label>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="text-3xl sm:text-4xl font-bold font-mono" style={{ fontFamily: 'var(--font-source-code-pro)' }}>
                      {provider.total_hours || 2}h
                    </span>
                  </div>
                  <Slider
                    value={[provider.total_hours || 2]}
                    onValueChange={(value) => setProvider({ ...provider, total_hours: value[0] })}
                    min={1}
                    max={4}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>1h</span>
                    <span>4h</span>
                  </div>
                </div>

                {/* Service Area */}
                <div className="mb-6 pb-6 border-b border-black/10 dark:border-white/10">
                  <Label className="mb-2 block">Location</Label>
                  <Input
                    value={locationInput}
                    onChange={(e) => {
                      setLocationInput(e.target.value)
                    }}
                    onBlur={(e) => {
                      // Parse locations when user leaves the field
                      const locations = e.target.value
                        .split(',')
                        .map(loc => loc.trim())
                        .filter(loc => loc.length > 0)
                      setProvider({
                        ...provider,
                        service_area: locations.length > 0 ? locations : null,
                      })
                    }}
                    className="w-full text-xl sm:text-2xl md:text-3xl font-semibold"
                  />
                </div>

                {/* Portfolio Images */}
                <div>
                  <Label className="mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Portfolio Images ({(provider.portfolio_images?.length || 0)}/6)
                  </Label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {Array.from({ length: 6 }).map((_, index) => {
                      const imageUrl = provider.portfolio_images?.[index]
                      const isCover = provider.cover_image_index === index || 
                                      (provider.cover_image_index === null && index === 0 && imageUrl)
                      const isEmpty = !imageUrl
                      const canUpload = (provider.portfolio_images?.length || 0) < 6
                      
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
                                  onClick={() => handleSetCoverImage(index)}
                                  className="absolute top-3 left-3 text-white text-sm font-bold hover:opacity-80 transition-opacity z-10"
                                  style={{ fontFamily: 'var(--font-au-bold)' }}
                                >
                                  Set Cover
                                </button>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                <button
                                  onClick={() => handleImageDelete(imageUrl)}
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
                                if (index === (provider.portfolio_images?.length || 0) && canUpload && !uploadingImages) {
                                  fileInputRef.current?.click()
                                }
                              }}
                            >
                              {index === (provider.portfolio_images?.length || 0) && canUpload && !uploadingImages && (
                                <div className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
                                  <Upload className="w-5 h-5 mx-auto mb-1" />
                                  <span>Upload</span>
                                </div>
                              )}
                              {index === (provider.portfolio_images?.length || 0) && uploadingImages && (
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

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleImageUpload(file)
                        e.target.value = ''
                      }
                    }}
                    disabled={uploadingImages || (provider.portfolio_images?.length || 0) >= 6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSave}
                disabled={saving || !selectedCategory}
                size="lg"
                className="w-full sm:w-1/2 md:w-1/3"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

