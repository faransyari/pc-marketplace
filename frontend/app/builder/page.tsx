'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LuX, LuPlus, LuMinus, LuRepeat, LuCheck } from 'react-icons/lu'
import api from '@/lib/api'
import { useBuild, SLOTS, MAX_QTY } from '@/lib/BuildContext'
import { useAuth } from '@/lib/AuthContext'
import { specChips, Product, ProductVisual } from '@/components/ProductCard'
import PartGlyph, { GlyphKind } from '@/components/PartGlyph'
import { formatPrice } from '@/lib/config'
import { Spinner, EmptyState } from '@/components/States'

type Line = { product: Product & { component_type?: number }; qty: number }
type Meter = { used: number; total: number | null }
type Picker = { key: string; label: string; replaceId: number | null }

const NOUNS: Record<string, string> = { ram: 'memory kit', storage: 'drive', fan: 'fan' }
const nounFor = (key: string, label: string) => NOUNS[key] || label.toLowerCase()

// Capacity readouts shown on the multi-part slots.
const METERS: Record<string, [string, string][]> = {
  ram: [['memory_slots', 'DIMM slots'], ['memory_gb', 'GB']],
  storage: [['m2_slots', 'M.2'], ['sata_ports', 'SATA']],
  fan: [['fan_mounts', 'Case mounts'], ['fan_headers', 'Fan headers']],
}

// Going over these is fixable (a fan hub), so they read as a caution, not an error.
const SOFT_METERS = ['fan_headers']

export default function BuilderPage() {
  const { items, addPart, replacePart, setQty, removePart, clearAll, analysis, total, count, partCount } = useBuild()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const [picker, setPicker] = useState<Picker | null>(null)
  const [name, setName] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const touched = () => { if (saveState !== 'idle') setSaveState('idle') }

  const saveBuild = async () => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (count === 0) return
    setSaveState('saving')
    try {
      const res = await api.post('builds/', { name: name || 'My build', description: '' })
      const buildId = res.data.id
      const lines: Line[] = Object.values(items as Record<string, Line[]>).flat()
      await Promise.all(
        lines.map(l =>
          api.post('build-components/', { build: buildId, product: l.product.id, component_type: l.product.component_type, quantity: l.qty })
        )
      )
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  const warnings: string[] = analysis?.warnings || []
  const notices: string[] = analysis?.notices || []
  const capacity: Record<string, Meter> = analysis?.capacity || {}
  const compatible = count > 0 && warnings.length === 0
  const draw: number = analysis?.estimated_wattage || 0
  const recommended: number = analysis?.recommended_psu_wattage || 0
  const psuCapacity: number = items['psu']?.[0]?.product.wattage || 0
  const scale = psuCapacity || recommended
  const SEGMENTS = 24
  const filled = scale ? Math.min(SEGMENTS, Math.round((draw / scale) * SEGMENTS)) : 0
  const over = psuCapacity > 0 && recommended > psuCapacity

  return (
    <div className="shell pt-10 sm:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="display text-[length:var(--text-page)] leading-[var(--text-page--line-height)] mb-3">Builder</h1>
          <p className="text-ink-2 max-w-xl">
            Fill the bays. Stack as much memory, storage and fans as you like: we count the slots, ports, mounts and watts as you go.
          </p>
        </div>
        {count > 0 && (
          <button onClick={() => { clearAll(); touched() }} className="text-sm text-ink-2 hover:text-danger transition-colors cursor-pointer">
            Empty all bays
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem] gap-8 items-start">
        <ol className="space-y-2.5">
          {SLOTS.map((slot: { key: string; label: string; multi?: boolean }) => {
            const key = slot.key as GlyphKind
            const lines: Line[] = items[key] || []
            const meters = METERS[key]

            if (lines.length === 0) {
              return (
                <li key={key} className="grid grid-cols-[3.25rem_minmax(0,1fr)_auto] sm:grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-[var(--radius-card)] border-[1.5px] border-dashed border-ink-3">
                  <div className="aspect-square flex items-center justify-center text-ink-3">
                    <PartGlyph kind={key} className="w-[70%] h-auto" />
                  </div>
                  <div className="min-w-0">
                    <p className="label mb-0.5">{slot.label}</p>
                    <p className="text-sm text-ink-3">{slot.multi ? 'Empty bay · takes more than one' : 'Empty bay'}</p>
                  </div>
                  <button onClick={() => setPicker({ key, label: slot.label, replaceId: null })} className="btn btn-line btn-sm">
                    <LuPlus /> Choose
                  </button>
                </li>
              )
            }

            return (
              <li key={key} className="rounded-[var(--radius-card)] border-[1.5px] border-ink bg-white overflow-hidden">
                {slot.multi && (
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 sm:px-4 py-2.5 border-b border-rule bg-paper">
                    <p className="label !text-ink">{slot.label}</p>
                    {meters && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {meters.map(([k, label]) => <CapacityMeter key={k} label={label} meter={capacity[k]} soft={SOFT_METERS.includes(k)} />)}
                      </div>
                    )}
                  </div>
                )}

                <ul className="divide-y divide-rule">
                  {lines.map(({ product, qty }) => (
                    <li
                      key={product.id}
                      className="grid grid-cols-[3.25rem_minmax(0,1fr)_auto] sm:grid-cols-[4rem_minmax(0,1fr)_auto_auto] items-center gap-3 sm:gap-4 p-2.5 sm:p-3"
                    >
                      <div className="aspect-square rounded-[var(--radius-control)] bg-paper-2 flex items-center justify-center text-ink">
                        <ProductVisual product={product} className="w-[70%] h-auto" />
                      </div>

                      <div className="min-w-0">
                        {!slot.multi && <p className="label mb-0.5">{slot.label}</p>}
                        <Link href={`/products/${product.slug}`} className="font-semibold text-sm hover:underline block truncate">{product.title}</Link>
                        {specChips(product).length > 0 && (
                          <p className="mono text-[0.7rem] text-ink-2 truncate">{specChips(product).join(' · ')}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 sm:hidden">
                          {slot.multi && <Stepper qty={qty} onChange={n => { setQty(key, product.id, n); touched() }} label={product.title} />}
                          <span className="num text-sm font-semibold">{formatPrice(Number(product.price) * qty)}</span>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-4">
                        {slot.multi && <Stepper qty={qty} onChange={n => { setQty(key, product.id, n); touched() }} label={product.title} />}
                        <span className="num text-sm font-semibold whitespace-nowrap min-w-[7.5rem] text-right">
                          {formatPrice(Number(product.price) * qty)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPicker({ key, label: slot.label, replaceId: product.id })}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-paper-2 cursor-pointer"
                          aria-label={`Swap ${product.title}`}
                          title="Swap"
                        >
                          <LuRepeat />
                        </button>
                        <button
                          onClick={() => { removePart(key, product.id); touched() }}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-danger-wash hover:text-danger cursor-pointer"
                          aria-label={`Remove ${product.title}`}
                          title="Remove"
                        >
                          <LuX />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {slot.multi && (
                  <button
                    onClick={() => setPicker({ key, label: slot.label, replaceId: null })}
                    className="w-full flex items-center justify-center gap-2 h-11 border-t border-rule text-sm font-semibold hover:bg-accent transition-colors cursor-pointer"
                  >
                    <LuPlus /> Add another {nounFor(key, slot.label)}
                  </button>
                )}
              </li>
            )
          })}
        </ol>

        <aside className="band-dark rounded-[var(--radius-card)] p-5 sm:p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="display text-xl">System check</h2>
            {count === 0 ? (
              <span className="flex items-center gap-2 label !text-ink-3"><span className="led text-ink-soft" /> Idle</span>
            ) : compatible ? (
              <span className="flex items-center gap-2 label !text-ok-bright"><span className="led" /> All clear</span>
            ) : (
              <span className="flex items-center gap-2 label !text-warn"><span className="led" /> {warnings.length} issue{warnings.length > 1 ? 's' : ''}</span>
            )}
          </div>

          {count === 0 && (
            <p className="text-sm text-paper-3 mb-2">Add a part and the checks start running.</p>
          )}

          {warnings.length > 0 && (
            <ul className="space-y-2 mb-4">
              {warnings.map((w, i) => (
                <li key={i} className="mono text-[0.78rem] leading-relaxed text-warn border-l-2 border-warn pl-3">{w}</li>
              ))}
            </ul>
          )}
          {notices.length > 0 && (
            <ul className="space-y-1.5 mb-4">
              {notices.map((n, i) => (
                <li key={i} className="text-xs text-paper-3 leading-relaxed">{n}</li>
              ))}
            </ul>
          )}

          {draw > 0 && (
            <div className="py-4 border-t border-ink-soft">
              <div className="flex justify-between items-baseline text-sm mb-2">
                <span className="text-paper-3">Estimated draw</span>
                <span className="num">{draw} W</span>
              </div>
              <div className="flex gap-[3px] mb-2" role="meter" aria-valuemin={0} aria-valuemax={scale} aria-valuenow={draw} aria-label="Power draw">
                {Array.from({ length: SEGMENTS }, (_, i) => (
                  <span key={i} className={`h-3 flex-1 rounded-[1.5px] ${i < filled ? (over ? 'bg-warn' : 'bg-accent') : 'bg-ink-soft'}`} />
                ))}
              </div>
              <div className="flex justify-between text-xs text-ink-3">
                <span>{psuCapacity ? `of your ${psuCapacity} W PSU` : 'no PSU picked yet'}</span>
                <span className="num">aim for {recommended} W</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-baseline py-4 border-t border-ink-soft">
            <span className="text-sm text-paper-3">
              Total{partCount > 0 && <span className="num text-ink-3"> · {partCount} part{partCount !== 1 ? 's' : ''}</span>}
            </span>
            <span className="num text-2xl font-semibold">{formatPrice(total)}</span>
          </div>

          <div className="pt-4 border-t border-ink-soft space-y-3">
            <label htmlFor="build-name" className="sr-only">Build name</label>
            <input
              id="build-name"
              className="field !bg-ink-soft !text-paper !border-ink-soft placeholder:!text-ink-3 focus:!border-accent"
              placeholder="Name this build"
              value={name}
              onChange={e => { setName(e.target.value); touched() }}
            />
            {saveState === 'saved' ? (
              <p className="flex items-center justify-center gap-2 h-11 text-sm text-ok-bright">
                <LuCheck /> Saved. <Link href="/profile" className="underline underline-offset-2">See it on your profile</Link>
              </p>
            ) : (
              <button
                className="btn btn-accent w-full"
                disabled={count === 0 || saveState === 'saving'}
                data-state={saveState === 'saving' ? 'loading' : undefined}
                onClick={saveBuild}
              >
                {saveState === 'saving' ? 'Saving…' : isAuthenticated ? 'Save build' : 'Sign in to save'}
              </button>
            )}
            {saveState === 'error' && <p className="text-xs text-warn">Couldn&apos;t save. Try again in a moment.</p>}
          </div>
        </aside>
      </div>

      {picker && (
        <SlotPicker
          slot={picker}
          inBuild={(items[picker.key] || []).map((l: Line) => l.product.id)}
          onClose={() => setPicker(null)}
          onPick={(p) => {
            if (picker.replaceId != null) replacePart(picker.key, picker.replaceId, p)
            else addPart(p)
            setPicker(null)
            touched()
          }}
        />
      )}
    </div>
  )
}

function CapacityMeter({ label, meter, soft = false }: { label: string; meter?: Meter; soft?: boolean }) {
  if (!meter) return null
  const { used, total } = meter
  const full = total != null && used === total
  const over = total != null && used > total
  const boxes = total != null && total <= 12 ? total : 0
  return (
    <span className={`flex items-center gap-2 text-xs ${over ? (soft ? 'text-warn-ink font-semibold' : 'text-danger font-semibold') : 'text-ink-2'}`}>
      {boxes > 0 && (
        <span className="flex gap-[2px]" aria-hidden="true">
          {Array.from({ length: Math.max(boxes, used) }, (_, i) => (
            <span
              key={i}
              className={`block h-2.5 w-1.5 rounded-[1px] ${
                i >= boxes ? (soft ? 'bg-warn' : 'bg-danger') : i < used ? (full ? 'bg-ok' : 'bg-accent') : 'bg-paper-3'
              }`}
            />
          ))}
        </span>
      )}
      <span className="num">
        {used}{total != null ? `/${total}` : ''} {label}
      </span>
    </span>
  )
}

function Stepper({ qty, onChange, label }: { qty: number; onChange: (n: number) => void; label: string }) {
  return (
    <span className="inline-flex items-center rounded-[var(--radius-control)] border-[1.5px] border-ink overflow-hidden" role="group" aria-label={`Quantity of ${label}`}>
      <button
        onClick={() => onChange(qty - 1)}
        className="h-8 w-8 inline-flex items-center justify-center hover:bg-paper-2 cursor-pointer"
        aria-label={qty === 1 ? `Remove ${label}` : `One fewer ${label}`}
      >
        <LuMinus />
      </button>
      <span className="num text-sm w-7 text-center" aria-live="polite">{qty}</span>
      <button
        onClick={() => onChange(qty + 1)}
        disabled={qty >= MAX_QTY}
        className="h-8 w-8 inline-flex items-center justify-center hover:bg-accent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={`One more ${label}`}
      >
        <LuPlus />
      </button>
    </span>
  )
}

function SlotPicker({ slot, inBuild, onClose, onPick }: {
  slot: Picker
  inBuild: number[]
  onClose: () => void
  onPick: (p: Product) => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`products/?slot=${slot.key}&ordering=price`)
      .then(r => setProducts(r.data.results))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [slot.key])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const noun = nounFor(slot.key, slot.label)
  const title = slot.replaceId != null ? `Swap this ${noun}` : inBuild.length ? `Add a ${noun}` : `Pick a ${noun}`

  return (
    <div className="fixed inset-0 z-[60] bg-ink/60 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        className="bg-paper w-full sm:max-w-2xl rounded-t-[var(--radius-frame)] sm:rounded-[var(--radius-frame)] border-[1.5px] border-ink max-h-[85vh] flex flex-col shadow-[var(--shadow-hard-lg)] rise"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b-[1.5px] border-ink">
          <div className="flex items-center gap-3">
            <PartGlyph kind={slot.key as GlyphKind} className="w-9 h-9" />
            <h2 id="picker-title" className="display text-xl">{title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-paper-2 cursor-pointer" autoFocus>
            <LuX className="text-xl" />
          </button>
        </div>
        <div className="overflow-y-auto p-3 sm:p-4">
          {loading ? <Spinner /> : products.length === 0 ? (
            <EmptyState title="This bay has no parts yet" hint="Check back soon, or list one yourself." glyph={slot.key as GlyphKind} />
          ) : (
            <ul className="space-y-2">
              {products.map(p => {
                const current = inBuild.includes(p.id)
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => onPick(p)}
                      className={`group w-full grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 p-2.5 rounded-[var(--radius-control)] border-[1.5px] text-left cursor-pointer transition-colors ${
                        current ? 'border-ink bg-accent-wash' : 'border-rule hover:border-ink hover:bg-white'
                      }`}
                    >
                      <span className="aspect-square rounded-md bg-paper-2 flex items-center justify-center">
                        <ProductVisual product={p} className="w-[72%] h-auto text-ink" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold truncate">{p.title}</span>
                        <span className="block mono text-[0.7rem] text-ink-2 truncate">
                          {[...specChips(p), p.condition && p.condition !== 'new' ? p.condition : ''].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block num text-sm font-semibold whitespace-nowrap">{formatPrice(p.price)}</span>
                        {current && <span className="block text-[0.7rem] text-ink-2">In build</span>}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
