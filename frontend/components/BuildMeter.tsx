'use client'
import { SLOTS } from '@/lib/BuildContext'

// Eight segments, one per builder slot. Filled segments are the slots in the current build.
export default function BuildMeter({ slots, dark = false }: { slots: Record<string, unknown>; dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-[3px]" aria-hidden="true">
      {SLOTS.map(({ key }: { key: string }) => (
        <span
          key={key}
          className={`block h-3 w-1.5 rounded-[1.5px] transition-colors duration-200 ${
            slots[key] ? 'bg-accent' : dark ? 'bg-ink-soft' : 'bg-paper-3'
          }`}
        />
      ))}
    </span>
  )
}
