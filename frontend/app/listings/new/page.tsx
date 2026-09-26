'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { useSite } from '@/lib/SiteContext'
import ProductCard, { Product } from '@/components/ProductCard'
import { Spinner } from '@/components/States'

type SpecKey =
  | 'wattage' | 'socket' | 'memory_type' | 'form_factor' | 'memory_slots' | 'max_memory_gb' | 'm2_slots'
  | 'sata_ports' | 'fan_headers' | 'memory_modules' | 'memory_capacity_gb' | 'storage_interface' | 'fan_mounts' | 'fan_size'

const NUMERIC_SPECS = ['memory_slots', 'max_memory_gb', 'm2_slots', 'sata_ports', 'fan_headers', 'memory_modules', 'memory_capacity_gb', 'fan_mounts'] as const

type Spec = { key: SpecKey; label: string; placeholder?: string; numeric?: boolean; options?: string[] }

// The spec fields the builder actually checks, per part type.
const SPECS_BY_SLOT: Record<string, Spec[]> = {
  cpu: [{ key: 'socket', label: 'Socket', placeholder: 'AM5' }, { key: 'wattage', label: 'Watts', placeholder: '105', numeric: true }],
  mobo: [
    { key: 'socket', label: 'Socket', placeholder: 'AM5' },
    { key: 'memory_type', label: 'Memory type', placeholder: 'DDR5' },
    { key: 'form_factor', label: 'Form factor', placeholder: 'ATX' },
    { key: 'memory_slots', label: 'DIMM slots', placeholder: '4', numeric: true },
    { key: 'max_memory_gb', label: 'Max memory (GB)', placeholder: '192', numeric: true },
    { key: 'm2_slots', label: 'M.2 slots', placeholder: '3', numeric: true },
    { key: 'sata_ports', label: 'SATA ports', placeholder: '4', numeric: true },
    { key: 'fan_headers', label: 'Fan headers', placeholder: '6', numeric: true },
  ],
  ram: [
    { key: 'memory_type', label: 'Memory type', placeholder: 'DDR5' },
    { key: 'memory_modules', label: 'Sticks in kit', placeholder: '2', numeric: true },
    { key: 'memory_capacity_gb', label: 'Kit total (GB)', placeholder: '32', numeric: true },
    { key: 'wattage', label: 'Watts', placeholder: '10', numeric: true },
  ],
  gpu: [{ key: 'wattage', label: 'Watts', placeholder: '220', numeric: true }],
  storage: [
    { key: 'storage_interface', label: 'Interface', options: ['M.2', 'SATA'] },
    { key: 'wattage', label: 'Watts', placeholder: '7', numeric: true },
  ],
  psu: [{ key: 'wattage', label: 'Capacity (W)', placeholder: '750', numeric: true }],
  case: [
    { key: 'form_factor', label: 'Boards it fits', placeholder: 'ATX,Micro-ATX' },
    { key: 'fan_mounts', label: 'Fan mounts', placeholder: '7', numeric: true },
    { key: 'fan_size', label: 'Fan sizes (mm)', placeholder: '120,140' },
  ],
  cooler: [{ key: 'wattage', label: 'Watts', placeholder: '5', numeric: true }],
  fan: [
    { key: 'fan_size', label: 'Size (mm)', placeholder: '120' },
    { key: 'wattage', label: 'Watts', placeholder: '2', numeric: true },
  ],
}

export default function NewListingPage() {
  const { isAuthenticated, loading, user } = useAuth()
  const { categories, componentTypes } = useSite()
  const router = useRouter()

  const [form, setForm] = useState({
    title: '', brand: '', description: '', price: '', condition: 'used',
    category: '', component_type: '', stock: '1', location: '', image_url: '',
    wattage: '', socket: '', memory_type: '', form_factor: '',
    memory_slots: '', max_memory_gb: '', m2_slots: '', sata_ports: '', fan_headers: '',
    memory_modules: '', memory_capacity_gb: '', storage_interface: '', fan_mounts: '', fan_size: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))
  const digits = (k: string, v: string) => set(k, v.replace(/\D/g, ''))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title || !form.price) return setError('Add a title and a price so buyers know what it is and what it costs.')
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
      for (const k of NUMERIC_SPECS) if (form[k]) payload[k] = Number(form[k])
      if (form.storage_interface) payload.storage_interface = form.storage_interface
      if (form.fan_size) payload.fan_size = form.fan_size
      const res = await api.post('products/', payload)
      router.push(`/products/${res.data.slug}`)
    } catch (err: any) {
      const data = err?.response?.data
      setError(data ? Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(' ') : 'Couldn’t publish the listing. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Spinner />

  const type = componentTypes.find((t: any) => String(t.id) === form.component_type)
  const specFields: Spec[] = (type?.slot_key && SPECS_BY_SLOT[type.slot_key]) || []
  const preview: Product = {
    id: 0,
    slug: '',
    title: form.title || 'Your part title',
    brand: form.brand,
    price: form.price || '0',
    condition: form.condition,
    seller_type: 'user',
    seller_username: user?.username,
    component_type_name: type?.name,
    category_name: categories.find((c: any) => String(c.id) === form.category)?.name,
    slot_key: type?.slot_key,
    wattage: form.wattage ? Number(form.wattage) : null,
    socket: form.socket,
    memory_type: form.memory_type,
    form_factor: form.form_factor,
    image_src: form.image_url || null,
    memory_modules: form.memory_modules ? Number(form.memory_modules) : null,
    memory_capacity_gb: form.memory_capacity_gb ? Number(form.memory_capacity_gb) : null,
    storage_interface: form.storage_interface,
    fan_size: form.fan_size,
  }

  return (
    <div className="shell pt-10 sm:pt-14">
      <Link href="/profile" className="text-sm text-ink-2 hover:text-ink">← Your profile</Link>
      <h1 className="display text-[length:var(--text-page)] leading-[var(--text-page--line-height)] mt-4 mb-3">List a part</h1>
      <p className="text-ink-2 max-w-lg mb-10">Fill in what you know. The spec fields let buyers drop your part straight into their builder.</p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-10 lg:gap-14 items-start">
        <form onSubmit={submit} className="space-y-10" noValidate>
          <Section title="The part">
            <Field label="Title" id="title">
              <input id="title" className="field" value={form.title} onChange={e => set('title', e.target.value)} placeholder="RTX 3070 Founders Edition" required />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Brand" id="brand"><input id="brand" className="field" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="NVIDIA" /></Field>
              <Field label="Condition" id="condition">
                <select id="condition" className="field" value={form.condition} onChange={e => set('condition', e.target.value)}>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </Field>
            </div>
            <Field label="Description" id="description" hint="Age, how it was used, anything included in the box.">
              <textarea id="description" className="field" rows={4} value={form.description} onChange={e => set('description', e.target.value)} />
            </Field>
          </Section>

          <Section title="Price and pickup">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Price (Rp)" id="price">
                <input id="price" inputMode="numeric" className="field num" value={form.price} onChange={e => digits('price', e.target.value)} placeholder="4500000" required />
              </Field>
              <Field label="How many" id="stock"><input id="stock" inputMode="numeric" className="field num" value={form.stock} onChange={e => digits('stock', e.target.value)} /></Field>
              <Field label="Location" id="location"><input id="location" className="field" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Jakarta Selatan" /></Field>
            </div>
            <Field label="Photo link" id="image_url" hint="Optional. Paste a link to a photo of the actual part.">
              <input id="image_url" type="url" className="field" value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://" />
            </Field>
          </Section>

          <Section title="Where it goes">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Aisle" id="category">
                <select id="category" className="field" value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Choose an aisle</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Part type" id="component_type">
                <select id="component_type" className="field" value={form.component_type} onChange={e => set('component_type', e.target.value)}>
                  <option value="">Choose a type</option>
                  {componentTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>
            </div>
            <div className="rounded-[var(--radius-card)] border-[1.5px] border-dashed border-ink-3 p-4 sm:p-5">
              <p className="text-sm font-semibold mb-1">Specs for the builder</p>
              {specFields.length === 0 ? (
                <p className="text-xs text-ink-2">
                  {type ? `${type.name} doesn't go in the builder, so there's nothing to fill in here.` : 'Pick a part type and the specs the builder checks show up here.'}
                </p>
              ) : (
                <>
                  <p className="text-xs text-ink-2 mb-4">These power the compatibility checks, so buyers know it fits before they message you.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {specFields.map(f => (
                      <Field key={f.key} label={f.label} id={f.key}>
                        {f.options ? (
                          <select id={f.key} className="field" value={form[f.key]} onChange={e => set(f.key, e.target.value)}>
                            <option value="">Choose</option>
                            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            id={f.key}
                            className={`field ${f.numeric ? 'num' : ''}`}
                            inputMode={f.numeric ? 'numeric' : undefined}
                            value={form[f.key]}
                            onChange={e => (f.numeric ? digits(f.key, e.target.value) : set(f.key, e.target.value))}
                            placeholder={f.placeholder}
                          />
                        )}
                      </Field>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Section>

          {error && <p className="notice-error" role="alert">{error}</p>}
          <button className="btn btn-accent w-full sm:w-auto sm:min-w-56" disabled={busy} data-state={busy ? 'loading' : undefined}>
            {busy ? 'Publishing…' : 'Publish listing'}
          </button>
        </form>

        <aside className="lg:sticky lg:top-24 order-first lg:order-none">
          <p className="label mb-3">Preview</p>
          <div className="pointer-events-none max-w-[18rem]" aria-hidden="true">
            <ProductCard product={preview} />
          </div>
        </aside>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="display text-2xl mb-5 pb-3 border-b-[1.5px] border-ink w-full">{title}</legend>
      {children}
    </fieldset>
  )
}

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
      {hint && <p className="text-xs text-ink-2 mt-1.5">{hint}</p>}
    </div>
  )
}
