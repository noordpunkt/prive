import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star, MapPin } from 'lucide-react'
import { getProviderById, getServicePackagesByProvider } from '@/lib/actions/services'
import { getReviewsByProvider } from '@/lib/actions/reviews'
import Link from 'next/link'

interface ProviderPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { id } = await params
  
  let provider
  let servicePackages = []
  let reviews = []
  let error: string | null = null
  
  try {
    provider = await getProviderById(id)
    if (provider) {
      servicePackages = await getServicePackagesByProvider(id)
      reviews = await getReviewsByProvider(id)
    }
  } catch (err) {
    console.error('Error fetching provider:', err)
    error = err instanceof Error ? err.message : 'Unknown error'
  }

  if (!provider || error) {
    notFound()
  }

  const displayName = provider.business_name || provider.profiles?.full_name || 'Provider'
  const firstName = displayName.split(' ')[0]
  const avatarUrl = provider.profiles?.avatar_url
  const rating = provider.rating || 0
  const totalReviews = provider.total_reviews || 0
  const serviceCategory = provider.service_category
  
  // Get hero image from portfolio_images or use default chef image
  const heroImage = provider.portfolio_images && provider.portfolio_images.length > 0
    ? provider.portfolio_images[0]
    : '/images/chef01.jpg'
  
  // Calculate minimum price from packages or use hourly_rate
  const minPrice = servicePackages.length > 0
    ? Math.min(...servicePackages.map(pkg => pkg.price_per_person || pkg.minimum_price || 0))
    : (provider.hourly_rate || 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12">
            {/* Left Panel - Provider Profile */}
            <div className="space-y-6">
              {/* Hero Image with Overlapping Avatar */}
              <div className="relative w-full aspect-[4/3] bg-black">
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={heroImage}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Circular Avatar Overlapping Bottom Center */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-20">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-24 h-24 rounded-full border-4 border-white dark:border-black object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white dark:border-black flex items-center justify-center bg-muted text-muted-foreground text-3xl font-semibold shadow-lg">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Content Below Avatar */}
              <div className="pt-16 space-y-4">
                {/* Title: "[Service] par [Name]" */}
                <h1
                  className="text-3xl md:text-4xl font-bold leading-tight"
                  style={{ fontFamily: 'var(--font-grand-medium)' }}
                >
                  {serviceCategory?.name || 'Service'} par {firstName}
                </h1>

                {/* Description */}
                {provider.bio && (
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {provider.bio}
                  </p>
                )}

                {/* Rating and Location - Single Line */}
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-black dark:text-white fill-current" />
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                  </div>
                  {totalReviews > 0 && (
                    <span className="text-muted-foreground">
                      {totalReviews} {totalReviews === 1 ? 'évaluation' : 'évaluations'}
                    </span>
                  )}
                  {provider.service_area && provider.service_area.length > 0 && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {provider.service_area[0]}
                      </span>
                    </>
                  )}
                  {serviceCategory && (
                    <>
                      <span className="text-muted-foreground">:</span>
                      <span className="text-muted-foreground">
                        {serviceCategory.name}
                      </span>
                    </>
                  )}
                </div>

                {/* Service Location Info */}
                <p className="text-sm text-muted-foreground">
                  Service proposé dans votre logement
                </p>

                {/* Pricing and Booking */}
                <div className="pt-4 border-t border-black/10 dark:border-white/10">
                  <div className="space-y-2 mb-6">
                    <p className="text-lg font-semibold">
                      À partir de €{Math.round(minPrice)} par voyageur
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Prix minimum de €{Math.round(minPrice)} pour réserver
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Annulation gratuite
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    asChild 
                    disabled={!provider.available}
                    className="w-full"
                  >
                    <Link href={`/book/${id}`}>
                      Voir les dates
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Panel - Service Packages */}
            <div className="space-y-6">
              {servicePackages.length > 0 ? (
                servicePackages.map((pkg: any) => (
                  <Card key={pkg.id} className="shadow-none overflow-hidden border-black/10 dark:border-white/10">
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-black">
                      <img
                        src={pkg.image_url || heroImage}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3
                        className="text-xl font-bold mb-3"
                        style={{ fontFamily: 'var(--font-grand-medium)' }}
                      >
                        {pkg.title}
                      </h3>
                      <div className="space-y-2 mb-4">
                        <p className="text-base font-semibold">
                          €{Math.round(pkg.price_per_person || pkg.minimum_price || 0)} /personne
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Prix minimum de €{Math.round(pkg.minimum_price || pkg.price_per_person || 0)} pour réserver
                        </p>
                      </div>
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {pkg.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Fallback: Show single service if no packages
                <Card className="shadow-none overflow-hidden border-black/10 dark:border-white/10">
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-black">
                    <img
                      src={heroImage}
                      alt={serviceCategory?.name || 'Service'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3
                      className="text-xl font-bold mb-3"
                      style={{ fontFamily: 'var(--font-grand-medium)' }}
                    >
                      {serviceCategory?.name || 'Service'}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-base font-semibold">
                        €{Math.round(provider.hourly_rate || 0)} /personne
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Prix minimum de €{Math.round(provider.hourly_rate || 0)} pour réserver
                      </p>
                    </div>
                    {provider.bio && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {provider.bio}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="mt-16 pt-8 border-t border-black/10 dark:border-white/10">
              <h2
                className="text-3xl font-bold mb-6"
                style={{ fontFamily: 'var(--font-grand-medium)' }}
              >
                Évaluations
              </h2>
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <Card key={review.id} className="shadow-none">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {review.customer?.avatar_url ? (
                          <img
                            src={review.customer.avatar_url}
                            alt={review.customer.full_name || 'Customer'}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted text-muted-foreground text-lg font-semibold">
                            {(review.customer?.full_name || 'C').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">
                              {review.customer?.full_name || 'Anonymous'}
                            </span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-black dark:text-white fill-current'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground">{review.comment}</p>
                          )}
                          {review.created_at && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {new Date(review.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
