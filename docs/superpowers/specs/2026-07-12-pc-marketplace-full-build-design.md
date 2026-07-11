# pc-marketplace — Full Functional Build

Date: 2026-07-12

## Goal

Transform the minimal, largely static pc-marketplace into a functional fullstack
application: a dynamic storefront, a slot-based PC builder with compatibility
checking, admin-editable site content, and working auth with user listings and
messaging. All previously hardcoded content becomes dynamic and editable through
the Django admin.

## Stack

- Backend: Django 4.2 + Django REST Framework + SimpleJWT (add
  `djangorestframework-simplejwt` and `Pillow` to requirements).
- Frontend: Next.js 15 App Router, Tailwind CSS, Axios.
- Consolidate onto the App Router: remove legacy Pages Router files
  (`pages/login.js`, `pages/register.js`, `pages/_app.tsx`).

## Data Model

### Product (extend)
- Add `slug` (unique), `brand`, `stock` (int), `is_active` (bool),
  `wattage` (int, nullable — draw for CPU/GPU, capacity for PSU).
- Keep `specs` as JSON-convention text holding compatibility keys:
  `socket`, `memory_type`, `form_factor`.

### ComponentType (extend)
- Add `slot_key` (one of: cpu, mobo, ram, gpu, psu, storage, case, cooler).
  Drives the builder's slots.

### SiteSetting (new, singleton)
- `logo_text`, `contact_email`, `primary_color`, `hero_title`,
  `hero_subtitle`, `hero_cta_label`, `hero_cta_link`, footer link fields.

### HomepageSection (new)
- `order`, `title`, `subtitle`, `image`, `button_label`, `button_link`,
  `background`, `is_active`. Rendered in order on the homepage.

All models registered in Django admin with list displays, filters, and search.

## Backend API

- `GET /api/site-settings/` — public read of the singleton.
- `GET /api/homepage-sections/` — public read, ordered, active only.
- Products: filter by `category`, `component_type`, `seller_type`, `search`,
  `min_price`, `max_price`; ordering; pagination.
- `POST /api/builds/validate/` — input a map of slot -> product id; returns
  compatibility warnings, total price, total wattage, and a PSU recommendation.
- Builds and messages scoped to the authenticated user; `IsAuthenticatedOrReadOnly`
  plus object-level ownership for writes.
- Seed script populating categories, component types (with slot keys), realistic
  products with compatibility specs, site settings, and homepage sections.

## Compatibility Rules (builder)

- CPU socket must equal motherboard socket.
- RAM `memory_type` must equal motherboard `memory_type`.
- Case `form_factor` must accommodate motherboard `form_factor`.
- PSU wattage must be >= sum of component wattage draws * 1.2 headroom;
  otherwise warn with recommended wattage.
- Missing slots produce informational notices, not hard errors.

## Frontend Pages

- `/` — renders `HomepageSection`s + `SiteSetting`; no hardcoded hero.
- `/products` — dynamic grid with category/type/search/price filters + pagination.
- `/products/[id]` — detail: specs, seller, condition, message seller, add to build.
- `/builder` — slot-based builder, live validation, running price + wattage,
  save build (auth required).
- `/profile` — my listings, saved builds, messages.
- `/listings/new` — create a listing (auth required).
- `/login`, `/register` — App Router, wired to JWT.
- Navbar categories/dropdowns from API; Footer from SiteSetting.

## Cross-cutting

- Central Axios client with typed API helpers.
- Hardened AuthContext; loading/empty/error states on all data pages.
- API base URL from environment variable.

## Phases (commit boundaries)

1. Backend foundation: deps, model changes, migrations, admin, seed,
   compatibility endpoint, permissions.
2. Dynamic storefront: products list + filters + detail; dynamic Navbar/Footer.
3. PC builder with compatibility + save.
4. Admin-driven homepage/site settings rendering; auth consolidation
   (login/register/listings/messaging/profile).
5. Docs: update README.

## Out of Scope

- Real payments / cart / checkout.
- Real-time messaging (polling/refetch is sufficient).

## Commit Conventions

- `feat:` / `refactor:` / `chore:` / `docs:` prefixes.
- No AI attribution or co-author lines.
- No generated code comments.
