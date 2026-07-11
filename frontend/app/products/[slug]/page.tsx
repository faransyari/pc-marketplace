'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { LuCpu, LuCheck } from 'react-icons/lu'
import api from '@/lib/api'
import { resolveImage } from '@/lib/config'
import { useAuth } from '@/lib/AuthContext'
import { useBuild } from '@/lib/BuildContext'
import { specChips, Product } from '@/components/ProductCard'
import { Spinner, ErrorState } from '@/components/States'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { isAuthenticated, user } = useAuth()
  const { setSlot } = useBuild()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgStatus, setMsgStatus] = useState('')

  useEffect(() => {
    api.get(`products/${slug}/`)
      .then(r => setProduct(r.data))
      .catch(() => setError('This product could not be found.'))
      .finally(() => setLoading(false))
  }, [slug])

  const addToBuild = () => {
    if (!product) return
    setSlot(product)
    setAdded(true)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !msg.trim()) return
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

  const img = resolveImage(product.image_src || null)
  const chips = specChips(product)
  const isOwnProduct = user && (product as any).seller === user.id

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link href="/products" className="text-sm text-violet hover:underline">← Back to shop</Link>
      <div className="grid md:grid-cols-2 gap-10 mt-4">
        <div className="card aspect-square bg-panel flex items-center justify-center overflow-hidden">
          {img ? <img src={img} alt={product.title} className="w-full h-full object-contain p-8" /> : <LuCpu className="text-6xl text-gray-300" />}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="eyebrow">{product.brand || product.category_name}</span>
            {product.seller_type === 'official'
              ? <span className="pill pill-info">Official store</span>
              : <span className="pill pill-warn">Community · {product.condition}</span>}
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink mb-3">{product.title}</h1>
          <div className="mono text-2xl font-semibold text-ink mb-4">${Number(product.price).toLocaleString()}</div>

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {chips.map(c => <span key={c} className="chip">{c}</span>)}
              {product.component_type_name && <span className="chip">{product.component_type_name}</span>}
            </div>
          )}

          <p className="text-sm text-muted mb-6 leading-relaxed">{(product as any).description || 'No description provided.'}</p>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            {product.slot_key && (
              <button className="btn btn-primary" onClick={addToBuild}>
                {added ? <><LuCheck /> Added to build</> : <><LuCpu /> Add to build</>}
              </button>
            )}
            {added && <Link href="/builder" className="btn btn-ghost">Open builder</Link>}
          </div>

          <dl className="grid grid-cols-2 gap-y-2 text-sm border-t border-line pt-5">
            <dt className="text-muted">Seller</dt>
            <dd className="text-right">{product.seller_username}</dd>
            <dt className="text-muted">Stock</dt>
            <dd className="text-right mono">{product.stock ?? 0}</dd>
            {(product as any).location && (<><dt className="text-muted">Location</dt><dd className="text-right">{(product as any).location}</dd></>)}
          </dl>

          {!isOwnProduct && (
            <div className="card p-4 mt-6">
              <div className="eyebrow mb-2">Message the seller</div>
              {isAuthenticated ? (
                msgStatus === 'sent' ? (
                  <p className="pill pill-ok inline-flex">Message sent</p>
                ) : (
                  <form onSubmit={sendMessage} className="space-y-2">
                    <textarea className="field" rows={3} placeholder="Is this still available?" value={msg} onChange={e => setMsg(e.target.value)} />
                    <button className="btn btn-primary w-full" type="submit">Send message</button>
                    {msgStatus === 'error' && <p className="text-sm text-danger">Could not send. Try again.</p>}
                  </form>
                )
              ) : (
                <p className="text-sm text-muted">
                  <Link href="/login" className="text-violet hover:underline">Sign in</Link> to message the seller.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
