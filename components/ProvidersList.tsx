'use client'

import { useState, useMemo } from 'react'
import { ProviderCard } from './ProviderCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Star, Search, Filter, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Provider {
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

interface ProvidersListProps {
  providers: Provider[]
  serviceCategoryId: string
  serviceSlug?: string
}

export function ProvidersList({ providers: initialProviders, serviceCategoryId, serviceSlug }: ProvidersListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState<'rating' | 'price-low' | 'price-high'>('rating')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Calculate price range from providers
  const maxPrice = useMemo(() => {
    if (initialProviders.length === 0) return 1000
    return Math.ceil(Math.max(...initialProviders.map(p => p.hourly_rate), 0) / 50) * 50
  }, [initialProviders])

  // Initialize price range based on actual data
  const [priceRangeState, setPriceRangeState] = useState<[number, number]>([0, maxPrice])

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    let filtered = [...initialProviders]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(provider => {
        const name = (provider.business_name || provider.profiles?.full_name || '').toLowerCase()
        const bio = (provider.bio || '').toLowerCase()
        const area = (provider.service_area || []).join(' ').toLowerCase()
        return name.includes(query) || bio.includes(query) || area.includes(query)
      })
    }

    // Price filter
    filtered = filtered.filter(provider => 
      provider.hourly_rate >= priceRangeState[0] && provider.hourly_rate <= priceRangeState[1]
    )

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(provider => provider.rating >= minRating)
    }

    // Availability filter
    if (showAvailableOnly) {
      filtered = filtered.filter(provider => provider.available)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'price-low':
          return a.hourly_rate - b.hourly_rate
        case 'price-high':
          return b.hourly_rate - a.hourly_rate
        default:
          return 0
      }
    })

    return filtered
  }, [initialProviders, searchQuery, priceRangeState, minRating, showAvailableOnly, sortBy])

  const hasActiveFilters = searchQuery || priceRangeState[0] > 0 || priceRangeState[1] < maxPrice || minRating > 0 || showAvailableOnly

  const clearFilters = () => {
    setSearchQuery('')
    setPriceRangeState([0, maxPrice])
    setMinRating(0)
    setShowAvailableOnly(false)
  }

  if (initialProviders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-4">
          No providers available for this service yet.
        </p>
        <p className="text-sm text-muted-foreground">
          Check back soon or contact us to become a provider.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-black text-white dark:bg-white dark:text-black">
                {[
                  searchQuery && 1,
                  priceRangeState[0] > 0 && 1,
                  priceRangeState[1] < maxPrice && 1,
                  minRating > 0 && 1,
                  showAvailableOnly && 1
                ].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border border-neutral-900/10 p-4 space-y-4 bg-white dark:bg-black">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Price Range: €{priceRangeState[0]} - €{priceRangeState[1]}</Label>
              <Slider
                value={priceRangeState}
                onValueChange={(value) => setPriceRangeState([value[0], value[1]] as [number, number])}
                min={0}
                max={maxPrice}
                step={10}
                className="w-full"
              />
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <Label>Minimum Rating: {minRating > 0 ? `${minRating}+ stars` : 'Any'}</Label>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map((rating) => (
                  <Button
                    key={rating}
                    variant={minRating === rating ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMinRating(rating)}
                    className="flex items-center gap-1"
                  >
                    <Star className="w-3 h-3 text-black dark:text-white" />
                    {rating === 0 ? 'Any' : `${rating}+`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available-only"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="available-only" className="cursor-pointer">
                Show available providers only
              </Label>
            </div>
          </div>
        )}

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Label className="text-sm">Sort by:</Label>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto text-sm text-muted-foreground">
            {filteredProviders.length} {filteredProviders.length === 1 ? 'provider' : 'providers'} found
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      {filteredProviders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No providers match your filters.</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} serviceSlug={serviceSlug} />
          ))}
        </div>
      )}
    </div>
  )
}

