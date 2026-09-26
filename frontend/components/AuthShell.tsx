import PartGlyph, { GlyphKind } from './PartGlyph'

const WALL: GlyphKind[] = ['cpu', 'gpu', 'ram', 'cooler', 'psu', 'storage', 'mobo', 'case', 'keyboard']

export default function AuthShell({
  title,
  aside,
  children,
}: {
  title: string
  aside: string
  children: React.ReactNode
}) {
  return (
    <div className="shell pt-10 sm:pt-16">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] panel overflow-hidden max-w-5xl mx-auto shadow-[var(--shadow-hard-lg)]">
        <div className="band-dark hidden lg:flex flex-col justify-between p-10 relative overflow-hidden">
          <p className="display text-4xl leading-[1] max-w-[12ch] relative z-10">{aside}</p>
          <div className="grid grid-cols-3 gap-6 text-ink-soft relative" aria-hidden="true">
            {WALL.map((k, i) => (
              <PartGlyph key={k} kind={k} className={`w-full h-auto max-w-24 ${i === 4 ? 'text-paper' : ''}`} />
            ))}
          </div>
        </div>
        <div className="p-6 sm:p-10 lg:p-12">
          <h1 className="display text-[clamp(2rem,1.5rem+2vw,2.75rem)] mb-8">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  )
}
