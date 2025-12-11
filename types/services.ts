export type ServiceCategory = {
  id: string
  name: string
  description: string
  icon: string
  slug: string
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'chef-prive',
    name: 'Chef Privé',
    description: 'Private chef services for intimate dining experiences',
    icon: 'chef-hat',
    slug: 'chef-prive',
  },
  {
    id: 'coiffeur-prive',
    name: 'Coiffeur Privé',
    description: 'Private hairdressing services at your location',
    icon: 'scissors',
    slug: 'coiffeur-prive',
  },
  {
    id: 'cleaning',
    name: 'Cleaning Services',
    description: 'Professional cleaning and housekeeping services',
    icon: 'sparkles',
    slug: 'cleaning',
  },
  {
    id: 'gardening',
    name: 'Gardening',
    description: 'Landscaping and garden maintenance services',
    icon: 'sprout',
    slug: 'gardening',
  },
  {
    id: 'chauffeur-prive',
    name: 'Chauffeur Privé',
    description: 'Private chauffeur and transportation services',
    icon: 'car',
    slug: 'chauffeur-prive',
  },
  {
    id: 'babysitting',
    name: 'Babysitting',
    description: 'Professional childcare and babysitting services',
    icon: 'baby',
    slug: 'babysitting',
  },
  {
    id: 'personal-shopper',
    name: 'Personal Shopper',
    description: 'Luxury personal shopping and styling services',
    icon: 'shopping-bag',
    slug: 'personal-shopper',
  },
  {
    id: 'stylist',
    name: 'Stylist',
    description: 'Personal styling and fashion consultation',
    icon: 'shirt',
    slug: 'stylist',
  },
  {
    id: 'interior-stylist',
    name: 'Interior Stylist',
    description: 'Interior design and home styling services',
    icon: 'home',
    slug: 'interior-stylist',
  },
]
