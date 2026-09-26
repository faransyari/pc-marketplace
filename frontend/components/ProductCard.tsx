'use client'
import Link from 'next/link'
import { resolveImage, formatPrice } from '@/lib/config'
import PartGlyph, { glyphFor } from './PartGlyph'

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
  memory_slots?: number | null
  max_memory_gb?: number | null
  m2_slots?: number | null
  sata_ports?: number | null
  fan_headers?: number | null
  memory_modules?: number | null
  memory_capacity_gb?: number | null
  storage_interface?: string
  fan_mounts?: number | null
  fan_size?: string
}

export function specChips(p: Product) {
  const chips: string[] = []
  if (p.socket) chips.push(p.socket)
  if (p.memory_modules && p.memory_capacity_gb) {
    chips.push(`${p.memory_modules}×${Math.round(p.memory_capacity_gb / p.memory_modules)}GB`)
  }
  if (p.memory_type) chips.push(p.memory_type)
  if (p.storage_interface) chips.push(p.storage_interface)
  if (p.slot_key === 'fan' && p.fan_size) chips.push(`${p.fan_size}mm`)
  if (p.form_factor) chips.push(p.form_factor.split(',')[0])
  if (p.wattage) chips.push(`${p.wattage}W`)
  return chips
}

export function ProductVisual({ product, className = '' }: { product: Product; className?: string }) {
  const img = resolveImage(product.image_src || null)
  if (img) {
    return <img src={img} alt={product.title} className={`w-full h-full object-contain mix-blend-multiply ${className}`} />
  }
  return <PartGlyph kind={glyphFor(product)} className={className} />
}

export default function ProductCard({ product }: { product: Product }) {
  const chips = specChips(product)
  const used = !!product.condition && product.condition !== 'new'
  const kind = product.component_type_name || product.category_name || 'Part'

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group panel lift flex flex-col overflow-hidden min-w-0 h-full"
    >
      <div className="flex items-center justify-between gap-2 px-3 h-9 border-b-[1.5px] border-ink">
        <span className="label !text-ink truncate">{kind}</span>
        {used ? (
          <span className="tag tag-accent">{product.condition}</span>
        ) : (
          <span className="tag tag-plain">New</span>
        )}
      </div>

      <div className="relative aspect-[4/3] bg-paper-2 flex items-center justify-center overflow-hidden">
        <ProductVisual
          product={product}
          className="w-[42%] h-auto text-ink transition-transform duration-300 ease-[var(--ease-out)] group-hover:-rotate-6 group-hover:scale-110"
        />
      </div>

      <div className="flex flex-col flex-1 p-3.5 border-t-[1.5px] border-ink">
        {product.brand && <span className="text-xs text-ink-2 mb-0.5">{product.brand}</span>}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2">{product.title}</h3>
        {chips.length > 0 && (
          <p className="mono text-[0.7rem] text-ink-2 mb-3 truncate">{chips.slice(0, 3).join(' · ')}</p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5 border-t border-dashed border-rule">
          <span className="num font-semibold text-[0.95rem] leading-none whitespace-nowrap">{formatPrice(product.price)}</span>
          {product.slot_key && (
            <span className="text-[0.7rem] text-ink-2 whitespace-nowrap hidden sm:inline">Fits the builder</span>
          )}
        </div>
      </div>
    </Link>
  )
}
