'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ServiceCategory } from '@/types/services'
import { 
  ChefHat, 
  Scissors, 
  Shirt, 
  Home,
  type LucideIcon
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  'chef-hat': ChefHat,
  'scissors': Scissors,
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
        <Card className="h-full cursor-pointer transition-all duration-300 hover:border-black/10 hover:dark:border-white/10 p-8 rounded-none shadow-none">
          <CardHeader className="p-0">
            <div className="mb-6">
              <Icon className="w-16 h-16" strokeWidth={1.5} />
            </div>
            <CardTitle
              className="text-2xl mb-3"
              style={{ fontFamily: 'var(--font-au-bold)' }}
            >
              {service.name}
            </CardTitle>
            <CardDescription className="text-base" style={{ fontFamily: 'var(--font-au-light)' }}>
              {service.description}
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>
    </motion.div>
  )
}
