'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, MapPin } from 'lucide-react'
import Link from 'next/link'

interface ProviderCardProps {
  provider: {
    id: string
    business_name?: string | null
    bio?: string | null
    hourly_rate: number
    rating: number
    total_reviews: number
    available: boolean
    service_area?: string[] | null
    profiles?: {
      id: string
      full_name: string | null
      avatar_url: string | null
    } | null
  }
  serviceSlug?: string
}

export function ProviderCard({ provider, serviceSlug }: ProviderCardProps) {
  const displayName = provider.business_name || provider.profiles?.full_name || 'Provider'
  const avatarUrl = provider.profiles?.avatar_url
  const rating = provider.rating || 0
  const reviews = provider.total_reviews || 0
  const isChefService = serviceSlug === 'chef-prive'

  return (
    <Card className="h-full flex flex-col shadow-none overflow-hidden py-0">
      <CardContent className={isChefService ? 'p-0 flex flex-col flex-1' : 'p-6 flex flex-col flex-1'}>
        {isChefService ? (
          <>
            {/* Top image with centered avatar overlapping, like hero */}
            <div className="relative w-full h-40 bg-black">
              <img
                src="/images/chef01.jpg"
                alt="Chef dish"
                className="w-full h-full object-cover"
              />
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="w-20 h-20 rounded-full border-4 border-white dark:border-black overflow-hidden bg-muted flex items-center justify-center text-2xl font-semibold">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Content below avatar */}
            <div className="pt-14 px-6 pb-6 flex flex-col flex-1">
              <div className="text-center mb-3">
                <h3 className="font-semibold text-lg mb-1 truncate" style={{ fontFamily: 'var(--font-au-bold)' }}>{displayName}</h3>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-black dark:text-white" />
                    <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-au-regular)' }}>{rating.toFixed(1)}</span>
                  </div>
                  {reviews > 0 && (
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
                      ({reviews} {reviews === 1 ? 'review' : 'reviews'})
                    </span>
                  )}
                </div>
              </div>

              {/* Bio */}
              {provider.bio && (
                <p className="text-sm text-muted-foreground mb-4 text-center line-clamp-2" style={{ fontFamily: 'var(--font-au-light)' }}>
                  {provider.bio}
                </p>
              )}

              {/* Service Area */}
              {provider.service_area && provider.service_area.length > 0 && (
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-au-light)' }}>
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{provider.service_area.join(', ')}</span>
                </div>
              )}

              {/* Price and Availability */}
              <div className="mt-auto pt-4 border-t border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-au-bold)' }}>
                      €{provider.hourly_rate.toFixed(2)}
                    </div>
                  </div>
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

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    asChild 
                    className="flex-1"
                    disabled={!provider.available}
                  >
                    <Link href={`/book/${provider.id}`}>
                      Book Now
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    asChild
                    className="flex-1"
                  >
                    <Link href={`/providers/${provider.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Provider Header */}
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar */}
              <div className="relative w-16 h-16 overflow-hidden bg-muted flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-lg font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name and Rating */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1 truncate" style={{ fontFamily: 'var(--font-au-bold)' }}>{displayName}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-black dark:text-white" />
                    <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-au-regular)' }}>{rating.toFixed(1)}</span>
                  </div>
                  {reviews > 0 && (
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
                      ({reviews} {reviews === 1 ? 'review' : 'reviews'})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {provider.bio && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2" style={{ fontFamily: 'var(--font-au-light)' }}>
                {provider.bio}
              </p>
            )}

            {/* Service Area */}
            {provider.service_area && provider.service_area.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-au-light)' }}>
                <MapPin className="w-4 h-4" />
                <span className="truncate">{provider.service_area.join(', ')}</span>
              </div>
            )}

            {/* Price and Availability */}
            <div className="mt-auto pt-4 border-t border-neutral-900/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-au-bold)' }}>
                    €{provider.hourly_rate.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>per hour</div>
                </div>
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

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  asChild 
                  className="flex-1"
                  disabled={!provider.available}
                >
                  <Link href={`/book/${provider.id}`}>
                    Book Now
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild
                  className="flex-1"
                >
                  <Link href={`/providers/${provider.id}`}>
                    View Profile
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

