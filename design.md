# Design · PC Marketplace

The locked design system for the frontend. Every page reads from this. Extend it here rather than
overriding per page. Tokens live in `frontend/app/tokens.css`; component classes in `frontend/app/globals.css`.

## Idea

A parts-bin workshop. Warm paper, black ink, one signal-orange accent, and hand-drawn part glyphs
standing in for product photos. Things feel like spec-sheet labels and case schematics, and
buttons press down like hardware switches.

## Theme

| Token | Value | Use |
| --- | --- | --- |
| `--color-paper` | `oklch(96.8% 0.007 88)` | page background |
| `--color-paper-2` | `oklch(93.2% 0.011 86)` | image wells, hover fills |
| `--color-paper-3` | `oklch(88.5% 0.014 84)` | empty meter segments |
| `--color-rule` | `oklch(83% 0.013 80)` | quiet dividers |
| `--color-ink` | `oklch(20% 0.014 60)` | text, 1.5px borders, dark bands |
| `--color-ink-2` | `oklch(42% 0.014 65)` | secondary text |
| `--color-accent` | `oklch(68% 0.2 41)` | signal orange: primary CTA, LEDs, filled meters, hover fills |
| `--color-ok` / `--color-warn` / `--color-danger` | green / amber / red | system-check states only |

Accent rule: orange marks *state* (in your build, filled, hovered, primary action). Text on orange is ink, never white.

## Typography

- Display: **Archivo**, weight 800, `wdth` 118 (125 for the footer wordmark). Roman only, tight tracking.
- Body: **IBM Plex Sans** 400/500/600.
- Mono: **IBM Plex Mono** for prices, specs, counts, and small uppercase data labels (`.label`).
- No section kickers or eyebrows above headings.

## Shape and depth

- Borders: 1.5px ink on anything interactive; dashed ink-3 for *empty* things (empty bays, empty states).
- Radius: 4 tag · 8 control · 12 card · 18 frame.
- Depth: hard offset shadows only (`3px 3px 0 ink`). Hover lifts `translate(-2px,-2px)` and shows the shadow; active presses flat. On dark bands the shadow is paper.
- No gradients, glows, blur, or soft drop shadows.

## Signature pieces

- **PartGlyph** (`components/PartGlyph.tsx`): one line glyph per part type, one orange detail each.
- **Case map** (`components/CaseMap.tsx`): home hero. Bays link to slots and fill from the current build.
- **Build meter** (`components/BuildMeter.tsx`): one segment per builder slot, in the nav.
- **LED** (`.led`): 0.55rem square status light. Used instead of dots or pills.
- **Box-label product card**: slot label strip, glyph well, specs in mono, price in mono.

## Motion

- Easings: `--ease-out` cubic-bezier(0.16, 1, 0.3, 1), `--ease-in`, `--ease-in-out`. Durations 180 / 280ms.
- Allowed: button/card press, glyph tilt on hover, `rise` entrance on hero and modals, LED blink while loading.
- Reduced motion: animations collapse, transitions limited to colour and opacity at 120ms.

## Voice

Plain, specific, a little playful. "Empty bay", "New on the shelf", "The builder reads the fine print for you".
Errors say what happened and what to do. No em dashes in UI copy.

## Pages

- Marketing (home): headline + case map, aisles list, shelf grid, dark builder band, admin sections, orange sell panel.
- App (shop, builder, profile, messages, sell): page title in display type, 1.5px ink rule, content. Dark `band-dark` panel for the system check.
