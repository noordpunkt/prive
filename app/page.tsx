import { SERVICE_CATEGORIES } from '@/types/services'
import { ServiceCard } from '@/components/ServiceCard'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section - Full Height */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
          {/* Hero Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            <h2
              className="text-5xl md:text-7xl lg:text-8xl mb-6"
              style={{ fontFamily: 'var(--font-au-regular)' }}
            >
              French riviera à la carte
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-au-light)' }}>
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
      <section id="services" className="w-full py-16 md:py-24">
        <div className="flex flex-col md:flex-row h-auto md:h-[600px]">
          {SERVICE_CATEGORIES.map((service, index) => {
            const isFirst = index === 0
            const isLast = index === SERVICE_CATEGORIES.length - 1
            
            return (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className={`bg-white dark:bg-black border-t border-b border-black/10 dark:border-white/10 flex-1 flex flex-col items-center justify-center p-6 md:p-6 min-h-[400px] md:min-h-0 relative cursor-pointer transition-opacity hover:opacity-90 ${
                  isFirst ? '' : 'border-l border-black/10 dark:border-white/10'
                } ${isLast ? '' : 'border-r border-black/10 dark:border-white/10'
                }`}
                style={{ borderWidth: '0.5px' }}
              >
                {/* Icon for Chef Privé - top right */}
                {isFirst && (
                  <div className="absolute top-8 right-8 z-10">
                    <img 
                      src="/images/Icon01.svg" 
                      alt="Chef Privé Icon" 
                      className="w-10 h-10 md:w-12 md:h-12 invert dark:invert-0"
                    />
                  </div>
                )}
                
                {/* Icon for Coiffeur Privé - top right */}
                {index === 1 && (
                  <div className="absolute top-8 right-8 z-10">
                    <img 
                      src="/images/Icon02.svg" 
                      alt="Coiffeur Privé Icon" 
                      className="w-10 h-10 md:w-12 md:h-12 invert dark:invert-0"
                    />
                  </div>
                )}
                
                {/* Icon for Cooking classes - top right */}
                {index === 2 && (
                  <div className="absolute top-8 right-8 z-10">
                    <img 
                      src="/images/Icon03.svg" 
                      alt="Cooking classes Icon" 
                      className="w-10 h-10 md:w-12 md:h-12 invert dark:invert-0"
                    />
                  </div>
                )}
                
                {/* Icon for Interior Stylist - top right */}
                {index === 3 && (
                  <div className="absolute top-8 right-8 z-10">
                    <img 
                      src="/images/Icon04.svg" 
                      alt="Interior Stylist Icon" 
                      className="w-10 h-10 md:w-12 md:h-12 invert dark:invert-0"
                    />
                  </div>
                )}
                
                {/* Service Title */}
                <h3
                  className="text-4xl md:text-5xl font-bold mb-4 text-center text-black dark:text-white"
                  style={{ fontFamily: 'var(--font-au-bold)' }}
                >
                  {service.name}
                </h3>
              </Link>
            )
          })}
        </div>
      </section>

      <Footer />
    </div>
  )
}
