'use client'
import Link from 'next/link'
import { LuCpu } from 'react-icons/lu'
import { resolveImage, formatPrice } from '@/lib/config'

export type Product = {
  id: number
  title: string
  slug: string
  brand: string
  price: string
  condition: string
  seller_type: string
  seller_username?: string
  component_type_name?: string
  category_name?: string
  slot_key?: string
  wattage?: number | null
  socket?: string
  memory_type?: string
  form_factor?: string
  image_src?: string | null
  stock?: number
}

export function specChips(p: Product) {
  const chips: string[] = []
  if (p.socket) chips.push(p.socket)
  if (p.memory_type) chips.push(p.memory_type)
  if (p.form_factor) chips.push(p.form_factor.split(',')[0])
  if (p.wattage) chips.push(`${p.wattage}W`)
  return chips
}

export default function ProductCard({ product }: { product: Product }) {
  const img = resolveImage(product.image_src || null)
  const chips = specChips(product)

  return (
    <Link href={`/products/${product.slug}`} className="card card-hover overflow-hidden flex flex-col group">
      <div className="aspect-[4/3] bg-panel flex items-center justify-center overflow-hidden">
        {img ? (
          <img src={img} alt={product.title} className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-110" />
        ) : (
          <LuCpu className="text-4xl text-gray-300 transition-transform duration-300 group-hover:scale-110" />
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="eyebrow">{product.brand || product.component_type_name || product.category_name}</span>
          {product.seller_type === 'official' ? (
            <span className="pill pill-info">Store</span>
          ) : (
            <span className="pill pill-warn">Used</span>
          )}
        </div>
        <h3 className="font-medium text-ink text-sm leading-snug line-clamp-2 mb-2">{product.title}</h3>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {chips.slice(0, 3).map(c => <span key={c} className="chip">{c}</span>)}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className="mono font-semibold text-ink">{formatPrice(product.price)}</span>
          {product.slot_key && <span className="chip">Buildable</span>}
        </div>
      </div>
    </Link>
  )
}
