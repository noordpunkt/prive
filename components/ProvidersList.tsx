'use client'

import { ProviderCard } from './ProviderCard'

interface Provider {
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

interface ProvidersListProps {
  providers: Provider[]
  serviceCategoryId: string
  serviceSlug?: string
}

export function ProvidersList({ providers: initialProviders, serviceCategoryId, serviceSlug }: ProvidersListProps) {

  if (initialProviders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-4" style={{ fontFamily: 'var(--font-au-regular)' }}>
          No providers available for this service yet.
        </p>
        <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
          Check back soon or contact us to become a provider.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Providers Grid */}
      {initialProviders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2" style={{ fontFamily: 'var(--font-au-regular)' }}>No providers available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} serviceSlug={serviceSlug} />
          ))}
        </div>
      )}
    </div>
  )
}

