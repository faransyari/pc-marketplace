'use client'
import Link from 'next/link'
import { useSite } from '@/lib/SiteContext'

export default function Footer() {
  const { settings, categories } = useSite()

  return (
    <footer className="band-dark mt-[var(--space-3xl)]">
      <div className="shell pt-[var(--space-2xl)] pb-[var(--space-lg)]">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <p className="display text-3xl sm:text-4xl leading-[1] max-w-md">
              Built here. <span className="text-accent">Checked here.</span>
            </p>
            <p className="text-paper-3 mt-4 max-w-sm text-sm">{settings.footer_about}</p>
            <a href={`mailto:${settings.contact_email}`} className="inline-block mt-5 mono text-sm text-paper hover:text-accent transition-colors">
              {settings.contact_email}
            </a>
          </div>

          <nav aria-label="Shop">
            <p className="label !text-ink-3 mb-3">Shop</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-accent transition-colors">Everything</Link></li>
              {categories.map((c: any) => (
                <li key={c.id}>
                  <Link href={`/products?category=${c.slug}`} className="hover:text-accent transition-colors">{c.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Build and sell">
            <p className="label !text-ink-3 mb-3">Build &amp; sell</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/builder" className="hover:text-accent transition-colors">PC builder</Link></li>
              <li><Link href="/listings/new" className="hover:text-accent transition-colors">List a part</Link></li>
              <li><Link href="/messages" className="hover:text-accent transition-colors">Messages</Link></li>
              {settings.footer_contact && <li className="text-paper-3">{settings.footer_contact}</li>}
            </ul>
          </nav>
        </div>

        <div
          className="display display-wide mt-[var(--space-2xl)] text-[clamp(2rem,8.4vw,7.6rem)] leading-[0.8] text-ink-soft select-none whitespace-nowrap overflow-hidden"
          aria-hidden="true"
        >
          {settings.logo_text}
        </div>

        <div className="mt-6 pt-5 border-t border-ink-soft flex flex-wrap gap-x-6 gap-y-2 justify-between text-xs text-ink-3 mono">
          <span>© {new Date().getFullYear()} {settings.logo_text}</span>
          <span>Prices in Rupiah</span>
        </div>
      </div>
    </footer>
  )
}
