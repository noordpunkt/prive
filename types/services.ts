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
