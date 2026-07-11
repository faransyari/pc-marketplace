'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import ProductCard, { Product } from '@/components/ProductCard'
import { Spinner, EmptyState } from '@/components/States'

type Build = { id: number; name: string; total_price: number; items: any[]; created_at: string }

export default function ProfilePage() {
  const { user, loading, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'listings' | 'builds' | 'messages'>('listings')
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-violet/10 text-violet flex items-center justify-center font-display text-xl font-semibold">
            {user.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="eyebrow">Signed in</div>
            <h1 className="font-display text-2xl font-semibold text-ink">{user.username}</h1>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
        </div>
        <button onClick={() => { logout(); router.push('/') }} className="btn btn-ghost text-sm">Sign out</button>
      </div>

      <div className="flex gap-1 border-b border-line mb-6">
        {(['listings', 'builds', 'messages'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${tab === t ? 'border-violet text-violet' : 'border-transparent text-muted hover:text-ink'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'listings' && (
        listings.length === 0
          ? <EmptyState title="No listings yet" hint="List a part you want to sell." />
          : <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{listings.map(p => <ProductCard key={p.id} product={p} />)}</div>
      )}

      {tab === 'builds' && (
        builds.length === 0
          ? <EmptyState title="No saved builds" hint="Create one in the PC Builder." />
          : <div className="space-y-3">
              {builds.map(b => (
                <Link key={b.id} href="/builder" className="card p-4 flex items-center justify-between hover:border-violet/30">
                  <div>
                    <div className="font-medium text-ink">{b.name}</div>
                    <div className="text-sm text-muted mono">{b.items.length} parts</div>
                  </div>
                  <span className="mono font-semibold">${Number(b.total_price).toLocaleString()}</span>
                </Link>
              ))}
            </div>
      )}

      {tab === 'messages' && (
        messages.length === 0
          ? <EmptyState title="No messages" hint="Messages about your listings show up here." />
          : <div className="space-y-3">
              {messages.map(m => (
                <div key={m.id} className="card p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{m.sender_username}</span>
                    <span className="text-xs text-muted mono">{new Date(m.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700">{m.content}</p>
                </div>
              ))}
            </div>
      )}
    </div>
  )
}
