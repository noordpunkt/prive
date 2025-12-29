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
    id: 'cooking-classes',
    name: 'Atelier Pâtisserie',
    description: 'Apprenez l\'art de la pâtisserie avec des chefs professionnels',
    icon: 'chef-hat',
    slug: 'cooking-classes',
  },
  {
    id: 'interior-stylist',
    name: 'Intérieurs',
    description: 'Services de design d\'intérieur et de décoration personnalisée',
    icon: 'home',
    slug: 'interior-stylist',
  },
]
