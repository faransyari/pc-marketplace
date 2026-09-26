'use client'
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import api from './api'

export const BuildContext = createContext(null)

const STORAGE_KEY = 'pcm_build'

export const SLOTS = [
  { key: 'cpu', label: 'Processor' },
  { key: 'mobo', label: 'Motherboard' },
  { key: 'ram', label: 'Memory', multi: true },
  { key: 'gpu', label: 'Graphics Card' },
  { key: 'storage', label: 'Storage', multi: true },
  { key: 'psu', label: 'Power Supply' },
  { key: 'case', label: 'Case' },
  { key: 'cooler', label: 'Cooler' },
  { key: 'fan', label: 'Case Fans', multi: true },
]

export const MULTI_SLOTS = SLOTS.filter(s => s.multi).map(s => s.key)
export const MAX_QTY = 12

// Stored shape: { [slot]: [{ product, qty }] }. Older saves stored { [slot]: product }.
function migrate(saved) {
  const out = {}
  for (const [slot, value] of Object.entries(saved || {})) {
    if (Array.isArray(value)) {
      const lines = value.filter(l => l && l.product && l.qty > 0)
      if (lines.length) out[slot] = lines
    } else if (value && value.id) {
      out[slot] = [{ product: value, qty: 1 }]
    }
  }
  return out
}

export function BuildProvider({ children }) {
  const [items, setItems] = useState({})
  const [analysis, setAnalysis] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(migrate(JSON.parse(saved)))
    } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
    const lines = Object.values(items).flat()
    if (lines.length === 0) {
      setAnalysis(null)
      return
    }
    api.post('builds/validate/', { items: lines.map(l => ({ product: l.product.id, quantity: l.qty })) })
      .then(res => setAnalysis(res.data))
      .catch(() => setAnalysis(null))
  }, [items, ready])

  // Add one unit. Multi slots stack (or add a new line); single slots replace.
  const addPart = useCallback((product, qty = 1) => {
    const slot = product.slot_key
    if (!slot) return
    setItems(prev => {
      const lines = prev[slot] || []
      if (!MULTI_SLOTS.includes(slot)) return { ...prev, [slot]: [{ product, qty: 1 }] }
      const existing = lines.find(l => l.product.id === product.id)
      const next = existing
        ? lines.map(l => (l.product.id === product.id ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
        : [...lines, { product, qty }]
      return { ...prev, [slot]: next }
    })
  }, [])

  // Put a product in place of another line (or the whole slot for single slots).
  const replacePart = useCallback((slot, oldId, product) => {
    setItems(prev => {
      const lines = prev[slot] || []
      if (!MULTI_SLOTS.includes(slot) || oldId == null) return { ...prev, [slot]: [{ product, qty: 1 }] }
      const dup = lines.find(l => l.product.id === product.id && l.product.id !== oldId)
      const old = lines.find(l => l.product.id === oldId)
      let next = lines.filter(l => l.product.id !== oldId)
      if (dup) {
        next = next.map(l => (l.product.id === product.id ? { ...l, qty: Math.min(MAX_QTY, l.qty + (old?.qty || 1)) } : l))
      } else {
        const idx = lines.findIndex(l => l.product.id === oldId)
        next.splice(Math.max(idx, 0), 0, { product, qty: old?.qty || 1 })
      }
      return { ...prev, [slot]: next }
    })
  }, [])

  const setQty = useCallback((slot, productId, qty) => {
    setItems(prev => {
      const lines = (prev[slot] || [])
        .map(l => (l.product.id === productId ? { ...l, qty: Math.min(MAX_QTY, qty) } : l))
        .filter(l => l.qty > 0)
      const next = { ...prev }
      if (lines.length) next[slot] = lines
      else delete next[slot]
      return next
    })
  }, [])

  const removePart = useCallback((slot, productId) => setQty(slot, productId, 0), [setQty])

  const clearSlot = useCallback((slot) => {
    setItems(prev => {
      const next = { ...prev }
      delete next[slot]
      return next
    })
  }, [])

  const clearAll = useCallback(() => setItems({}), [])

  const value = useMemo(() => {
    // First product per slot, for places that only need "is this slot filled".
    const slots = Object.fromEntries(Object.entries(items).map(([k, lines]) => [k, lines[0].product]))
    const lines = Object.values(items).flat()
    return {
      items,
      slots,
      addPart,
      setSlot: addPart,
      replacePart,
      setQty,
      removePart,
      clearSlot,
      clearAll,
      analysis,
      count: Object.keys(items).length,
      partCount: lines.reduce((n, l) => n + l.qty, 0),
      total: lines.reduce((sum, l) => sum + Number(l.product.price) * l.qty, 0),
      qtyOf: (productId) => lines.filter(l => l.product.id === productId).reduce((n, l) => n + l.qty, 0),
      ready,
    }
  }, [items, analysis, ready, addPart, replacePart, setQty, removePart, clearSlot, clearAll])

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>
}

/** @returns {any} */
export function useBuild() {
  return useContext(BuildContext)
}
