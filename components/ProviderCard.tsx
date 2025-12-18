'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'
import Link from 'next/link'

interface ProviderCardProps {
  provider: {
    id: string
    business_name?: string | null
    bio?: string | null
    price: number
    rating: number
    total_reviews: number
    available: boolean
    service_area?: string[] | null
    portfolio_images?: string[] | null
    cover_image_index?: number | null
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
  
  // Get cover image or first image from portfolio
  const coverIndex = provider.cover_image_index ?? 0
  const coverImage = provider.portfolio_images && provider.portfolio_images.length > 0
    ? provider.portfolio_images[coverIndex] || provider.portfolio_images[0]
    : null

  return (
    <Card className="h-full flex flex-col shadow-none overflow-hidden py-0">
      <CardContent className={isChefService ? 'p-0 flex flex-col flex-1' : 'p-6 flex flex-col flex-1'}>
        {isChefService ? (
          <>
            {/* Top image with centered avatar overlapping, like hero */}
            <div className="relative w-full h-40 bg-black">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm" style={{ fontFamily: 'var(--font-au-light)' }}>
                    No image
                  </span>
                </div>
              )}
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
                    <span className="text-base text-black dark:text-white" style={{ fontFamily: 'var(--font-au-bold)' }}>ꕤ</span>
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
                <p className="text-sm mb-4 text-center line-clamp-2 text-neutral-600 dark:text-neutral-400" style={{ fontFamily: 'var(--font-au-light)' }}>
                  {provider.bio}
                </p>
              )}

              {/* Service Area */}
              {provider.service_area && provider.service_area.length > 0 && (
                <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-center gap-1 text-sm text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-au-light)' }}>
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{provider.service_area.join(', ')}</span>
                </div>
              )}

              {/* Price */}
              <div className="mt-auto pt-4 border-t border-black/10 dark:border-white/10">
                <div className="mb-4">
                  <div className="text-2xl font-bold font-mono" style={{ fontFamily: 'var(--font-source-code-pro)' }}>
                    €{provider.price.toFixed(2)}
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  asChild 
                  className="w-full"
                  disabled={!provider.available}
                >
                  <Link href={`/providers/${provider.id}`}>
                    Book Now
                  </Link>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Cover Image at top for non-chef services */}
            {coverImage ? (
              <div className="relative w-full h-40 bg-black mb-4">
                <img
                  src={coverImage}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
                {/* Centered circular avatar overlapping cover image */}
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
            ) : (
              /* Centered circular avatar when no cover image */
              <div className="flex justify-center mb-4 pt-6">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center text-2xl font-semibold">
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
            )}
            
            {/* Content below avatar */}
            <div className={coverImage ? 'pt-14' : ''}>
              {/* Name and Rating - Centered */}
              <div className="text-center mb-3">
                <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: 'var(--font-au-bold)' }}>{displayName}</h3>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-base text-black dark:text-white" style={{ fontFamily: 'var(--font-au-bold)' }}>ꕤ</span>
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
              <p className="text-sm mb-4 line-clamp-2 text-neutral-600 dark:text-neutral-400" style={{ fontFamily: 'var(--font-au-light)' }}>
                {provider.bio}
              </p>
            )}

            {/* Service Area */}
            {provider.service_area && provider.service_area.length > 0 && (
              <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center gap-1 text-sm text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-au-light)' }}>
                <MapPin className="w-4 h-4" />
                <span className="truncate">{provider.service_area.join(', ')}</span>
              </div>
            )}

            {/* Price */}
            <div className="mt-auto pt-4 border-t border-neutral-900/10">
              <div className="mb-4">
                <div className="text-2xl font-bold font-mono" style={{ fontFamily: 'var(--font-source-code-pro)' }}>
                  €{provider.price.toFixed(2)}
                </div>
              </div>

              {/* Action Button */}
              <Button 
                asChild 
                className="w-full"
                disabled={!provider.available}
              >
                <Link href={`/providers/${provider.id}`}>
                  Book Now
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

