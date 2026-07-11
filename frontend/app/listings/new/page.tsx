'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { useSite } from '@/lib/SiteContext'
import { Spinner } from '@/components/States'

export default function NewListingPage() {
  const { isAuthenticated, loading } = useAuth()
  const { categories, componentTypes } = useSite()
  const router = useRouter()

  const [form, setForm] = useState({
    title: '', brand: '', description: '', price: '', condition: 'used',
    category: '', component_type: '', stock: '1', location: '', image_url: '',
    wattage: '', socket: '', memory_type: '', form_factor: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title || !form.price) return setError('Title and price are required.')
    setBusy(true)
    try {
      const payload: any = {
        title: form.title,
        brand: form.brand,
        description: form.description,
        price: form.price,
        condition: form.condition,
        stock: Number(form.stock) || 1,
        seller_type: 'user',
        location: form.location,
        image_url: form.image_url,
        socket: form.socket,
        memory_type: form.memory_type,
        form_factor: form.form_factor,
      }
      if (form.category) payload.category = Number(form.category)
      if (form.component_type) payload.component_type = Number(form.component_type)
      if (form.wattage) payload.wattage = Number(form.wattage)
      const res = await api.post('products/', payload)
      router.push(`/products/${res.data.slug}`)
    } catch (err: any) {
      const data = err?.response?.data
      setError(data ? Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(' ') : 'Could not create listing.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/profile" className="text-sm text-violet hover:underline">← Back to profile</Link>
      <div className="eyebrow mb-1 mt-4">Sell a part</div>
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">Create a listing</h1>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Title"><input className="field" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. RTX 3070 Founders Edition" /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Brand"><input className="field" value={form.brand} onChange={e => set('brand', e.target.value)} /></Field>
          <Field label="Price (Rp)"><input className="field mono" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" /></Field>
        </div>
        <Field label="Description"><textarea className="field" rows={3} value={form.description} onChange={e => set('description', e.target.value)} /></Field>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Condition">
            <select className="field" value={form.condition} onChange={e => set('condition', e.target.value)}>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </Field>
          <Field label="Category">
            <select className="field" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">—</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Component type">
            <select className="field" value={form.component_type} onChange={e => set('component_type', e.target.value)}>
              <option value="">—</option>
              {componentTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Stock"><input className="field mono" value={form.stock} onChange={e => set('stock', e.target.value)} /></Field>
          <Field label="Location"><input className="field" value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, State" /></Field>
          <Field label="Image URL"><input className="field" value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://…" /></Field>
        </div>

        <details className="card p-4">
          <summary className="cursor-pointer text-sm font-medium text-ink">Compatibility details (for buildable parts)</summary>
          <div className="grid sm:grid-cols-4 gap-4 mt-4">
            <Field label="Wattage"><input className="field mono" value={form.wattage} onChange={e => set('wattage', e.target.value)} placeholder="0" /></Field>
            <Field label="Socket"><input className="field" value={form.socket} onChange={e => set('socket', e.target.value)} placeholder="AM5" /></Field>
            <Field label="Memory type"><input className="field" value={form.memory_type} onChange={e => set('memory_type', e.target.value)} placeholder="DDR5" /></Field>
            <Field label="Form factor"><input className="field" value={form.form_factor} onChange={e => set('form_factor', e.target.value)} placeholder="ATX" /></Field>
          </div>
        </details>

        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Publishing…' : 'Publish listing'}</button>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      {children}
    </label>
  )
}
