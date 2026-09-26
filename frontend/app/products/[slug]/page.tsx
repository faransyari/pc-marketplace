'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { LuCheck, LuPlus, LuArrowRight } from 'react-icons/lu'
import api from '@/lib/api'
import { formatPrice } from '@/lib/config'
import { useAuth } from '@/lib/AuthContext'
import { useBuild, MULTI_SLOTS, MAX_QTY } from '@/lib/BuildContext'
import { Product, ProductVisual } from '@/components/ProductCard'
import { Spinner, ErrorState } from '@/components/States'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { isAuthenticated, user } = useAuth()
  const { slots, addPart, qtyOf } = useBuild()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [msgStatus, setMsgStatus] = useState<'' | 'sending' | 'sent' | 'error'>('')

  useEffect(() => {
    api.get(`products/${slug}/`)
      .then(r => setProduct(r.data))
      .catch(() => setError('This part has left the shelf.'))
      .finally(() => setLoading(false))
  }, [slug])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !msg.trim()) return
    setMsgStatus('sending')
    try {
      await api.post('messages/', { recipient: (product as any).seller, product: product.id, content: msg })
      setMsgStatus('sent')
      setMsg('')
    } catch {
      setMsgStatus('error')
    }
  }

  if (loading) return <Spinner />
  if (error || !product) return <ErrorState message={error || 'Not found'} />

  const p = product as Product & { description?: string; location?: string; seller?: number }
  const isOwnProduct = user && p.seller === user.id
  const multi = !!product.slot_key && MULTI_SLOTS.includes(product.slot_key)
  const inBuildQty: number = qtyOf(product.id)
  const used = !!product.condition && product.condition !== 'new'

  const specs: [string, string | number | undefined | null][] = [
    ['Socket', product.socket],
    ['Memory', product.memory_type],
    ['Form factor', product.form_factor?.split(',').join(', ')],
    ['Power draw', product.wattage && product.slot_key !== 'psu' ? `${product.wattage} W` : null],
    ['Capacity', product.wattage && product.slot_key === 'psu' ? `${product.wattage} W` : null],
    ['Memory kit', product.memory_modules && product.memory_capacity_gb ? `${product.memory_modules} × ${Math.round(product.memory_capacity_gb / product.memory_modules)} GB (${product.memory_capacity_gb} GB)` : null],
    ['Interface', product.storage_interface],
    ['DIMM slots', product.memory_slots],
    ['Max memory', product.max_memory_gb ? `${product.max_memory_gb} GB` : null],
    ['M.2 slots', product.m2_slots],
    ['SATA ports', product.sata_ports],
    ['Fan headers', product.fan_headers],
    ['Fan mounts', product.fan_mounts],
    ['Fan size', product.fan_size ? product.fan_size.split(',').map(x => `${x.trim()} mm`).join(', ') : null],
    ['Condition', product.condition ? product.condition[0].toUpperCase() + product.condition.slice(1) : null],
    ['In stock', product.stock ?? 0],
    ['Seller', product.seller_username],
    ['Location', p.location],
  ]

  return (
    <div className="shell pt-8 sm:pt-10">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-ink-2 mb-6" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-ink">Shop</Link>
        {product.slot_key && product.component_type_name && (
          <>
            <span aria-hidden="true">/</span>
            <Link href={`/products?slot=${product.slot_key}`} className="hover:text-ink">{product.component_type_name}</Link>
          </>
        )}
      </nav>

      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 lg:gap-14 items-start">
        <div className="md:sticky md:top-24">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between h-10 px-4 border-b-[1.5px] border-ink">
              <span className="label !text-ink">{product.component_type_name || product.category_name || 'Part'}</span>
              {used ? <span className="tag tag-accent">{product.condition}</span> : <span className="tag tag-plain">New</span>}
            </div>
            <div className="aspect-square bg-paper-2 flex items-center justify-center">
              <ProductVisual product={product} className="w-[46%] h-auto text-ink" />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          {product.brand && <p className="text-ink-2 mb-2">{product.brand}</p>}
          <h1 className="display text-[clamp(2rem,1.4rem+2.2vw,3.1rem)] mb-5">{product.title}</h1>

          <p className="num text-3xl font-semibold mb-6">{formatPrice(product.price)}</p>

          {product.slot_key ? (
            <div className="flex flex-wrap items-center gap-3 mb-8">
              {inBuildQty > 0 && !multi ? (
                <>
                  <span className="btn btn-line pointer-events-none" aria-live="polite"><LuCheck className="text-ok" /> In your build</span>
                  <Link href="/builder" className="btn btn-ink">Open builder <LuArrowRight /></Link>
                </>
              ) : (
                <>
                  <button className="btn btn-accent" onClick={() => addPart(product)} disabled={inBuildQty >= MAX_QTY}>
                    <LuPlus /> {multi && inBuildQty > 0 ? 'Add another' : slots[product.slot_key] && !multi ? 'Swap into your build' : 'Add to build'}
                  </button>
                  {inBuildQty > 0 && (
                    <>
                      <span className="num text-sm" aria-live="polite">{inBuildQty} in your build</span>
                      <Link href="/builder" className="link text-sm">Open builder</Link>
                    </>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="mb-8" />
          )}

          <dl className="border-t-[1.5px] border-ink mb-8">
            {specs.filter(([, v]) => v !== null && v !== undefined && v !== '').map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 py-2.5 border-b border-rule text-sm">
                <dt className="text-ink-2">{k}</dt>
                <dd className="num text-ink text-right truncate">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="text-ink-2 leading-relaxed mb-10 max-w-prose">{p.description || 'The seller has not added a description.'}</p>

          {!isOwnProduct && (
            <section className="panel p-5" aria-labelledby="ask-heading">
              <h2 id="ask-heading" className="display text-xl mb-1">Ask the seller</h2>
              <p className="text-sm text-ink-2 mb-4">Questions go straight to {product.seller_username || 'the seller'}&apos;s inbox.</p>
              {isAuthenticated ? (
                msgStatus === 'sent' ? (
                  <p className="tag tag-ok"><LuCheck /> Sent. Replies land in your messages.</p>
                ) : (
                  <form onSubmit={sendMessage} className="space-y-3">
                    <label htmlFor="ask" className="sr-only">Message</label>
                    <textarea id="ask" className="field" rows={3} placeholder="Is this still available?" value={msg} onChange={e => setMsg(e.target.value)} />
                    {msgStatus === 'error' && <p className="notice-error">Couldn&apos;t send that. Check your connection and try again.</p>}
                    <button className="btn btn-ink" type="submit" disabled={!msg.trim() || msgStatus === 'sending'} data-state={msgStatus === 'sending' ? 'loading' : undefined}>
                      {msgStatus === 'sending' ? 'Sending…' : 'Send message'}
                    </button>
                  </form>
                )
              ) : (
                <p className="text-sm">
                  <Link href="/login" className="link">Sign in</Link> to message the seller.
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
