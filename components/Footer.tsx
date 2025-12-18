import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'
import { SERVICE_CATEGORIES } from '@/types/services'

export function Footer() {
  // Filter out "Coiffeur Privé" and dynamically list all other services
  const footerServices = SERVICE_CATEGORIES.filter(
    service => service.slug !== 'coiffeur-prive'
  )

  return (
    <footer className="border-t mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-au-bold)' }}>Les Collectionneurs.</h3>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-au-bold)' }}>Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
              {footerServices.map((service) => (
                <li key={service.id}>
                  <Link href={`/services/${service.slug}`} className="hover:text-foreground">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-au-bold)' }}>Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
              <li><Link href="/about" className="hover:text-foreground">About</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-foreground">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-au-bold)' }}>Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between flex-col md:flex-row gap-4">
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
              &copy; {new Date().getFullYear()} Les Collectionneurs. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>Theme:</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

