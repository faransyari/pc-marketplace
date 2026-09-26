'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LuSlidersHorizontal, LuX } from 'react-icons/lu'
import api from '@/lib/api'
import { useSite } from '@/lib/SiteContext'
import ProductCard, { Product } from '@/components/ProductCard'
import PartGlyph, { GlyphKind } from '@/components/PartGlyph'
import { Spinner, EmptyState } from '@/components/States'

const SLOTS: [GlyphKind, string][] = [
  ['cpu', 'CPU'], ['mobo', 'Motherboard'], ['ram', 'Memory'], ['gpu', 'Graphics'],
  ['storage', 'Storage'], ['psu', 'Power supply'], ['case', 'Case'], ['cooler', 'Cooler'], ['fan', 'Fans'],
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
  const [filtersOpen, setFiltersOpen] = useState(false)

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

  const categoryName = categories.find((c: any) => c.slug === category)?.name
  const slotName = SLOTS.find(([k]) => k === slot)?.[1]
  const heading = search
    ? `“${search}”`
    : slotName || categoryName || (sellerType === 'user' ? 'Used parts' : sellerType === 'official' ? 'From the store' : 'Every part')

  const active: { label: string; clear: () => void }[] = []
  if (search) active.push({ label: `Search: ${search}`, clear: () => { setSearch(''); setPage(1) } })
  if (categoryName) active.push({ label: categoryName, clear: () => { setCategory(''); setPage(1) } })
  if (slotName) active.push({ label: slotName, clear: () => { setSlot(''); setPage(1) } })
  if (sellerType) active.push({ label: sellerType === 'user' ? 'Community' : 'Official store', clear: () => { setSellerType(''); setPage(1) } })
  if (minPrice) active.push({ label: `From Rp${Number(minPrice).toLocaleString('id-ID')}`, clear: () => { setMinPrice(''); setPage(1) } })
  if (maxPrice) active.push({ label: `Up to Rp${Number(maxPrice).toLocaleString('id-ID')}`, clear: () => { setMaxPrice(''); setPage(1) } })

  return (
    <div>
      <div className="border-b-[1.5px] border-ink">
        <div className="shell pt-10 sm:pt-14 pb-6">
          <h1 className="display text-[length:var(--text-page)] leading-[var(--text-page--line-height)] mb-3 truncate">{heading}</h1>
          <p className="num text-sm text-ink-2">
            {loading ? 'Counting…' : `${count} part${count !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Slot rail */}
        <div className="shell pb-5">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-1 px-1 py-1" role="group" aria-label="Filter by builder slot">
            {SLOTS.map(([k, label]) => {
              const on = slot === k
              return (
                <button
                  key={k}
                  onClick={() => { setSlot(on ? '' : k); setPage(1) }}
                  aria-pressed={on}
                  className={`group shrink-0 flex items-center gap-2 h-11 pl-2 pr-3.5 rounded-[var(--radius-control)] border-[1.5px] text-sm font-medium transition-colors cursor-pointer ${
                    on ? 'bg-accent border-ink' : 'bg-paper border-rule hover:border-ink'
                  }`}
                >
                  <PartGlyph kind={k} className="w-7 h-7 transition-transform duration-200 group-hover:-rotate-6" />
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="shell pt-8 grid md:grid-cols-[13.5rem_minmax(0,1fr)] gap-8 lg:gap-12">
        <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block space-y-7`}>
          <FilterGroup title="Aisle">
            <FilterBtn active={!category} onClick={() => { setCategory(''); setPage(1) }}>Everything</FilterBtn>
            {categories.map((c: any) => (
              <FilterBtn key={c.id} active={category === c.slug} onClick={() => { setCategory(c.slug); setPage(1) }}>{c.name}</FilterBtn>
            ))}
          </FilterGroup>
          <FilterGroup title="Seller">
            <FilterBtn active={!sellerType} onClick={() => { setSellerType(''); setPage(1) }}>Anyone</FilterBtn>
            <FilterBtn active={sellerType === 'official'} onClick={() => { setSellerType('official'); setPage(1) }}>Official store</FilterBtn>
            <FilterBtn active={sellerType === 'user'} onClick={() => { setSellerType('user'); setPage(1) }}>Community, used</FilterBtn>
          </FilterGroup>
          <FilterGroup title="Price (Rp)">
            <div className="grid grid-cols-2 gap-2">
              <label className="sr-only" htmlFor="min-price">Minimum price</label>
              <input id="min-price" inputMode="numeric" className="field num" placeholder="Min" value={minPrice}
                onChange={e => { setMinPrice(e.target.value.replace(/\D/g, '')); setPage(1) }} />
              <label className="sr-only" htmlFor="max-price">Maximum price</label>
              <input id="max-price" inputMode="numeric" className="field num" placeholder="Max" value={maxPrice}
                onChange={e => { setMaxPrice(e.target.value.replace(/\D/g, '')); setPage(1) }} />
            </div>
          </FilterGroup>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className="btn btn-line btn-sm md:hidden"
              aria-expanded={filtersOpen}
            >
              <LuSlidersHorizontal /> Filters
            </button>
            <div className="flex flex-wrap gap-2 flex-1 min-w-0">
              {active.map(a => (
                <button key={a.label} onClick={a.clear}
                  className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-full bg-ink text-paper text-xs font-medium hover:bg-ink-2 transition-colors cursor-pointer max-w-full"
                  aria-label={`Remove filter ${a.label}`}>
                  <span className="truncate">{a.label}</span> <LuX className="shrink-0" />
                </button>
              ))}
              {active.length > 1 && (
                <button onClick={reset} className="link text-xs px-1 cursor-pointer">Clear all</button>
              )}
            </div>
            <label className="sr-only" htmlFor="sort">Sort</label>
            <select id="sort" className="field !w-auto !min-h-9 text-sm ml-auto" value={ordering}
              onChange={e => { setOrdering(e.target.value); setPage(1) }}>
              <option value="-created_at">Newest first</option>
              <option value="price">Cheapest first</option>
              <option value="-price">Priciest first</option>
              <option value="title">A to Z</option>
            </select>
          </div>

          {loading ? <Spinner label="Stocking the shelf" /> : products.length === 0 ? (
            <EmptyState
              title="Nothing on this shelf"
              hint="Try a wider price range or drop a filter."
              glyph={(slot as GlyphKind) || 'box'}
            />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {pages > 1 && (
            <nav className="flex justify-center items-center gap-3 mt-12" aria-label="Pagination">
              <button className="btn btn-line btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span className="num text-sm px-2">{page} / {pages}</span>
              <button className="btn btn-line btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label mb-2.5">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2.5 w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
        active ? 'font-semibold text-ink' : 'text-ink-2 hover:text-ink hover:bg-paper-2'
      }`}
    >
      <span className={`led ${active ? 'text-accent' : 'text-paper-3'}`} />
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
