'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LuPlus } from 'react-icons/lu'
import api from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import ProductCard, { Product } from '@/components/ProductCard'
import PartGlyph, { glyphFor } from '@/components/PartGlyph'
import { formatPrice } from '@/lib/config'
import { Spinner, EmptyState } from '@/components/States'

type Build = { id: number; name: string; total_price: number; items: any[]; created_at: string }
type Tab = 'listings' | 'builds' | 'messages'

const partsIn = (b: Build) => b.items.reduce((n: number, it: any) => n + (it.quantity || 1), 0)

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default function ProfilePage() {
  const { user, loading, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('listings')
  const [listings, setListings] = useState<Product[]>([])
  const [builds, setBuilds] = useState<Build[]>([])
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated) return
    api.get('products/?mine=1').then(r => setListings(r.data.results)).catch(() => {})
    api.get('builds/').then(r => setBuilds(r.data.results || r.data)).catch(() => {})
    api.get('messages/').then(r => setMessages(r.data.results || r.data)).catch(() => {})
  }, [isAuthenticated])

  if (loading || !user) return <Spinner />

  const tabs: [Tab, string, number][] = [
    ['listings', 'Listings', listings.length],
    ['builds', 'Builds', builds.length],
    ['messages', 'Messages', messages.length],
  ]

  return (
    <div className="shell pt-10 sm:pt-14">
      <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b-[1.5px] border-ink">
        <div className="flex items-center gap-5 min-w-0">
          <div className="h-20 w-20 shrink-0 rounded-[var(--radius-card)] bg-accent border-[1.5px] border-ink display text-4xl flex items-center justify-center shadow-[var(--shadow-hard)]">
            {user.username?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="display text-[clamp(2rem,1.4rem+2vw,3rem)] truncate">{user.username}</h1>
            <p className="text-ink-2 mt-1 truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/listings/new" className="btn btn-ink btn-sm"><LuPlus /> List a part</Link>
          <button onClick={() => { logout(); router.push('/') }} className="btn btn-line btn-sm">Sign out</button>
        </div>
      </div>

      <div className="flex gap-1 mt-6 mb-8 p-1 rounded-[var(--radius-control)] bg-paper-2 w-fit max-w-full overflow-x-auto" role="tablist">
        {tabs.map(([t, label, n]) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
              tab === t ? 'bg-ink text-paper' : 'text-ink-2 hover:text-ink'
            }`}
          >
            {label} <span className={`num text-xs ${tab === t ? 'text-accent' : 'text-ink-3'}`}>{n}</span>
          </button>
        ))}
      </div>

      {tab === 'listings' && (
        listings.length === 0
          ? <EmptyState title="Nothing listed yet" hint="Got a part you've outgrown? Put it on the shelf." action={{ href: '/listings/new', label: 'List a part' }} />
          : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">{listings.map(p => <ProductCard key={p.id} product={p} />)}</div>
      )}

      {tab === 'builds' && (
        builds.length === 0
          ? <EmptyState title="No saved builds" hint="Builds you save in the builder land here." glyph="case" action={{ href: '/builder', label: 'Open the builder' }} />
          : <div className="grid md:grid-cols-2 gap-4">
              {builds.map(b => (
                <Link key={b.id} href="/builder" className="panel lift p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="display text-xl truncate">{b.name}</h3>
                      <p className="num text-xs text-ink-2 mt-1">{partsIn(b)} part{partsIn(b) !== 1 ? 's' : ''} · {dateFmt.format(new Date(b.created_at))}</p>
                    </div>
                    <span className="num font-semibold whitespace-nowrap">{formatPrice(b.total_price)}</span>
                  </div>
                  {b.items.length > 0 && (
                    <div className="flex flex-wrap gap-2" aria-hidden="true">
                      {b.items.slice(0, 12).map((it: any) => (
                        <span key={it.id} className="relative h-10 w-10 rounded-md bg-paper-2 flex items-center justify-center">
                          <PartGlyph kind={glyphFor(it.product_detail || {})} className="w-7 h-7" />
                          {it.quantity > 1 && (
                            <span className="absolute -top-1.5 -right-1.5 num text-[0.6rem] leading-none px-1 py-0.5 rounded bg-ink text-paper">×{it.quantity}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
      )}

      {tab === 'messages' && (
        messages.length === 0
          ? <EmptyState title="No messages" hint="Questions about your listings show up here." glyph="headset" />
          : <div className="space-y-2.5">
              {messages.map(m => (
                <Link key={m.id} href="/messages" className="block panel p-4 hover:bg-white transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-sm font-semibold">{m.sender_username}</span>
                    <span className="num text-xs text-ink-2">{dateFmt.format(new Date(m.timestamp))}</span>
                  </div>
                  <p className="text-sm text-ink-2">{m.content}</p>
                </Link>
              ))}
            </div>
      )}
    </div>
  )
}
