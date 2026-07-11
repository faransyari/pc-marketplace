'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LuCpu, LuCheck } from 'react-icons/lu'
import api from '@/lib/api'
import { useSite } from '@/lib/SiteContext'
import { resolveImage } from '@/lib/config'
import ProductCard, { Product } from '@/components/ProductCard'

type Section = {
  id: number
  title: string
  subtitle: string
  image_src: string
  button_label: string
  button_link: string
  background: string
}

export default function Home() {
  const { settings } = useSite()
  const [sections, setSections] = useState<Section[]>([])
  const [featured, setFeatured] = useState<Product[]>([])

  useEffect(() => {
    api.get('homepage-sections/').then(r => setSections(r.data)).catch(() => {})
    api.get('products/?seller_type=official&ordering=-created_at').then(r => setFeatured(r.data.results.slice(0, 8))).catch(() => {})
  }, [])

  return (
    <div>
      <section className="hero-grid border-b border-line">
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="eyebrow mb-4 animate-fade-up">Marketplace · Builder · Compatibility</div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.02] text-ink mb-5 animate-fade-up delay-1">
              {settings.hero_title}
            </h1>
            <p className="text-lg text-muted mb-8 max-w-md animate-fade-up delay-2">{settings.hero_subtitle}</p>
            <div className="flex flex-wrap gap-3 animate-fade-up delay-3">
              <Link href={settings.hero_cta_link || '/products'} className="btn btn-primary">
                {settings.hero_cta_label || 'Shop Now'}
              </Link>
              <Link href="/builder" className="btn btn-ghost">
                <LuCpu /> Build a PC
              </Link>
            </div>
          </div>

          <div className="card p-6 shadow-[var(--shadow-lift)] animate-fade-up delay-2 lg:animate-float">
            <div className="flex items-center justify-between mb-4">
              <span className="eyebrow">System check</span>
              <span className="pill pill-ok pulse-ok"><LuCheck /> Compatible</span>
            </div>
            <div className="space-y-2.5">
              {[
                ['CPU', 'Ryzen 7 7800X3D', 'AM5'],
                ['Motherboard', 'ROG STRIX B650-E', 'AM5'],
                ['Memory', 'Vengeance 32GB', 'DDR5'],
                ['Power Supply', 'RM750e', '750W'],
              ].map(([slot, name, tag]) => (
                <div key={slot} className="flex items-center justify-between border border-line rounded-lg px-3 py-2.5 bg-white/70">
                  <div>
                    <div className="eyebrow">{slot}</div>
                    <div className="text-sm font-medium text-ink">{name}</div>
                  </div>
                  <span className="chip">{tag}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
              <span className="text-sm text-muted">Estimated draw</span>
              <span className="mono text-sm">~620W</span>
            </div>
          </div>
        </div>
      </section>

      {sections.map((s, i) => (
        <section key={s.id} style={{ background: s.background }} className="border-y border-line">
          <div className={`max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}>
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-3">{s.title}</h2>
              <p className="text-muted mb-6 max-w-md">{s.subtitle}</p>
              {s.button_label && (
                <Link href={s.button_link || '/products'} className="btn btn-primary">{s.button_label}</Link>
              )}
            </div>
            <div className="flex items-center justify-center">
              {resolveImage(s.image_src) ? (
                <img src={resolveImage(s.image_src)!} alt={s.title} className="max-h-72 w-auto object-contain drop-shadow-xl animate-float" />
              ) : (
                <div className="w-full aspect-video rounded-xl bg-white/50 border border-line flex items-center justify-center">
                  <LuCpu className="text-5xl text-gray-300" />
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="eyebrow mb-1">From the store</div>
            <h2 className="font-display text-2xl font-semibold text-ink">Featured parts</h2>
          </div>
          <Link href="/products" className="text-sm text-violet hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p, i) => (
            <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
