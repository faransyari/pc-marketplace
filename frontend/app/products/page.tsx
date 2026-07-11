'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { useSite } from '@/lib/SiteContext'
import ProductCard, { Product } from '@/components/ProductCard'
import { Spinner, EmptyState } from '@/components/States'

const SLOTS = [
  ['cpu', 'CPU'], ['mobo', 'Motherboard'], ['ram', 'Memory'], ['gpu', 'Graphics'],
  ['storage', 'Storage'], ['psu', 'Power Supply'], ['case', 'Case'], ['cooler', 'Cooler'],
]

function ProductsInner() {
  const params = useSearchParams()
  const { categories } = useSite()

  const [category, setCategory] = useState(params.get('category') || '')
  const [slot, setSlot] = useState(params.get('slot') || '')
  const [sellerType, setSellerType] = useState(params.get('seller_type') || '')
  const [search, setSearch] = useState(params.get('search') || '')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [ordering, setOrdering] = useState('-created_at')
  const [page, setPage] = useState(1)

  const [products, setProducts] = useState<Product[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSearch(params.get('search') || '')
    setCategory(params.get('category') || '')
    setSlot(params.get('slot') || '')
    setSellerType(params.get('seller_type') || '')
    setPage(1)
  }, [params])

  useEffect(() => {
    setLoading(true)
    const q = new URLSearchParams()
    if (category) q.set('category', category)
    if (slot) q.set('slot', slot)
    if (sellerType) q.set('seller_type', sellerType)
    if (search) q.set('search', search)
    if (minPrice) q.set('min_price', minPrice)
    if (maxPrice) q.set('max_price', maxPrice)
    if (ordering) q.set('ordering', ordering)
    q.set('page', String(page))
    api.get(`products/?${q.toString()}`)
      .then(r => { setProducts(r.data.results); setCount(r.data.count) })
      .catch(() => { setProducts([]); setCount(0) })
      .finally(() => setLoading(false))
  }, [category, slot, sellerType, search, minPrice, maxPrice, ordering, page])

  const pages = Math.ceil(count / 12)

  const reset = () => {
    setCategory(''); setSlot(''); setSellerType(''); setSearch(''); setMinPrice(''); setMaxPrice(''); setPage(1)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="eyebrow mb-1">Marketplace</div>
        <h1 className="font-display text-3xl font-semibold text-ink">Shop parts &amp; PCs</h1>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-6">
          <div>
            <div className="eyebrow mb-2">Category</div>
            <div className="space-y-1">
              <FilterBtn active={!category} onClick={() => { setCategory(''); setPage(1) }}>All</FilterBtn>
              {categories.map((c: any) => (
                <FilterBtn key={c.id} active={category === c.slug} onClick={() => { setCategory(c.slug); setPage(1) }}>{c.name}</FilterBtn>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-2">Component slot</div>
            <div className="flex flex-wrap gap-1.5">
              {SLOTS.map(([k, label]) => (
                <button key={k} onClick={() => { setSlot(slot === k ? '' : k); setPage(1) }}
                  className={`chip cursor-pointer ${slot === k ? 'border-violet text-violet' : ''}`}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-2">Seller</div>
            <div className="space-y-1">
              <FilterBtn active={!sellerType} onClick={() => { setSellerType(''); setPage(1) }}>Everyone</FilterBtn>
              <FilterBtn active={sellerType === 'official'} onClick={() => { setSellerType('official'); setPage(1) }}>Official store</FilterBtn>
              <FilterBtn active={sellerType === 'user'} onClick={() => { setSellerType('user'); setPage(1) }}>Community</FilterBtn>
            </div>
          </div>
          <div>
            <div className="eyebrow mb-2">Price</div>
            <div className="flex gap-2">
              <input className="field mono text-sm" placeholder="Min" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1) }} />
              <input className="field mono text-sm" placeholder="Max" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1) }} />
            </div>
          </div>
          <button onClick={reset} className="text-sm text-violet hover:underline">Reset filters</button>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted mono">{count} result{count !== 1 ? 's' : ''}</span>
            <select className="field w-auto text-sm py-1.5" value={ordering} onChange={e => { setOrdering(e.target.value); setPage(1) }}>
              <option value="-created_at">Newest</option>
              <option value="price">Price: low to high</option>
              <option value="-price">Price: high to low</option>
              <option value="title">Name A–Z</option>
            </select>
          </div>

          {loading ? <Spinner /> : products.length === 0 ? (
            <EmptyState title="No parts match these filters" hint="Try widening your price range or clearing filters." />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button className="btn btn-ghost py-1.5 px-3 text-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
              <span className="mono text-sm text-muted">{page} / {pages}</span>
              <button className="btn btn-ghost py-1.5 px-3 text-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`block w-full text-left px-2.5 py-1.5 rounded-md text-sm ${active ? 'bg-panel text-violet font-medium' : 'text-gray-600 hover:bg-panel'}`}>
      {children}
    </button>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ProductsInner />
    </Suspense>
  )
}
