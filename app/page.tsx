import { SERVICE_CATEGORIES } from '@/types/services'
import { ServiceCard } from '@/components/ServiceCard'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserMenu } from '@/components/UserMenu'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl uppercase text-foreground" style={{ fontFamily: 'var(--font-custom)', fontWeight: 600 }}>
              PRIVÉ
            </h1>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Hero Section - Full Height */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
          {/* Hero Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            <h2 className="text-5xl md:text-7xl lg:text-8xl tracking-tight mb-6 uppercase" style={{ fontFamily: 'var(--font-custom)', fontWeight: 600 }}>
              SERVICES À LA CARTE
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Discover exceptional private services tailored to your lifestyle.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="#services">Explore Services</Link>
              </Button>
            </div>
          </div>
      </section>

      {/* Services Section */}
      <section id="services" className="container mx-auto px-4 py-16 md:py-24">

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICE_CATEGORIES.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Privé à la Carte</h3>
              <p className="text-sm text-muted-foreground">
                Your gateway to premium services à la carte.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/services" className="hover:text-foreground">All Services</Link></li>
                <li><Link href="/services/chef-prive" className="hover:text-foreground">Chef Privé</Link></li>
                <li><Link href="/services/coiffeur-prive" className="hover:text-foreground">Coiffeur Privé</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-foreground">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between flex-col md:flex-row gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Privé à la Carte. All rights reserved.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Theme:</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
