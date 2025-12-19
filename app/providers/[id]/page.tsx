import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import { getProviderById, getServicePackagesByProvider } from '@/lib/actions/services'
import { getReviewsByProvider } from '@/lib/actions/reviews'
import { ImageSlider } from '@/components/ImageSlider'
import { BookingForm } from '@/components/BookingForm'
import { BookNowButton } from '@/components/BookNowButton'

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
  
  // Get portfolio images for slider
  const coverIndex = provider.cover_image_index ?? 0
  const portfolioImages = provider.portfolio_images && provider.portfolio_images.length > 0
    ? provider.portfolio_images
    : ['/images/chef01.jpg']
  
  // Get price from packages or use fixed service price
  const minPrice = servicePackages.length > 0
    ? Math.min(...servicePackages.map(pkg => pkg.price_per_person || pkg.minimum_price || 0))
    : (provider.price || 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-32">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Provider Profile */}
          <div className="space-y-6">
              {/* Image Slider with Overlapping Avatar */}
              <div className="relative">
                <ImageSlider
                  images={portfolioImages}
                  coverIndex={coverIndex}
                  alt={displayName}
                />
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
                  style={{ fontFamily: 'var(--font-au-bold)' }}
                >
                  {serviceCategory?.name || 'Service'} par {firstName}
                </h1>

                {/* Description */}
                {provider.bio && (
                  <p className="text-base text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-au-light)' }}>
                    {provider.bio}
                  </p>
                )}

                {/* Rating and Location - Single Line */}
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-lg text-black dark:text-white" style={{ fontFamily: 'var(--font-au-bold)' }}>ꕤ</span>
                    <span className="font-semibold" style={{ fontFamily: 'var(--font-au-bold)' }}>{rating.toFixed(1)}</span>
                  </div>
                  {totalReviews > 0 && (
                    <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
                      {totalReviews} {totalReviews === 1 ? 'évaluation' : 'évaluations'}
                    </span>
                  )}
                  {provider.service_area && provider.service_area.length > 0 && (
                    <>
                      <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>•</span>
                      <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
                        {provider.service_area[0]}
                      </span>
                    </>
                  )}
                  {serviceCategory && (
                    <>
                      <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>:</span>
                      <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
                        {serviceCategory.name}
                      </span>
                    </>
                  )}
                </div>

              </div>
          </div>

          {/* Booking Form */}
          <BookingForm providerId={id} provider={provider} />

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="mt-16 pt-8 border-t border-black/10 dark:border-white/10">
              <h2
                className="text-3xl font-bold mb-6"
                style={{ fontFamily: 'var(--font-au-bold)' }}
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
                            <span className="font-semibold" style={{ fontFamily: 'var(--font-au-bold)' }}>
                              {review.customer?.full_name || 'Anonymous'}
                            </span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-base ${
                                    i < review.rating
                                      ? 'text-black dark:text-white'
                                      : 'text-muted-foreground opacity-30'
                                  }`}
                                >
                                  ꕤ
                                </span>
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>{review.comment}</p>
                          )}
                          {review.created_at && (
                            <p className="text-sm text-muted-foreground mt-2" style={{ fontFamily: 'var(--font-au-light)' }}>
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

      {/* Fixed Bottom Full Width Booking Section */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <p className="text-2xl font-bold font-mono" style={{ fontFamily: 'var(--font-source-code-pro)' }}>
              €{Math.round(minPrice)}
            </p>
            <BookNowButton disabled={!provider.available} />
          </div>
        </div>
      </div>

      <div className="pb-24 lg:pb-28">
        <Footer />
      </div>
    </div>
  )
}
