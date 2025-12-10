'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ServiceCategory } from '@/types/services'

interface ServiceCardProps {
  service: ServiceCategory
  index: number
}

export function ServiceCard({ service, index }: ServiceCardProps) {
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
            <div className="text-4xl mb-2">{service.icon}</div>
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
