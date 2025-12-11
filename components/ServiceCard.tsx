'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ServiceCategory } from '@/types/services'
import { 
  ChefHat, 
  Scissors, 
  Sparkles, 
  Sprout, 
  Car, 
  Baby, 
  ShoppingBag, 
  Shirt, 
  Home,
  type LucideIcon
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  'chef-hat': ChefHat,
  'scissors': Scissors,
  'sparkles': Sparkles,
  'sprout': Sprout,
  'car': Car,
  'baby': Baby,
  'shopping-bag': ShoppingBag,
  'shirt': Shirt,
  'home': Home,
}

interface ServiceCardProps {
  service: ServiceCategory
  index: number
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  const Icon = iconMap[service.icon] || Home

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Link href={`/services/${service.slug}`}>
        <Card className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/50">
          <CardHeader>
            <div className="mb-2">
              <Icon className="w-12 h-12" strokeWidth={1.5} />
            </div>
            <CardTitle className="text-xl">{service.name}</CardTitle>
            <CardDescription className="text-sm mt-2">
              {service.description}
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>
    </motion.div>
  )
}
