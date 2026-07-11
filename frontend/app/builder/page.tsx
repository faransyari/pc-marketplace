'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LuCpu, LuCheck, LuTriangleAlert, LuX, LuPlus } from 'react-icons/lu'
import api from '@/lib/api'
import { useBuild, SLOTS } from '@/lib/BuildContext'
import { useAuth } from '@/lib/AuthContext'
import { specChips, Product } from '@/components/ProductCard'
import { resolveImage } from '@/lib/config'
import { Spinner, EmptyState } from '@/components/States'

export default function BuilderPage() {
  const { slots, setSlot, clearSlot, clearAll, analysis, total, count } = useBuild()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const [picker, setPicker] = useState<{ key: string; label: string } | null>(null)
  const [name, setName] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  const saveBuild = async () => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (count === 0) return
    setSaveState('saving')
    try {
      const res = await api.post('builds/', { name: name || 'My build', description: '' })
      const buildId = res.data.id
      await Promise.all(
        Object.values(slots).map((p: any) =>
          api.post('build-components/', { build: buildId, product: p.id, component_type: p.component_type })
        )
      )
      setSaveState('saved')
    } catch {
      setSaveState('idle')
    }
  }

  const warnings = analysis?.warnings || []
  const notices = analysis?.notices || []
  const compatible = count > 0 && warnings.length === 0
  const draw = analysis?.estimated_wattage || 0
  const recommended = analysis?.recommended_psu_wattage || 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="eyebrow mb-1">Compatibility engine</div>
        <h1 className="font-display text-3xl font-semibold text-ink">PC Builder</h1>
        <p className="text-muted text-sm mt-1">Pick a part for each slot. We check sockets, memory, and power as you go.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <div className="space-y-3">
          {SLOTS.map(({ key, label }) => {
            const chosen = slots[key]
            return (
              <div key={key} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-panel flex items-center justify-center text-violet shrink-0">
                  <LuCpu />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="eyebrow">{label}</div>
                  {chosen ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-ink text-sm">{chosen.title}</span>
                      {specChips(chosen).slice(0, 2).map((c: string) => <span key={c} className="chip">{c}</span>)}
                    </div>
                  ) : (
                    <span className="text-sm text-muted">Not selected</span>
                  )}
                </div>
                {chosen ? (
                  <>
                    <span className="mono text-sm font-semibold">${Number(chosen.price).toLocaleString()}</span>
                    <button onClick={() => clearSlot(key)} className="text-gray-400 hover:text-danger" aria-label={`Remove ${label}`}><LuX /></button>
                  </>
                ) : (
                  <button onClick={() => setPicker({ key, label })} className="btn btn-ghost py-1.5 px-3 text-sm">
                    <LuPlus /> Choose
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <aside className="card p-5 lg:sticky lg:top-20">
          <div className="flex items-center justify-between mb-4">
            <span className="eyebrow">System check</span>
            {count === 0 ? <span className="pill pill-info">Empty</span>
              : compatible ? <span className="pill pill-ok"><LuCheck /> Compatible</span>
              : <span className="pill pill-warn"><LuTriangleAlert /> {warnings.length} issue{warnings.length > 1 ? 's' : ''}</span>}
          </div>

          {warnings.map((w: string, i: number) => (
            <div key={i} className="flex gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-2.5 mb-2">
              <LuTriangleAlert className="shrink-0 mt-0.5" /><span>{w}</span>
            </div>
          ))}
          {notices.map((n: string, i: number) => (
            <p key={i} className="text-xs text-muted mb-1">{n}</p>
          ))}

          {count > 0 && (
            <div className="mt-4 pt-4 border-t border-line">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">Estimated draw</span>
                <span className="mono">{draw}W</span>
              </div>
              <div className="h-1.5 rounded-full bg-panel overflow-hidden mb-1">
                <div className="h-full bg-violet" style={{ width: `${Math.min(100, recommended ? (draw / recommended) * 100 : 0)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>Recommended PSU</span>
                <span className="mono">{recommended}W</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-baseline mt-4 pt-4 border-t border-line">
            <span className="text-sm text-muted">Total</span>
            <span className="mono text-2xl font-semibold text-ink">${total.toLocaleString()}</span>
          </div>

          <div className="mt-4 space-y-2">
            <input className="field text-sm" placeholder="Name this build" value={name} onChange={e => setName(e.target.value)} />
            {saveState === 'saved' ? (
              <div className="pill pill-ok w-full justify-center py-2">Build saved to your profile</div>
            ) : (
              <button className="btn btn-primary w-full" disabled={count === 0 || saveState === 'saving'} onClick={saveBuild}>
                {saveState === 'saving' ? 'Saving…' : isAuthenticated ? 'Save build' : 'Sign in to save'}
              </button>
            )}
            {count > 0 && <button onClick={clearAll} className="text-xs text-muted hover:text-danger w-full text-center">Clear all</button>}
          </div>
        </aside>
      </div>

      {picker && (
        <SlotPicker
          slot={picker}
          onClose={() => setPicker(null)}
          onPick={(p) => { setSlot(p); setPicker(null); setSaveState('idle') }}
        />
      )}
    </div>
  )
}

function SlotPicker({ slot, onClose, onPick }: { slot: { key: string; label: string }; onClose: () => void; onPick: (p: Product) => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`products/?slot=${slot.key}&ordering=price`)
      .then(r => setProducts(r.data.results))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [slot.key])

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-line">
          <div>
            <div className="eyebrow">Choose a part</div>
            <h2 className="font-display text-lg font-semibold">{slot.label}</h2>
          </div>
          <button onClick={onClose} aria-label="Close"><LuX className="text-xl" /></button>
        </div>
        <div className="overflow-y-auto p-4">
          {loading ? <Spinner /> : products.length === 0 ? (
            <EmptyState title="No parts available" hint="Nothing in this slot yet." />
          ) : (
            <div className="space-y-2">
              {products.map(p => {
                const img = resolveImage(p.image_src || null)
                return (
                  <button key={p.id} onClick={() => onPick(p)} className="w-full flex items-center gap-3 p-3 rounded-lg border border-line hover:border-violet/40 hover:bg-panel text-left">
                    <div className="w-12 h-12 rounded bg-panel flex items-center justify-center shrink-0">
                      {img ? <img src={img} alt="" className="w-full h-full object-contain p-1" /> : <LuCpu className="text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{p.title}</div>
                      <div className="flex gap-1 mt-0.5">{specChips(p).slice(0, 3).map((c: string) => <span key={c} className="chip">{c}</span>)}</div>
                    </div>
                    <span className="mono text-sm font-semibold">${Number(p.price).toLocaleString()}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
