import Link from 'next/link'
import PartGlyph, { GlyphKind } from './PartGlyph'

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex justify-center items-center gap-3 py-20" role="status">
      <span className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map(i => (
          <span key={i} className="led text-accent led-blink" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </span>
      <span className="label">{label}</span>
    </div>
  )
}

export function EmptyState({
  title,
  hint,
  glyph = 'box',
  action,
}: {
  title: string
  hint?: string
  glyph?: GlyphKind
  action?: { href: string; label: string }
}) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-4 border-[1.5px] border-dashed border-ink-3 rounded-[var(--radius-card)]">
      <PartGlyph kind={glyph} className="w-14 h-14 text-ink-3 mb-4" />
      <p className="display text-xl mb-1.5">{title}</p>
      {hint && <p className="text-sm text-ink-2 max-w-xs">{hint}</p>}
      {action && (
        <Link href={action.href} className="btn btn-line btn-sm mt-5">{action.label}</Link>
      )}
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="shell py-20">
      <div className="max-w-md mx-auto text-center">
        <p className="tag tag-warn mb-4"><span className="led" /> Fault</p>
        <p className="display text-2xl mb-2">{message}</p>
        <Link href="/products" className="link text-sm">Back to the shop</Link>
      </div>
    </div>
  )
}
