'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FaEnvelope, FaUserCircle, FaBars, FaTimes, FaSearch } from 'react-icons/fa'
import { LuCpu } from 'react-icons/lu'
import { useSite } from '@/lib/SiteContext'
import { useAuth } from '@/lib/AuthContext'
import { useBuild } from '@/lib/BuildContext'

export default function Navbar() {
  const { settings, categories } = useSite()
  const { isAuthenticated, user } = useAuth()
  const { count } = useBuild()
  const router = useRouter()
  const [shopOpen, setShopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [term, setTerm] = useState('')

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/products?search=${encodeURIComponent(term)}`)
    setMobileOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <LuCpu className="text-violet text-xl" />
          <span className="font-display font-semibold text-ink text-lg tracking-tight">
            {settings.logo_text}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm">
          <div
            className="relative"
            onMouseEnter={() => setShopOpen(true)}
            onMouseLeave={() => setShopOpen(false)}
          >
            <Link href="/products" className="px-3 py-2 text-gray-700 hover:text-violet font-medium">
              Shop
            </Link>
            {shopOpen && categories.length > 0 && (
              <div className="absolute left-0 top-full w-52 card p-2 shadow-lg">
                {categories.map((c: any) => (
                  <Link
                    key={c.id}
                    href={`/products?category=${c.slug}`}
                    className="block px-3 py-1.5 rounded-md text-gray-700 hover:bg-panel hover:text-violet text-sm"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/builder" className="px-3 py-2 text-gray-700 hover:text-violet font-medium">
            PC Builder
          </Link>
          <Link href="/listings/new" className="px-3 py-2 text-gray-700 hover:text-violet font-medium">
            Sell
          </Link>
        </div>

        <form onSubmit={submitSearch} className="hidden lg:flex items-center flex-1 max-w-xs ml-auto relative">
          <FaSearch className="absolute left-3 text-gray-400 text-sm" />
          <input
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="Search parts"
            className="field pl-9 py-2 text-sm"
          />
        </form>

        <div className="flex items-center gap-3 text-gray-700 ml-auto lg:ml-3">
          <Link href="/builder" className="relative flex items-center" aria-label="Current build">
            <LuCpu className="text-xl" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-violet text-white text-[10px] mono rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <Link href="/messages" aria-label="Messages"><FaEnvelope className="text-lg" /></Link>
          {isAuthenticated ? (
            <Link href="/profile" className="flex items-center gap-1.5" aria-label="Profile">
              <FaUserCircle className="text-xl text-violet" />
              <span className="hidden sm:inline text-sm font-medium">{user?.username}</span>
            </Link>
          ) : (
            <Link href="/login" className="btn btn-primary py-1.5 px-3 text-sm">Sign in</Link>
          )}
          <button className="md:hidden" aria-label="Menu" onClick={() => setMobileOpen(true)}>
            <FaBars />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-white px-4 py-4 space-y-3">
          <form onSubmit={submitSearch} className="relative flex items-center">
            <FaSearch className="absolute left-3 text-gray-400 text-sm" />
            <input
              value={term}
              onChange={e => setTerm(e.target.value)}
              placeholder="Search parts"
              className="field pl-9 py-2 text-sm"
            />
          </form>
          <div className="flex justify-between items-center">
            <span className="eyebrow">Menu</span>
            <button aria-label="Close" onClick={() => setMobileOpen(false)}><FaTimes /></button>
          </div>
          <Link href="/products" className="block py-1.5 font-medium" onClick={() => setMobileOpen(false)}>Shop</Link>
          <Link href="/builder" className="block py-1.5 font-medium" onClick={() => setMobileOpen(false)}>PC Builder</Link>
          <Link href="/listings/new" className="block py-1.5 font-medium" onClick={() => setMobileOpen(false)}>Sell</Link>
          {categories.map((c: any) => (
            <Link key={c.id} href={`/products?category=${c.slug}`} className="block py-1 text-sm text-gray-600" onClick={() => setMobileOpen(false)}>
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
