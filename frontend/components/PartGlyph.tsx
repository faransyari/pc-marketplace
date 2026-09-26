// Hand-drawn line glyphs for each kind of part. The catalog ships without photos,
// so these stand in as the product image. Strokes follow currentColor; the one
// orange detail per glyph uses the accent token.

export type GlyphKind =
  | 'cpu' | 'mobo' | 'ram' | 'gpu' | 'storage' | 'psu' | 'case' | 'cooler' | 'fan'
  | 'monitor' | 'keyboard' | 'mouse' | 'headset' | 'box'

type Props = { kind: GlyphKind; className?: string; title?: string }

const ACCENT = 'var(--color-accent)'

export function glyphFor(p: {
  slot_key?: string
  component_type_name?: string
  category_name?: string
  title?: string
}): GlyphKind {
  const slot = p.slot_key as GlyphKind | undefined
  const title = (p.title || '').toLowerCase()
  if (p.category_name === 'Full PCs' || title.includes('prebuilt')) return 'case'
  if (slot && ['cpu', 'mobo', 'ram', 'gpu', 'storage', 'psu', 'case', 'cooler', 'fan'].includes(slot)) return slot
  const type = (p.component_type_name || '').toLowerCase()
  if (type.includes('monitor') || /monitor|ultragear|display/.test(title)) return 'monitor'
  if (type.includes('keyboard') || /keyboard|keychron/.test(title)) return 'keyboard'
  if (/mouse|g502|viper|deathadder/.test(title)) return 'mouse'
  if (/headset|headphone|cloud ii|arctis/.test(title)) return 'headset'
  return 'box'
}

export default function PartGlyph({ kind, className, title }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {GLYPHS[kind]}
    </svg>
  )
}

const pins = (fn: (i: number) => React.ReactNode) => [0, 1, 2, 3, 4].map(fn)

const GLYPHS: Record<GlyphKind, React.ReactNode> = {
  cpu: (
    <>
      <rect x="16" y="16" width="32" height="32" rx="3" />
      <rect x="24" y="24" width="16" height="16" rx="1.5" fill={ACCENT} stroke="currentColor" />
      {pins(i => <line key={`t${i}`} x1={22 + i * 5} y1="9" x2={22 + i * 5} y2="16" />)}
      {pins(i => <line key={`b${i}`} x1={22 + i * 5} y1="48" x2={22 + i * 5} y2="55" />)}
      {pins(i => <line key={`l${i}`} x1="9" y1={22 + i * 5} x2="16" y2={22 + i * 5} />)}
      {pins(i => <line key={`r${i}`} x1="48" y1={22 + i * 5} x2="55" y2={22 + i * 5} />)}
    </>
  ),
  mobo: (
    <>
      <rect x="8" y="8" width="48" height="48" rx="3" />
      <rect x="15" y="15" width="16" height="16" rx="1.5" fill={ACCENT} />
      <line x1="38" y1="14" x2="38" y2="34" />
      <line x1="43" y1="14" x2="43" y2="34" />
      <line x1="48" y1="14" x2="48" y2="34" />
      <rect x="14" y="40" width="30" height="4" rx="1" />
      <rect x="14" y="48" width="22" height="3" rx="1" />
      <circle cx="50" cy="48" r="2.5" />
    </>
  ),
  ram: (
    <>
      <path d="M6 22h52v18H36l-2 3h-4l-2-3H6z" />
      <rect x="10" y="26" width="8" height="8" rx="1" fill={ACCENT} />
      <rect x="21" y="26" width="8" height="8" rx="1" />
      <rect x="35" y="26" width="8" height="8" rx="1" />
      <rect x="46" y="26" width="8" height="8" rx="1" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <line key={i} x1={9 + i * 3} y1="44" x2={9 + i * 3} y2="47" />
      ))}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <line key={`r${i}`} x1={40 + i * 3} y1="44" x2={40 + i * 3} y2="47" />
      ))}
    </>
  ),
  gpu: (
    <>
      <rect x="10" y="16" width="48" height="28" rx="3" />
      <path d="M10 18H5v26h5" />
      <circle cx="24" cy="30" r="8" />
      <circle cx="44" cy="30" r="8" />
      <circle cx="24" cy="30" r="2.5" fill={ACCENT} />
      <circle cx="44" cy="30" r="2.5" fill={ACCENT} />
      <path d="M24 22v5M31 30h-4M24 38v-5M17 30h4" />
      <path d="M44 22v5M51 30h-4M44 38v-5M37 30h4" />
      <path d="M18 44v5h26v-5" />
    </>
  ),
  storage: (
    <>
      <rect x="6" y="25" width="52" height="14" rx="2" />
      <rect x="18" y="28" width="12" height="8" rx="1" fill={ACCENT} />
      <rect x="33" y="28" width="8" height="8" rx="1" />
      <circle cx="53" cy="32" r="2" />
      {[0, 1, 2].map(i => <line key={i} x1="9" y1={28 + i * 4} x2="13" y2={28 + i * 4} />)}
    </>
  ),
  psu: (
    <>
      <rect x="8" y="14" width="48" height="36" rx="3" />
      <circle cx="28" cy="32" r="12" />
      <path d="M20 32h16M28 24v16M22.5 26.5l11 11M33.5 26.5l-11 11" strokeWidth={1.5} />
      <rect x="45" y="22" width="6" height="9" rx="1" fill={ACCENT} />
      <line x1="45" y1="38" x2="51" y2="38" />
      <line x1="45" y1="42" x2="51" y2="42" />
    </>
  ),
  case: (
    <>
      <rect x="16" y="6" width="32" height="48" rx="3" />
      <rect x="21" y="11" width="22" height="24" rx="1.5" />
      <circle cx="32" cy="23" r="6" />
      <circle cx="32" cy="23" r="1.5" fill={ACCENT} />
      <line x1="21" y1="41" x2="43" y2="41" />
      <line x1="21" y1="45" x2="43" y2="45" />
      <rect x="38" y="48" width="5" height="3" rx="0.5" fill={ACCENT} stroke="none" />
      <line x1="20" y1="54" x2="20" y2="58" />
      <line x1="44" y1="54" x2="44" y2="58" />
    </>
  ),
  cooler: (
    <>
      <path d="M20 12v-4M28 12v-4M36 12v-4M44 12v-4" />
      <rect x="14" y="12" width="36" height="34" rx="2" />
      {[0, 1, 2, 3, 4, 5].map(i => <line key={i} x1="14" y1={17 + i * 5} x2="50" y2={17 + i * 5} strokeWidth={1.5} />)}
      <rect x="22" y="46" width="20" height="6" rx="1" fill={ACCENT} />
      <line x1="18" y1="56" x2="46" y2="56" />
    </>
  ),
  fan: (
    <>
      <rect x="10" y="10" width="44" height="44" rx="4" />
      <circle cx="32" cy="32" r="16" />
      <circle cx="32" cy="32" r="4" fill={ACCENT} />
      <path d="M32 28c-2-6 2-10 7-10M36 32c6-2 10 2 10 7M32 36c2 6-2 10-7 10M28 32c-6 2-10-2-10-7" />
      <circle cx="15" cy="15" r="1.5" />
      <circle cx="49" cy="15" r="1.5" />
      <circle cx="15" cy="49" r="1.5" />
      <circle cx="49" cy="49" r="1.5" />
    </>
  ),
  monitor: (
    <>
      <rect x="6" y="10" width="52" height="32" rx="3" />
      <rect x="11" y="15" width="42" height="22" rx="1" />
      <path d="M11 37l14-12 9 8 6-5 13 9" fill={ACCENT} fillOpacity={0.9} strokeWidth={1.5} />
      <path d="M28 42v8M36 42v8M20 52h24" />
    </>
  ),
  keyboard: (
    <>
      <rect x="4" y="18" width="56" height="28" rx="3" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <rect key={`a${i}`} x={8 + i * 6.3} y="22" width="4" height="4" rx="0.8" strokeWidth={1.5} />)}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <rect key={`b${i}`} x={8 + i * 6.3} y="29" width="4" height="4" rx="0.8" strokeWidth={1.5} />)}
      <rect x="8" y="36" width="4" height="4" rx="0.8" fill={ACCENT} strokeWidth={1.5} />
      <rect x="18" y="36" width="28" height="4" rx="0.8" strokeWidth={1.5} />
      <rect x="52" y="36" width="4" height="4" rx="0.8" strokeWidth={1.5} />
    </>
  ),
  mouse: (
    <>
      <path d="M32 8c-11 0-16 9-16 20v10c0 11 7 18 16 18s16-7 16-18V28c0-11-5-20-16-20z" />
      <line x1="32" y1="8" x2="32" y2="26" />
      <path d="M16 26h32" />
      <rect x="29.5" y="14" width="5" height="8" rx="2.5" fill={ACCENT} />
    </>
  ),
  headset: (
    <>
      <path d="M12 38v-6a20 20 0 0 1 40 0v6" />
      <rect x="8" y="36" width="10" height="16" rx="3" fill={ACCENT} />
      <rect x="46" y="36" width="10" height="16" rx="3" />
      <path d="M13 52c0 4 4 6 9 6h4" />
    </>
  ),
  box: (
    <>
      <path d="M32 8l22 11v26L32 56 10 45V19z" />
      <path d="M10 19l22 11 22-11M32 30v26" />
      <path d="M21 13.5l22 11v7" stroke={ACCENT} strokeWidth={3} />
    </>
  ),
}
