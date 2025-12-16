'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  location: string | null
  role: string
}

export default function AdminProfilesPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

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

      // Load all profiles
      const { data: allProfiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError('Failed to load profiles')
      } else {
        setProfiles(allProfiles || [])
      }
      setLoading(false)
    }

    checkAdminAndLoad()
  }, [router])

  const handleUpdateName = async (profileId: string) => {
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      
      console.log('Updating profile:', profileId, 'with name:', editingName)
      
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: editingName || null })
        .eq('id', profileId)
        .select()

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error(`Failed to update name: ${updateError.message}`)
      }

      console.log('Update successful:', data)
      
      // Reload profiles
      const { data: updatedProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) {
        console.error('Fetch error after update:', fetchError)
        throw new Error(`Failed to reload profiles: ${fetchError.message}`)
      }
      
      setProfiles(updatedProfiles || [])
      setEditingProfileId(null)
      setEditingName('')
      
      // Show success notification
      setShowSuccess(true)
    } catch (err) {
      console.error('Error in handleUpdateName:', err)
      setError(err instanceof Error ? err.message : 'Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (profileId: string, file: File) => {
    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      console.log('Uploading file for profile:', profileId, 'File:', file.name, 'Size:', file.size)
      
      // Validate file
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.')
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 5MB.')
      }

      // Create filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${profileId}-${Date.now()}.${fileExt}`
      const filePath = `${profileId}/${fileName}`

      console.log('Uploading to path:', filePath)

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Failed to upload: ${uploadError.message}`)
      }

      console.log('Upload successful:', data)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      console.log('Public URL:', publicUrl)

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profileId)

      if (updateError) {
        console.error('Update profile error:', updateError)
        throw new Error(`Failed to update profile: ${updateError.message}`)
      }

      console.log('Profile updated successfully')

      // Reload profiles
      const { data: updatedProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) {
        console.error('Fetch profiles error:', fetchError)
        throw new Error(`Failed to reload profiles: ${fetchError.message}`)
      }
      
      setProfiles(updatedProfiles || [])
      setSelectedProfile(null)
      
      // Show success notification
      setShowSuccess(true)
    } catch (err) {
      console.error('Error in handleFileUpload:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload')
    } finally {
      setUploading(false)
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
      
      <main className="pt-24">
        <div className="container mx-auto px-4 py-16">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-grand-medium)' }}
              >
                Manage Profiles
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Upload profile pictures and manage user profiles
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

          {/* Profiles List */}
          <div className="space-y-4">
            {profiles.map((profile) => (
                  <Card key={profile.id} className="shadow-none">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.full_name || 'Profile'}
                              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-muted text-muted-foreground text-xl md:text-2xl font-semibold">
                              {(profile.full_name || profile.email || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 w-full md:w-auto">
                          {editingProfileId === profile.id ? (
                            <div className="mb-1">
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                placeholder={profile.full_name || 'Enter name'}
                                className="!text-lg md:!text-xl !font-bold !border-0 !border-b-0 !pb-0 !p-0 !bg-transparent w-full md:max-w-xs"
                                style={{ fontSize: '1.125rem', fontWeight: '700' }}
                                disabled={saving}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="mb-1">
                              <h3 className="text-lg md:text-xl font-bold">
                                {profile.full_name || 'No name'}
                              </h3>
                            </div>
                          )}
                          <p className="text-sm md:text-base text-muted-foreground mb-1">{profile.email}</p>
                          {profile.phone && (
                            <p className="text-xs md:text-sm text-muted-foreground">{profile.phone}</p>
                          )}
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black">
                            {profile.role}
                          </span>
                        </div>

                        {/* Buttons on the right */}
                        <div className="flex flex-col gap-2 flex-shrink-0 w-full md:w-auto">
                          {editingProfileId === profile.id ? (
                            // Save/Cancel buttons stacked vertically
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateName(profile.id)}
                                disabled={saving}
                                className="w-full md:w-[180px]"
                              >
                                {saving ? 'Saving...' : 'Save'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingProfileId(null)
                                  setEditingName('')
                                }}
                                disabled={saving}
                                className="w-full md:w-[180px]"
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              {/* Edit Button */}
                              <Button
                                size="sm"
                                onClick={() => {
                                  setEditingProfileId(profile.id)
                                  setEditingName(profile.full_name || '')
                                }}
                                className="w-full md:w-[180px]"
                              >
                                Edit
                              </Button>
                              {/* Upload Photo Button */}
                              <div className="w-full md:w-auto">
                                <Label htmlFor={`file-${profile.id}`} className="cursor-pointer">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    disabled={uploading}
                                    className="w-full md:w-[180px]"
                                  >
                                    <span>
                                      {selectedProfile?.id === profile.id && uploading
                                        ? 'Uploading...'
                                        : 'Upload Photo'}
                                    </span>
                                  </Button>
                                </Label>
                                <Input
                                  id={`file-${profile.id}`}
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      setSelectedProfile(profile)
                                      handleFileUpload(profile.id, file)
                                    }
                                  }}
                                  disabled={uploading}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

