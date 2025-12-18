'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Euro } from 'lucide-react'

interface ServicePackage {
  id: string
  provider_id: string
  title: string
  description: string | null
  image_url: string | null
  price_per_person: number
  minimum_price: number
  created_at: string
  provider?: {
    business_name: string | null
    profiles?: {
      full_name: string | null
    } | null
  } | null
}

export default function AdminPackagesPage() {
  const router = useRouter()
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

      // Load all service packages
      const { data: allPackages, error: packagesError } = await supabase
        .from('service_packages')
        .select('*')
        .order('created_at', { ascending: false })

      if (packagesError) {
        setError('Failed to load service packages')
        setLoading(false)
        return
      }

      // Fetch provider info for each package
      const packagesWithProviders = await Promise.all(
        (allPackages || []).map(async (pkg) => {
          const { data: provider } = await supabase
            .from('service_providers')
            .select(`
              business_name,
              profiles:profile_id (
                full_name
              )
            `)
            .eq('id', pkg.provider_id)
            .single()

          return {
            ...pkg,
            provider: provider || null
          }
        })
      )

      setPackages(packagesWithProviders)
      setLoading(false)
    }

    checkAdminAndLoad()
  }, [router])

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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-au-bold)' }}
              >
                Manage Service Packages
              </h1>
              <p className="text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
                View and manage all service packages
              </p>
            </div>
            <Button variant="outline" asChild>
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

          {/* Packages List */}
          {packages.length === 0 ? (
            <Card className="shadow-none">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground text-lg" style={{ fontFamily: 'var(--font-au-regular)' }}>
                  No service packages found
                </p>
                <p className="text-sm text-muted-foreground mt-2" style={{ fontFamily: 'var(--font-au-light)' }}>
                  Service packages will appear here once created
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => {
                const providerName = pkg.provider?.business_name || 
                                   pkg.provider?.profiles?.full_name || 
                                   'Unknown Provider'
                
                return (
                  <Card key={pkg.id} className="shadow-none overflow-hidden border-black/10 dark:border-white/10">
                    {pkg.image_url && (
                      <div className="relative w-full aspect-[4/3] overflow-hidden bg-black">
                        <img
                          src={pkg.image_url}
                          alt={pkg.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3
                        className="text-xl font-bold mb-2"
                        style={{ fontFamily: 'var(--font-au-bold)' }}
                      >
                        {pkg.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-au-light)' }}>
                        Provider: {providerName}
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Euro className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold font-mono" style={{ fontFamily: 'var(--font-source-code-pro)' }}>
                            €{Math.round(pkg.price_per_person || 0)} /personne
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono" style={{ fontFamily: 'var(--font-source-code-pro)' }}>
                          Prix minimum: €{Math.round(pkg.minimum_price || pkg.price_per_person || 0)}
                        </p>
                      </div>
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4" style={{ fontFamily: 'var(--font-au-light)' }}>
                          {pkg.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/admin/packages/${pkg.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

