import { UserMenu } from '@/components/UserMenu'
import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-4 py-6 flex items-center justify-between">
        <Link href="/">
          <h1 className="text-2xl uppercase text-foreground" style={{ fontFamily: 'var(--font-custom)', fontWeight: 600 }}>
            PRIVÉ
          </h1>
        </Link>
        <UserMenu />
      </div>
    </header>
  )
}

