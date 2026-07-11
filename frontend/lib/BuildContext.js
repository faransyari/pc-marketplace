'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from './api'

export const BuildContext = createContext(null)

const STORAGE_KEY = 'pcm_build'

export const SLOTS = [
  { key: 'cpu', label: 'Processor' },
  { key: 'mobo', label: 'Motherboard' },
  { key: 'ram', label: 'Memory' },
  { key: 'gpu', label: 'Graphics Card' },
  { key: 'storage', label: 'Storage' },
  { key: 'psu', label: 'Power Supply' },
  { key: 'case', label: 'Case' },
  { key: 'cooler', label: 'Cooler' },
]

export function BuildProvider({ children }) {
  const [slots, setSlots] = useState({})
  const [analysis, setAnalysis] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setSlots(JSON.parse(saved))
    } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots))
    const ids = Object.values(slots).map(p => p.id)
    if (ids.length === 0) {
      setAnalysis(null)
      return
    }
    api.post('builds/validate/', { products: ids })
      .then(res => setAnalysis(res.data))
      .catch(() => setAnalysis(null))
  }, [slots, ready])

  const setSlot = useCallback((product) => {
    if (!product.slot_key) return
    setSlots(prev => ({ ...prev, [product.slot_key]: product }))
  }, [])

  const clearSlot = useCallback((key) => {
    setSlots(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const clearAll = useCallback(() => setSlots({}), [])

  const count = Object.keys(slots).length
  const total = Object.values(slots).reduce((sum, p) => sum + Number(p.price), 0)

  return (
    <BuildContext.Provider value={{ slots, setSlot, clearSlot, clearAll, analysis, count, total, ready }}>
      {children}
    </BuildContext.Provider>
  )
}

/** @returns {any} */
export function useBuild() {
  return useContext(BuildContext)
}
