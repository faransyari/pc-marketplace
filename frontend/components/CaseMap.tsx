'use client'
import Link from 'next/link'
import { useBuild, SLOTS } from '@/lib/BuildContext'
import PartGlyph, { GlyphKind } from './PartGlyph'

// A schematic of a case interior. Every bay links to that slot in the shop and
// fills in once the visitor has picked parts for it in the builder.
const BAYS: { key: GlyphKind; label: string; area: string; big?: boolean; row?: boolean }[] = [
  { key: 'cooler', label: 'Cooler', area: 'cool' },
  { key: 'cpu', label: 'CPU', area: 'cpu' },
  { key: 'ram', label: 'Memory', area: 'ram' },
  { key: 'mobo', label: 'Motherboard', area: 'mobo', row: true },
  { key: 'gpu', label: 'Graphics', area: 'gpu', big: true },
  { key: 'storage', label: 'Storage', area: 'stor' },
  { key: 'psu', label: 'Power supply', area: 'psu', row: true },
]

type Line = { product: { id: number; title: string }; qty: number }

function describe(lines: Line[] | undefined, unit: string) {
  if (!lines?.length) return ''
  const qty = lines.reduce((n, l) => n + l.qty, 0)
  if (lines.length === 1 && qty === 1) return lines[0].product.title
  if (lines.length === 1) return `${qty}× ${lines[0].product.title}`
  return `${qty} ${unit}`
}

const UNITS: Record<string, string> = { ram: 'kits', storage: 'drives', fan: 'fans' }

export default function CaseMap() {
  const { items, slots, count, analysis } = useBuild()
  const issues: number = analysis?.warnings?.length || 0
  const caseChosen = slots['case']
  const fanLines: Line[] = items['fan'] || []
  const fanQty = fanLines.reduce((n, l) => n + l.qty, 0)

  const led = (on: boolean) => `led shrink-0 ${on ? 'text-accent group-hover:text-ink' : 'text-paper-3 group-hover:text-ink'}`

  return (
    <div className="relative">
      <div className="relative rounded-[var(--radius-frame)] border-[1.5px] border-ink bg-paper-2 p-2.5 sm:p-3 shadow-[var(--shadow-hard-lg)]">
        <Link
          href="/products?slot=case"
          className="absolute -top-3.5 left-5 z-10 tag !text-xs !py-1 !px-2.5 bg-paper !border-[1.5px] !border-ink hover:!bg-accent transition-colors max-w-[70%]"
        >
          <span className={`led ${caseChosen ? 'text-accent' : 'text-ink-3'}`} />
          <span className="truncate">{caseChosen ? caseChosen.title : 'Case'}</span>
        </Link>

        <div className="case-grid">
          {BAYS.map(bay => {
            const text = describe(items[bay.key], UNITS[bay.key] || 'parts')
            const filled = !!text
            return (
              <Link
                key={bay.key}
                href={`/products?slot=${bay.key}`}
                className="bay group"
                data-filled={filled ? 'true' : 'false'}
                style={{ gridArea: bay.area }}
                aria-label={filled ? `${bay.label}: ${text}` : `Shop ${bay.label}`}
              >
                {bay.row ? (
                  <span className="flex items-center justify-between gap-3 h-full min-w-0">
                    <span className="flex flex-col gap-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className={led(filled)} />
                        <span className="label !text-current leading-tight">{bay.label}</span>
                      </span>
                      {filled && <span className="text-[0.7rem] leading-tight truncate">{text}</span>}
                    </span>
                    <PartGlyph kind={bay.key} className="w-10 sm:w-14 h-auto shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" />
                  </span>
                ) : (
                  <>
                    <span className="flex items-start justify-between gap-1">
                      <span className="label !text-current leading-tight">{bay.label}</span>
                      <span className={led(filled)} />
                    </span>
                    <PartGlyph
                      kind={bay.key}
                      className={`${bay.big ? 'w-16 sm:w-28' : 'w-11 sm:w-16'} h-auto self-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                    />
                    <span className="text-[0.7rem] leading-tight truncate min-h-[1em]">{text}</span>
                  </>
                )}
              </Link>
            )
          })}

          {/* Front intake: one fan glyph per fan in the build, up to three shown */}
          <Link
            href="/products?slot=fan"
            className="bay group !justify-start"
            data-filled={fanQty ? 'true' : 'false'}
            style={{ gridArea: 'fan' }}
            aria-label={fanQty ? `Case fans: ${fanQty}` : 'Shop case fans'}
          >
            <span className="flex items-start justify-between gap-1">
              <span className="label !text-current leading-tight">Fans</span>
              <span className={led(fanQty > 0)} />
            </span>
            <span className="flex sm:flex-col items-center justify-center gap-2 flex-1 py-1">
              {[0, 1, 2].map(i => (
                <PartGlyph
                  key={i}
                  kind="fan"
                  className={`w-8 sm:w-10 h-auto transition-transform duration-500 group-hover:rotate-90 ${
                    i < fanQty ? '' : 'opacity-35'
                  }`}
                />
              ))}
            </span>
            <span className="num text-[0.7rem] leading-tight text-center min-h-[1em]">
              {fanQty > 3 ? `+${fanQty - 3} more` : fanQty ? `${fanQty} fitted` : ''}
            </span>
          </Link>
        </div>
      </div>
      {/* feet */}
      <div className="flex justify-between px-10" aria-hidden="true">
        <span className="block h-2.5 w-10 bg-ink rounded-b-md" />
        <span className="block h-2.5 w-10 bg-ink rounded-b-md" />
      </div>

      <p className="mt-4 text-sm text-ink-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="num text-ink font-medium">{count} of {SLOTS.length} bays filled</span>
        {issues > 0 && (
          <>
            <span aria-hidden="true" className="text-ink-3">·</span>
            <span className="inline-flex items-center gap-1.5 text-warn-ink font-medium">
              <span className="led text-warn" /> {issues} issue{issues > 1 ? 's' : ''} to fix
            </span>
          </>
        )}
        <span aria-hidden="true" className="text-ink-3">·</span>
        <Link href="/builder" className="link">{count > 0 ? 'Continue your build' : 'Start a build'}</Link>
      </p>
    </div>
  )
}
