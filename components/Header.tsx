import { UserMenu } from '@/components/UserMenu'
import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-4 py-8 flex items-center justify-center relative">
        <Link href="/" className="flex items-center gap-4">
          <img 
            src="/images/brand.svg" 
            alt="Brand" 
            className="h-6 w-6 invert dark:invert-0"
          />
          <span className="text-lg text-foreground" style={{ fontFamily: 'var(--font-au-light)' }}>
            Les Collectionneurs.
          </span>
        </Link>
        <div className="absolute right-6 lg:right-8">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

