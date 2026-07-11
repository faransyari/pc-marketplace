'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import api from './api'

export const SiteContext = createContext(null)

const FALLBACK = {
  logo_text: 'PC Marketplace',
  contact_email: 'hello@pcmarketplace.test',
  primary_color: '#6d28d9',
  hero_title: 'Everything PCs',
  hero_subtitle: 'Buy, sell, and build your dream machine.',
  hero_cta_label: 'Shop Now',
  hero_cta_link: '/products',
  footer_about: 'Your marketplace for buying, selling, and building PCs.',
  footer_contact: '',
}

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK)
  const [categories, setCategories] = useState([])
  const [componentTypes, setComponentTypes] = useState([])

  useEffect(() => {
    api.get('site-settings/').then(res => setSettings(res.data)).catch(() => {})
    api.get('categories/').then(res => setCategories(res.data.results || res.data)).catch(() => {})
    api.get('components/').then(res => setComponentTypes(res.data.results || res.data)).catch(() => {})
  }, [])

  return (
    <SiteContext.Provider value={{ settings, categories, componentTypes }}>
      {children}
    </SiteContext.Provider>
  )
}

/** @returns {any} */
export function useSite() {
  return useContext(SiteContext)
}
