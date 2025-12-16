import { SERVICE_CATEGORIES } from '@/types/services'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { 
  ChefHat, 
  Scissors, 
  Sparkles, 
  Sprout, 
  Car, 
  Baby, 
  ShoppingBag, 
  Shirt, 
  Home,
  type LucideIcon
} from 'lucide-react'
import { getServiceBySlug, getProvidersByCategory } from '@/lib/actions/services'
import { ProvidersList } from '@/components/ProvidersList'
import Link from 'next/link'

const iconMap: Record<string, LucideIcon> = {
  'chef-hat': ChefHat,
  'scissors': Scissors,
  'sparkles': Sparkles,
  'sprout': Sprout,
  'car': Car,
  'baby': Baby,
  'shopping-bag': ShoppingBag,
  'shirt': Shirt,
  'home': Home,
}

interface ServicePageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params
  
  // Find service in local categories for icon
  const localService = SERVICE_CATEGORIES.find((s) => s.slug === slug)
  if (!localService) {
    notFound()
  }

  // Fetch service from database
  let service
  let providers = []
  let fetchError: string | null = null
  
  try {
    service = await getServiceBySlug(slug)
    if (service) {
      providers = await getProvidersByCategory(service.id)
    } else {
      fetchError = 'Service category not found in database'
    }
  } catch (error) {
    console.error('Error fetching service data:', error)
    fetchError = error instanceof Error ? error.message : 'Unknown error'
    // Fallback to local service data if DB fetch fails
    service = null
  }

  const Icon = iconMap[localService.icon] || Home
  const serviceName = service?.name || localService.name
  const serviceDescription = service?.description || localService.description

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24">
        {/* Chef-specific hero with full-width image */}
        {slug === 'chef-prive' && (
          <section className="w-full">
            <div className="w-full">
              {/* Full-width image */}
              <div className="overflow-hidden bg-black h-64 md:h-80">
                <img
                  src="/images/chef04.jpg"
                  alt="Chef hero"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </section>
        )}

        <div className="container mx-auto px-4 py-16">
          {/* Service Header */}
          <div className="mb-8">
            <div className="text-center mb-12">
              <div className="mb-4 flex justify-center">
                <Icon className="w-20 h-20" strokeWidth={1.5} />
              </div>
              <h1
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-grand-medium)' }}
              >
                {serviceName}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {serviceDescription}
              </p>
            </div>
          </div>

          {/* Providers Section */}
          {service ? (
            <ProvidersList 
              providers={providers} 
              serviceCategoryId={service.id}
              serviceSlug={slug}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Service category not found in database.
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  {fetchError && `Error: ${fetchError}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Please run the migration script to create service categories in your Supabase database.
                </p>
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>Expected service slug: {slug}</p>
                  <p>Providers found: {providers.length}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
