import { redirect } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { isAdmin } from '@/lib/utils/admin'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AdminPage() {
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24">
        <div className="container mx-auto px-4 py-16">
          <div className="mb-8">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-au-bold)' }}
            >
              Admin Dashboard
            </h1>
            <p className="text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
              Manage profiles, providers, and upload photos
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Manage Profiles */}
            <Card className="shadow-none">
              <CardContent className="p-6">
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: 'var(--font-au-bold)' }}
                >
                  Profiles
                </h2>
                <p className="text-muted-foreground mb-6">
                  View and manage user profiles, upload profile pictures
                </p>
                <Button asChild size="sm" className="w-fit">
                  <Link href="/admin/profiles">Manage Profiles</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Manage Providers */}
            <Card className="shadow-none">
              <CardContent className="p-6">
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: 'var(--font-au-bold)' }}
                >
                  Providers
                </h2>
                <p className="text-muted-foreground mb-6">
                  View and manage service providers
                </p>
                <Button asChild size="sm" className="w-fit">
                  <Link href="/admin/providers">Manage Providers</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Manage Service Packages */}
            <Card className="shadow-none">
              <CardContent className="p-6">
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: 'var(--font-au-bold)' }}
                >
                  Service Packages
                </h2>
                <p className="text-muted-foreground mb-6">
                  Manage service packages for providers
                </p>
                <Button asChild size="sm" className="w-fit">
                  <Link href="/admin/packages">Manage Packages</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

