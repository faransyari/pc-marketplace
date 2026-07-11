'use client'
import Link from 'next/link'
import { LuCpu } from 'react-icons/lu'
import { useSite } from '@/lib/SiteContext'

export default function Footer() {
  const { settings } = useSite()

  return (
    <footer className="border-t border-line mt-24 bg-panel">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <LuCpu className="text-violet text-xl" />
            <span className="font-display font-semibold text-lg">{settings.logo_text}</span>
          </div>
          <p className="text-sm text-muted max-w-sm">{settings.footer_about}</p>
        </div>
        <div>
          <div className="eyebrow mb-3">Explore</div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link href="/products" className="hover:text-violet">Shop parts</Link></li>
            <li><Link href="/builder" className="hover:text-violet">PC Builder</Link></li>
            <li><Link href="/listings/new" className="hover:text-violet">Sell a part</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-3">Contact</div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="mono">{settings.contact_email}</li>
            {settings.footer_contact && <li>{settings.footer_contact}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-muted mono">
          © {new Date().getFullYear()} {settings.logo_text}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
