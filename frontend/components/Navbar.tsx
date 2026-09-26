'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { LuSearch, LuMail, LuMenu, LuX, LuChevronDown } from 'react-icons/lu'
import { useSite } from '@/lib/SiteContext'
import { useAuth } from '@/lib/AuthContext'
import { useBuild, SLOTS } from '@/lib/BuildContext'
import BuildMeter from './BuildMeter'

export function Wordmark({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="led text-accent" />
      <span className="display text-[1.05rem] tracking-[-0.02em] leading-none whitespace-nowrap">{text}</span>
    </span>
  )
}

export default function Navbar() {
  const { settings, categories } = useSite()
  const { isAuthenticated, user } = useAuth()
  const { slots, count } = useBuild()
  const router = useRouter()
  const pathname = usePathname()
  const [shopOpen, setShopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [term, setTerm] = useState('')
  const shopRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
    setShopOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!shopOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShopOpen(false)
    const onClick = (e: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [shopOpen])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/products?search=${encodeURIComponent(term)}`)
    setMobileOpen(false)
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const navLink = (href: string) =>
    `relative px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-paper-2 ${
      isActive(href) ? 'text-ink after:absolute after:left-3 after:right-3 after:-bottom-[13px] after:h-[3px] after:bg-accent' : 'text-ink-2 hover:text-ink'
    }`

  return (
    <header className="sticky top-0 z-50 bg-paper border-b-[1.5px] border-ink">
      <div className="shell h-16 flex items-center gap-2 sm:gap-4">
        <Link href="/" className="shrink-0 mr-2 rounded-md" aria-label={`${settings.logo_text} home`}>
          <Wordmark text={settings.logo_text} />
        </Link>

        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main">
          <div className="relative" ref={shopRef}>
            <button
              type="button"
              onClick={() => setShopOpen(o => !o)}
              aria-expanded={shopOpen}
              aria-haspopup="true"
              className={`${navLink('/products')} inline-flex items-center gap-1 cursor-pointer`}
            >
              Shop <LuChevronDown className={`transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`} />
            </button>
            {shopOpen && (
              <div className="absolute left-0 top-[calc(100%+12px)] w-60 panel p-1.5 shadow-[var(--shadow-hard-lg)] rise">
                <Link href="/products" className="block px-3 py-2 rounded-md text-sm font-semibold hover:bg-accent">
                  Everything
                </Link>
                {categories.map((c: any) => (
                  <Link
                    key={c.id}
                    href={`/products?category=${c.slug}`}
                    className="block px-3 py-2 rounded-md text-sm text-ink-2 hover:bg-accent hover:text-ink"
                  >
                    {c.name}
                  </Link>
                ))}
                <div className="border-t border-rule my-1.5" />
                <Link href="/products?seller_type=user" className="block px-3 py-2 rounded-md text-sm text-ink-2 hover:bg-accent hover:text-ink">
                  Used, from the community
                </Link>
              </div>
            )}
          </div>
          <Link href="/builder" className={navLink('/builder')}>Builder</Link>
          <Link href="/listings/new" className={navLink('/listings')}>Sell</Link>
        </nav>

        <form onSubmit={submitSearch} className="hidden lg:block flex-1 max-w-sm ml-auto relative" role="search">
          <LuSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <label htmlFor="nav-search" className="sr-only">Search parts</label>
          <input
            id="nav-search"
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="Search 4090, AM5, DDR5…"
            className="field !min-h-10 !pl-9 !border-rule hover:!border-ink focus:!border-ink"
          />
        </form>

        <div className="flex items-center gap-1 sm:gap-2 ml-auto lg:ml-0">
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 h-10 px-2.5 rounded-md border-[1.5px] border-ink hover:bg-paper-2 transition-colors"
            aria-label={`Current build, ${count} of ${SLOTS.length} slots filled`}
          >
            <BuildMeter slots={slots} />
            <span className="num text-xs font-medium">{count}/{SLOTS.length}</span>
          </Link>
          <Link
            href="/messages"
            aria-label="Messages"
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-2 hover:text-ink hover:bg-paper-2 transition-colors"
          >
            <LuMail className="text-lg" />
          </Link>
          {isAuthenticated ? (
            <Link
              href="/profile"
              className="hidden sm:inline-flex items-center gap-2 h-10 pl-1 pr-3 rounded-md hover:bg-paper-2 transition-colors"
            >
              <span className="h-8 w-8 rounded-md bg-ink text-paper display text-sm flex items-center justify-center">
                {user?.username?.[0]?.toUpperCase()}
              </span>
              <span className="text-sm font-medium max-w-[8rem] truncate">{user?.username}</span>
            </Link>
          ) : (
            <Link href="/login" className="btn btn-ink btn-sm hidden sm:inline-flex">Sign in</Link>
          )}
          <button
            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-paper-2"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <LuX className="text-xl" /> : <LuMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t-[1.5px] border-ink bg-paper">
          <div className="shell py-4 space-y-4">
            <form onSubmit={submitSearch} className="relative" role="search">
              <LuSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <label htmlFor="nav-search-m" className="sr-only">Search parts</label>
              <input
                id="nav-search-m"
                value={term}
                onChange={e => setTerm(e.target.value)}
                placeholder="Search parts"
                className="field !pl-9"
              />
            </form>
            <nav className="grid" aria-label="Mobile">
              {[
                ['/products', 'Shop everything'],
                ['/builder', 'Builder'],
                ['/listings/new', 'Sell a part'],
                ['/messages', 'Messages'],
                [isAuthenticated ? '/profile' : '/login', isAuthenticated ? 'Your profile' : 'Sign in'],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="display text-2xl py-2.5 border-b border-rule hover:text-accent-deep">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-wrap gap-2">
              {categories.map((c: any) => (
                <Link key={c.id} href={`/products?category=${c.slug}`} className="tag tag-plain !text-xs !normal-case !tracking-normal py-1.5 px-3">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
