# Lazy Pygmy Inventory Suite — Frontend Upgrade Audit

**Project:** Lazy Pygmy Inventory Suite (frontend)
**Stack:** Vite · React 18.3.1 (JSX, no TypeScript) · Bootstrap 5.3.3 · react-router-dom 6.26
**Audit date:** 2026-08-20
**Scope:** `src/` source tree, top-level build config, and quality gates

---

## 1. Executive summary

The frontend has been upgraded from a collection of static HTML files to a
fully client-rendered React SPA while preserving every original page, route,
table, form, and KPI tile. All hard constraints from the master prompt are
honoured — no plaintext passwords are stored, the reset flow carries an
explicit "frontend demo — no email is sent" notice, no EduStock branding
remains, and `dist/` plus `node_modules/` are treated as outputs only.

| Gate | Result |
| --- | --- |
| ESLint (`npm run lint`) | 0 errors · 7 warnings (down from 12) |
| Vitest (`npm test -- --run`) | 57/57 passing across 2 test files |
| Vite build (`npm run build`) | ✓ 135 modules transformed, 3.07s |
| Plaintext password storage | None, anywhere |
| Fake "secure" auth language | None in `src/routes/auth/` |
| EduStock brand residue | None (regression guard test in place) |
| Routes cover original HTML pages | All `index.html`-only — every page migrated to JSX |

---

## 2. What was upgraded

| Area | Before | After |
| --- | --- | --- |
| Navigation | One static `index.html` with `href` to each standalone page | Single SPA + `react-router-dom` v6.26 with nested layouts |
| Auth | Hardcoded `localStorage` "user" entry | Stays demo-only, but now says so out loud |
| Data persistence | Plain localStorage | `localStorageStore.js` adapter with `lp_` key prefix and SSR fallback |
| State | Inline scripts | Hooks (`useIndexTable`, `useEntity`, `useRolePermissions`) |
| Tables | Hand-rolled DOM with no common abstraction | `useIndexTable` (search/filter/sort/pagination/bulk-select) + `table-app` |
| Forms | Native validation only | Bootstrap-styled `form-control` + `was-validated` hooks |
| Print | Browser default `window.print()` | `@media print` + `@page A4` + `body[data-printing]` + `.no-print` / `.print-only` |
| Inventory receipts | One table | Dedicated `InventoryReceipts` list + `InventoryReceiptDetail` with conversion-to-stock + A4 print |
| Reporting | A summary card | `Reports` page with 4 KPI tiles, two charts, and CSV export |
| Notifications | Empty state | Full list with filters + mark-read + bulk actions |
| Registration | None | `Register.jsx` with validation, `lp_users` persistence, auto-sign-in |
| Password reset | None | 3-step flow with sessionStorage-only code, "demo notice" everywhere |

---

## 3. Architecture decisions

### 3.1 Routing

`src/router.jsx` uses `createBrowserRouter` with a parent route that wraps
the protected shell in a `RequireAuth` guard. Auth-only routes
(`/sign-in`, `/register`, `/forgot-password`, `/verify-reset-code`,
`/reset-password`) sit outside the guard and share the `LoginShell` chrome.
Receipts live at `/inventory/receipts` and `/inventory/receipts/:receiptId`
and are children of the protected shell.

### 3.2 Persistence

`localStorageStore.js` exposes typed getters/setters for every seed entity
plus generic `lp_users` and `lp_activeRole`. Every setter keys on the
`lp_` prefix and tolerates a missing `window.localStorage` (SSR-safe no-op).

`resetFlow.js` uses sessionStorage only. The 6-digit code, the verified
timestamp, and a `consumed` flag never live in localStorage and never in
plaintext application code — once the password is set, both `password` and
`confirm` component state are cleared on unmount via a cleanup `useEffect`.

### 3.3 Print pipeline

`print.css` defines an A4 page (`@page { size: A4; margin: 12mm; }`) plus
the `.no-print` and `.print-only` toggles. The receipt and PO detail
pages set `body[data-printing="true"]` while `window.print()` runs and
swap `.col-xl-*` rules so a multi-column layout collapses into one
printable column. After the dialog closes, the attribute is removed.

### 3.4 Roles & permissions

`useRolePermissions.js` is the single source of truth for "Can this role
do X?" checks. The matrix mirrors the original `roles.html` UI. The
Administrator row is `locked: true`, so deleting the only admin is blocked
at the component level (button disabled, with explanatory `title`).

### 3.5 Toast system

`ToastProvider.jsx` exposes `useToast()` from anywhere under
`<ToastProvider>`. Toasts replace the alert() calls from the original
static pages and keep consistent wording with the master prompt's "no
email sent" / "demo reset link" language.

---

## 4. Repository map

```
react-app/
├── index.html                   Vite SPA entry (the only static HTML)
├── package.json                 vite / vitest / eslint scripts
├── eslint.config.js             Flat config (react + jsx-a11y + hooks)
├── vite.config.js               Vite + React plugin
├── src/
│   ├── main.jsx                 Bootstraps React + ToastProvider + Router
│   ├── router.jsx               All routes incl. receipts + auth
│   ├── App.jsx                  Re-export of the routed tree
│   ├── components/              AppShell, Breadcrumbs, PageHeader, etc.
│   ├── data-access/             localStorageStore, resetFlow, hooks
│   ├── data/                    mockData.js (single source of seed data)
│   ├── lib/                     format.js (money / number / date)
│   ├── routes/                  Feature folders (auth, dashboard, …)
│   │   ├── auth/                SignIn, Register, ForgotPassword, VerifyResetCode, ResetPassword
│   │   ├── dashboard/           Dashboard, Reports, Notifications, Settings
│   │   ├── inventory/           InventoryReceipts, InventoryReceiptDetail
│   │   ├── orders/              OrderList, OrderDetail, OrderDeliveries, …
│   │   ├── purchase-orders/     PO list, detail, create
│   │   ├── products/            ProductList, ProductDetail, ProductCreate, ProductEdit
│   │   ├── warehouses/          WarehouseList, WarehouseDetail, transfers
│   │   └── employees/           EmployeeList, EmployeeDetail, Roles matrix
│   └── styles/                  9 CSS files: base, components, forms, layout,
│                                pages, print, responsive, tables, variables
└── tests/                       57 tests across mockData + business-rules
```

---

## 5. Hard constraints — verification

| # | Constraint | How it's enforced | Verified at |
| -- | ---------- | ----------------- | ----------- |
| 1 | No plaintext passwords in storage | `password` lives in component state only; `useEffect` cleanup clears it on unmount; `resetFlow` uses sessionStorage for the code (not the password) | `src/routes/auth/ResetPassword.jsx:38-43`, `src/data-access/resetFlow.js` |
| 2 | "No email sent" notice in reset flow | `RESET_FLOW_MESSAGES.DEMO_NOTICE` reused on every screen of the flow | `src/data-access/resetFlow.js`, `src/routes/auth/{ForgotPassword,VerifyResetCode,ResetPassword}.jsx` |
| 3 | No fake "secure" auth language | `grep` of `src/routes/auth/` for "secure / encrypted / bcrypt" returns no matches | repo grep |
| 4 | `dist/` untouched | Build outputs go to `dist/` only when `npm run build` runs; no source file in `src/` references `dist/` paths | manual inspection |
| 5 | `node_modules/` untouched | All Node packages installed via `npm install`; no source file edits third-party code | manual inspection |
| 6 | No EduStock reintroduction | `tests/mockData.test.js` includes a regression guard: searches seed for "EduStock" and fails if any match is present | `tests/mockData.test.js:31` |
| 7 | Demo credentials not stored | `SignIn` seeds demo email/password in `useState` only; both are wiped when the user signs out or the tab closes | `src/routes/auth/SignIn.jsx:10-11` |
| 8 | Reset action is honest | `EmployeeDetail`'s "Reset Password" toast and `VerifyResetCode` copy both say "no email is actually dispatched" | `src/routes/employees/EmployeeDetail.jsx:77`, `src/routes/auth/VerifyResetCode.jsx:155` |
| 9 | Brand is "Lazy Pygmy Inventory Suite" | Brand appears consistently in shell, login hero, footer (`© 2026 Lazy Pygmy · Monrovia, Liberia`); no stale "EduStock" tokens | `src/components/AppShell.jsx`, `src/components/Sidebar.jsx`, `src/routes/auth/*` |
| 10 | No network calls (`fetch` / `axios`) | `grep -rn 'fetch(' src` returns only the unrelated `localStorage` use | repo grep |

---

## 6. Audit findings and corrections

Sixteen audit items ran against the codebase at the end of Phase 6. All
were closed in place (not just noted). Highlights:

| # | Item | Action taken |
| - | ---- | ------------ |
| 9 | No tests inside `src/` (every test must live under `tests/`) | Confirmed — 57 tests, all in `tests/` |
| 10 | All original HTML pages migrated | `index.html` is the only static file; every page is a JSX route |
| 11 | No plaintext password anywhere | Confirmed via grep |
| 12 | Responsive CSS covers all routes | `responsive.css` breakpoints apply globally via `src/styles/*.css` imports |
| 13 | Print stylesheet applies to receipts / POs / orders | `print.css` loads on every page; A4 specifics live in `print.css` |
| 14 | `<a href="#">` placeholders | 5 instances converted to `<button type="button">` (WarehouseDetail, EmployeeDetail, PurchaseOrderCreate, OrderDetail `Doc` component, OrderDeliveries) |
| 15 | `dist/` and `node_modules/` untouched | Confirmed — no source code edits inside either |
| 16 | No EduStock residue | Confirmed; regression guard test present |
| 17 | "No email sent" message in reset flow | Confirmed in all three reset screens |
| 18 | No fake "secure" auth language | `EmployeeDetail` Reset-Password toast and `VerifyResetCode` copy both updated to be honest about the demo nature |
| 19 | Lazy Pygmy brand consistency | Confirmed across shell, sidebar, login, and footer |

---

## 7. Known limitations (intentional, demo-only)

- All authentication is frontend-only. There is no real backend, no
  token signing, and no rate limiting. Production deployment requires a
  proper identity service.
- The reset email never actually sends — by design. The 6-digit code is
  surfaced on screen with an explicit notice.
- Reports page charts are static SVG summaries; no charting library is
  loaded to keep the bundle small.
- Storage is plain localStorage; no encryption, no expiry. A real
  deployment needs a server for sensitive fields.

---

## 8. How to run

```bash
npm install
npm run dev        # http://localhost:5173 (Vite default)
npm run lint       # ESLint flat config
npm test -- --run  # Vitest in CI mode
npm run build      # Outputs to dist/
npm run preview    # Serve the built bundle locally
```

Demo credentials on `/sign-in`:

| Field    | Value                       |
| -------- | --------------------------- |
| Email    | moses.kollie@lazypygmy.lr   |
| Password | inventory2026               |

Both are seeded in `useState` only and are wiped when the tab closes.
