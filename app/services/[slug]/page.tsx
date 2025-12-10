import { SERVICE_CATEGORIES } from '@/types/services'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ServicePageProps {
  params: {
    slug: string
  }
}

export default function ServicePage({ params }: ServicePageProps) {
  const service = SERVICE_CATEGORIES.find((s) => s.slug === params.slug)

  if (!service) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">{service.icon}</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.name}</h1>
            <p className="text-xl text-muted-foreground">{service.description}</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
              <CardDescription>
                Learn more about our {service.name.toLowerCase()} services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Our {service.name.toLowerCase()} services are designed to provide you with the highest 
                quality experience in the Côte d&apos;Azur region. We connect you with verified, 
                professional service providers who are committed to excellence.
              </p>
              <Button className="w-full md:w-auto">Book Now</Button>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button variant="outline" asChild>
              <a href="/">← Back to Services</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
