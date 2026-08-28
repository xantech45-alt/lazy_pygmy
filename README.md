# Lazy Pygmy Inventory Suite — Frontend

A React + Vite single-page application that powers the Lazy Pygmy
school-supply business: products, inventory, orders, schools, suppliers,
reports, notifications, and a profile/settings center.

The app is **frontend-only**. All persistence is local to the browser —
no backend, no network calls, no third-party services.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the production build
npm run test     # vitest (jsdom + fake-indexeddb)
npm run lint     # eslint flat config (react + jsx-a11y + react-hooks)
```

Demo sign-in: any non-empty email + password (no real auth is performed;
`lp_auth=1` is set in localStorage).

---

## Tech stack

| Layer | Tool |
| ----- | ---- |
| UI framework | React 18.3 (JSX, no TypeScript) |
| Bundler / dev server | Vite 5.4 |
| Routing | react-router-dom 6.26 |
| Styling | Bootstrap 5.3 + `src/styles/components.css` |
| Icons | Bootstrap Icons |
| State | React Context (`UserProfileContext`, `AppSettingsContext`, `OrderDraftContext`) |
| Persistence | `localStorage` (state) + IndexedDB (images) |
| Tests | Vitest + Testing Library + jsdom + `fake-indexeddb` 6.0 |
| Lint | ESLint flat config (`react`, `jsx-a11y`, `react-hooks`) |

---

## Hard constraints (from the master prompt)

> **Allowed:** React, local persistence, responsive, accessible.
> **Forbidden:** backend, REST, GraphQL, WebSockets, Supabase, Firebase,
> S3, Cloudinary, databases, real auth, email, SMS, password services,
> plaintext passwords, **Blob URLs in localStorage**,
> **large data URLs in localStorage**, server-upload claims, unrelated
> redesigns, fake business rules, dead buttons.
> **Language:** "Import from device" / "Stored in this browser".

All 94 tests + ESLint gate must stay green. Image data lives only in
IndexedDB (`db: lazy-pygmy-assets`, `store: assets`, `keyPath: id`,
IDs from `crypto.randomUUID()`). Object URLs are created in component
state and revoked on unmount or id-change — they are never persisted.

---

## Application map

| Route | Purpose |
| ----- | ------- |
| `/sign-in` | local-only sign-in gate |
| `/dashboard` | KPI dashboard |
| `/products` | list with search / sort / filter / CSV export |
| `/products/new` | create with `ImageImportField` (5 MB / 1600 px long edge) |
| `/products/:sku` | detail with `ImagePreviewThumb` |
| `/products/:sku/edit` | edit + replace image |
| `/products/categories` | category index |
| `/products/:sku/history` | inventory history |
| `/orders` | order list |
| `/orders/new` | wizard step 1 (customer + schedule) |
| `/orders/new/products` | wizard step 2 (catalogue + lines) |
| `/orders/new/review` | wizard step 3 (review + confirmation) |
| `/orders/:id` | order detail |
| `/inventory` | inventory index |
| `/inventory/low-stock`, `/movements`, `/adjustment`, `/receipts`, `/receipts/:id` | inventory flows |
| `/suppliers`, `/suppliers/new`, `/suppliers/:code` | supplier CRUD |
| `/schools`, `/schools/new`, `/schools/:code` | school CRUD |
| `/reports` | report centre |
| `/notifications` | notification preferences + history |
| `/profile` | profile + photo import (2 MB / 512 px long edge) |
| `/settings` | six-tab settings center |

---

## Key components / hooks

- `ImageImportField` — five-stage pipeline (idle → validating → downscalling →
  persisting → ready/error). Validates magic bytes, dimensions, mime, size;
  downsizes in-browser; persists to IDB.
- `ImagePreviewThumb` — revoke-safe object-URL surface; falls back to a
  placeholder when the asset id is missing or pruned.
- `WizardStepper` — semantic `<ol>` with `aria-current="step"` and
  `<Link>` for completed steps.
- `TopbarAccountMenu` — accessible menu-button pattern with ESC, click-outside,
  focus return.
- `useOrderDraft` — order-draft provider with `addLine`, `changeQty`,
  `removeLine`, computed totals (subtotal, discount $44, delivery $35,
  credit overage).
- `useAppSettings` — six-section settings; `updateSection`,
  `resetSection`, `resetAll`.
- `useUserProfile` — current-user profile + photo + signOut action.

---

## Data flow (local only)

```text
  user action
      │
      ▼
  React Context  ◀──  localStorage (`lp_*` keys)
      │
      ▼
  component state
      │
      ├──▶  derived UI (KPIs, totals)
      └──▶  IndexedDB assets (`lazy-pygmy-assets` db, `assets` store)
                  │
                  ▼
              useImageAsset → transient Object URL (revoked on unmount)
```

There are no outbound network calls in the application code. The
`localStorageStore` exposes `get`/`set`/`save*`/`get*` helpers; the
`imageAssetStore` exposes `get`/`getAll`/`delete`/`clear`/`put` for asset
CRUD. Object URLs are never serialised.

---

## Accessibility

- All form controls have matching `htmlFor`/`id` pairs.
- Menu and dialog surfaces use the established `<button class="modal-backdrop-app">`
  pattern to give the click-target a free keyboard listener and an
  accessible role.
- Wizard stepper exposes `aria-current="step"` and lets users re-edit
  completed steps via keyboard-friendly `<Link>`s.
- Image import field uses `role="status"` for busy / error announcements.
- `prefers-reduced-motion` and a manual override in
  `Settings · Appearance` both disable transitions.

---

## Browser support

Tested on the latest Chrome, Firefox, and Edge. The IndexedDB and
`crypto.randomUUID()` APIs require a modern Chromium / Firefox / Safari
build.