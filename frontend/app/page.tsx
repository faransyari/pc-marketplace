'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LuArrowRight, LuArrowUpRight } from 'react-icons/lu'
import api from '@/lib/api'
import { useSite } from '@/lib/SiteContext'
import { resolveImage } from '@/lib/config'
import ProductCard, { Product } from '@/components/ProductCard'
import CaseMap from '@/components/CaseMap'
import PartGlyph from '@/components/PartGlyph'

type Section = {
  id: number
  title: string
  subtitle: string
  image_src: string
  button_label: string
  button_link: string
  background: string
}

// The four rules the compatibility engine runs (backend/marketplace/compatibility.py).
const CHECKS = [
  { name: 'Socket', example: 'CPU socket AM5 does not match motherboard socket LGA1700.' },
  { name: 'Memory', example: "6 memory sticks won't fit: the motherboard has 4 slots." },
  { name: 'Drives', example: '3 M.2 drives but the motherboard has 2 M.2 slots.' },
  { name: 'Fans', example: '11 fans but the case only has 10 fan mounts.' },
  { name: 'Fit', example: 'Motherboard form factor ATX may not fit the case (Micro-ATX).' },
  { name: 'Power', example: 'Power supply is 500W but the build needs about 650W.' },
]

export default function Home() {
  const { settings, categories } = useSite()
  const [sections, setSections] = useState<Section[]>([])
  const [featured, setFeatured] = useState<Product[]>([])

  useEffect(() => {
    api.get('homepage-sections/').then(r => setSections(r.data)).catch(() => {})
    api.get('products/?seller_type=official&ordering=-created_at').then(r => setFeatured(r.data.results.slice(0, 8))).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero: headline left, live case schematic right */}
      <section className="border-b-[1.5px] border-ink">
        <div className="shell grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-center pt-12 pb-16 sm:pt-16 sm:pb-20">
          <div className="rise">
            <h1 className="display text-[length:var(--text-hero)] leading-[var(--text-hero--line-height)] mb-6 max-w-[12ch]">
              {settings.hero_title}
            </h1>
            <p className="text-lg text-ink-2 max-w-md mb-8">{settings.hero_subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={settings.hero_cta_link || '/products'} className="btn btn-accent">
                {settings.hero_cta_label || 'Shop parts'} <LuArrowRight />
              </Link>
              <Link href="/builder" className="btn btn-line">Open the builder</Link>
            </div>
            <p className="mt-10 text-sm text-ink-2 max-w-md">
              Pick a bay in the case to shop that part. Parts you add to your build light up here.
            </p>
          </div>

          <div className="rise [animation-delay:120ms]">
            <CaseMap />
          </div>
        </div>
      </section>

      {/* Aisles */}
      {categories.length > 0 && (
        <section className="shell pt-[var(--space-2xl)]">
          <h2 className="display text-2xl sm:text-3xl mb-6">Browse the aisles</h2>
          <ul className="border-t-[1.5px] border-ink">
            {[...categories.map((c: any) => ({ href: `/products?category=${c.slug}`, name: c.name, note: '' })),
              { href: '/products?seller_type=user', name: 'Used parts', note: 'From people upgrading' },
            ].map(row => (
              <li key={row.href}>
                <Link
                  href={row.href}
                  className="group flex items-center justify-between gap-4 py-4 sm:py-5 px-1 border-b-[1.5px] border-ink transition-colors hover:bg-accent sm:hover:px-4"
                  style={{ transitionProperty: 'background-color, padding' }}
                >
                  <span className="display text-[clamp(1.6rem,1rem+2.6vw,3rem)] leading-none">{row.name}</span>
                  <span className="flex items-center gap-4 shrink-0">
                    {row.note && <span className="hidden sm:inline text-sm text-ink-2 group-hover:text-ink">{row.note}</span>}
                    <LuArrowUpRight className="text-2xl sm:text-3xl transition-transform duration-200 group-hover:rotate-45" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Shelf */}
      {featured.length > 0 && (
        <section className="shell pt-[var(--space-3xl)]">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <h2 className="display text-2xl sm:text-3xl">New on the shelf</h2>
            <Link href="/products" className="link text-sm">See every part</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {featured.map((p, i) => (
              <div key={p.id} className="rise" style={{ animationDelay: `${i * 40}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Builder band */}
      <section className="band-dark mt-[var(--space-3xl)]">
        <div className="shell py-[var(--space-2xl)] grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 lg:gap-16 items-center">
          <div>
            <h2 className="display text-[clamp(2rem,1.2rem+3vw,3.5rem)] mb-5 max-w-[14ch]">
              The builder reads the fine print for you.
            </h2>
            <p className="text-paper-3 max-w-md mb-8">
              Every part you add is checked against the rest of the build, down to DIMM slots, M.2 ports and fan mounts. If something won&apos;t fit or won&apos;t power on, you&apos;ll know before you pay for it.
            </p>
            <Link href="/builder" className="btn btn-accent">Start a build <LuArrowRight /></Link>
          </div>

          <ul className="rounded-[var(--radius-card)] border-[1.5px] border-ink-soft overflow-hidden">
            {CHECKS.map((c, i) => (
              <li key={c.name} className={`grid grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[7rem_minmax(0,1fr)] ${i > 0 ? 'border-t border-ink-soft' : ''}`}>
                <span className="flex items-center gap-2 px-4 py-4 border-r border-ink-soft">
                  <span className="led text-warn" />
                  <span className="label !text-paper">{c.name}</span>
                </span>
                <span className="mono text-[0.8rem] leading-relaxed text-paper-3 px-4 py-4">{c.example}</span>
              </li>
            ))}
            <li className="grid grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[7rem_minmax(0,1fr)] border-t border-ink-soft bg-ink-soft">
              <span className="flex items-center gap-2 px-4 py-4 border-r border-ink">
                <span className="led text-ok-bright" />
                <span className="label !text-paper">Clear</span>
              </span>
              <span className="mono text-[0.8rem] text-ok-bright px-4 py-4">No conflicts. Ready to save.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Admin-managed feature sections */}
      {sections.length > 0 && (
        <section className="shell pt-[var(--space-3xl)]">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((s, i) => {
              const img = resolveImage(s.image_src)
              return (
                <article key={s.id} className="panel flex flex-col overflow-hidden">
                  <div className={`aspect-[5/4] flex items-center justify-center overflow-hidden border-b-[1.5px] border-ink ${i % 2 ? 'bg-accent-wash' : 'bg-paper-2'}`}>
                    {img ? (
                      <img src={img} alt="" className="h-[82%] w-auto object-contain mix-blend-multiply" />
                    ) : (
                      <div className="grid grid-cols-3 gap-4 p-8 text-ink" aria-hidden="true">
                        {(['gpu', 'cpu', 'ram', 'psu', 'storage', 'cooler'] as const).map(k => (
                          <PartGlyph key={k} kind={k} className="w-full h-auto max-w-16" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <h3 className="display text-2xl mb-2">{s.title}</h3>
                    <p className="text-sm text-ink-2 mb-6">{s.subtitle}</p>
                    {s.button_label && (
                      <Link href={s.button_link || '/products'} className="btn btn-line btn-sm self-start mt-auto">
                        {s.button_label} <LuArrowRight />
                      </Link>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* Sell */}
      <section className="shell pt-[var(--space-3xl)]">
        <div className="panel bg-accent px-6 py-10 sm:px-10 sm:py-14 grid md:grid-cols-[minmax(0,1fr)_auto] gap-8 items-center relative overflow-hidden">
          <PartGlyph kind="gpu" className="absolute -right-8 -bottom-10 w-64 h-auto text-ink opacity-15 rotate-[-12deg] pointer-events-none" />
          <div className="relative">
            <h2 className="display text-[clamp(2rem,1.2rem+3vw,3.5rem)] mb-3 max-w-[16ch]">
              Upgrading? Your old part has a buyer.
            </h2>
            <p className="text-ink max-w-md">List it in a couple of minutes. Buyers message you straight from the listing.</p>
          </div>
          <Link href="/listings/new" className="btn btn-ink relative justify-self-start">List a part <LuArrowRight /></Link>
        </div>
      </section>
    </div>
  )
}
