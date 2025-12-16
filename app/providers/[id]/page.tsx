import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star, MapPin, Clock, Euro } from 'lucide-react'
import { getProviderById } from '@/lib/actions/services'
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
  let reviews = []
  let error: string | null = null
  
  try {
    provider = await getProviderById(id)
    if (provider) {
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
  const avatarUrl = provider.profiles?.avatar_url
  const rating = provider.rating || 0
  const totalReviews = provider.total_reviews || 0
  const serviceCategory = provider.service_category

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24">
        <div className="container mx-auto px-4 py-16">
          {/* Provider Header */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-32 h-32 object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-muted text-muted-foreground text-4xl font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Provider Info */}
              <div className="flex-1">
                <h1
                  className="text-4xl md:text-5xl font-bold mb-4"
                  style={{ fontFamily: 'var(--font-grand-medium)' }}
                >
                  {displayName}
                </h1>
                
                {serviceCategory && (
                  <p className="text-xl text-muted-foreground mb-4">
                    {serviceCategory.name}
                  </p>
                )}

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-black dark:text-white fill-current" />
                    <span className="text-2xl font-bold">{rating.toFixed(1)}</span>
                  </div>
                  {totalReviews > 0 && (
                    <span className="text-muted-foreground">
                      ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  )}
                </div>

                {/* Bio */}
                {provider.bio && (
                  <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
                    {provider.bio}
                  </p>
                )}

                {/* Details */}
                <div className="flex flex-wrap gap-6 mb-6">
                  {provider.hourly_rate && (
                    <div className="flex items-center gap-2">
                      <Euro className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xl font-bold">€{provider.hourly_rate.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {provider.service_area && provider.service_area.length > 0 && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {provider.service_area.join(', ')}
                      </span>
                    </div>
                  )}

                  {provider.min_duration_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Min: {provider.min_duration_hours}h
                        {provider.max_duration_hours && ` - Max: ${provider.max_duration_hours}h`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div className="mb-6">
                  {provider.available ? (
                    <span className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black">
                      Available
                    </span>
                  ) : (
                    <span className="px-4 py-2 text-sm font-medium bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white">
                      Unavailable
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <Button size="lg" asChild disabled={!provider.available}>
                  <Link href={`/book/${id}`}>
                    Book Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="mt-12">
              <h2
                className="text-3xl font-bold mb-6"
                style={{ fontFamily: 'var(--font-grand-medium)' }}
              >
                Reviews
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
                            className="w-12 h-12 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-muted text-muted-foreground text-lg font-semibold">
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
                              {new Date(review.created_at).toLocaleDateString()}
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

