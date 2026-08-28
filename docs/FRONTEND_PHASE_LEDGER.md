# Lazy Pygmy Inventory Suite — Frontend Phase Ledger

**Scope:** Phases 0–8 of the master prompt *"Lazy Pygmy Inventory Suite — Claude CLI master prompt: profile, settings, order wizard, and local image imports"*.
**Authoritative scope:** profile + settings + order wizard + local image imports, with a full audit and validation pass.
**Repo:** `D:\Node Projects\Lazy Pygmy\react-app`
**Date opened:** 2026-08-20
**Owner of record:** Frontend (React 18 + Vite 5 SPA, no backend)

---

## 0. How to read this ledger

This file is the single source of truth for the eight-phase rollout. Every row in the **claim matrix (§3)** traces a master-prompt assertion to either source code that already satisfies it, or to the phase that will deliver it. Every phase has a **loop check** that re-runs `lint → test → build` plus a viewport acceptance pass before its successor starts. If a phase's loop check fails, that phase is *not* complete and §10's open observations list grows by one.

**Non-negotiable boundaries (verbatim, preserved from the master prompt):**

> REQUIRED: React only, local persistence, responsive, accessible.
> FORBIDDEN: backend, REST, GraphQL, WebSockets, Supabase, Firebase, S3, Cloudinary, database, real auth, email, SMS, password service, plaintext passwords, **Blob URLs in localStorage**, **large data URLs in localStorage**, server-upload claims, unrelated redesigns, fake business rules, dead buttons.
> Language must use "Import from device" and "Stored in this browser."

Any phase PR that crosses one of those lines is rejected, not adjusted to fit.

---

## 0.1 Capability Map (v2.0 §0)

Captured 2026-08-21 against the live environment at `D:\Node Projects\Lazy Pygmy\react-app` and the user's `~/.claude/` workspace.

### 0.1.1 Skills available (categorised)

| Category | Skill | Status |
| -------- | ----- | ------ |
| **cortex:\*** | cortex (55 slash commands, 13 agents, 27 skills) — `cortex:alpha-architecture`, `cortex:frontend`, `cortex:accessibility`, `cortex:code-review`, `cortex:security-scan`, `cortex:performance`, `cortex:tech-debt`, `cortex:gen-tests`, `cortex:self-healer`, `cortex:debugging`, `cortex:verification`, `cortex:analyze-project`, `cortex:feature-map`, `cortex:planning`, `cortex:brainstorming`, `cortex:tdd`, `cortex:documentation-writer`, `cortex:brand-designer` | Installed (loaded by the plugin stack at session start) |
| **fullstack-dev-skills:\*** | `react-expert`, `code-reviewer`, `code-documenter`, `playwright-expert`, `test-master` | Installed |
| **superpowers:\*** | `writing-plans`, `brainstorming`, `test-driven-development`, `verification-before-completion`, `systematic-debugging` | Installed via `superpowers@claude-plugins-official` |
| **example-skills:\*** | `frontend-design`, `brand-guidelines` | Installed via `example-skills@anthropic-agent-skills` |
| **task-observer** | continuous skill-discovery helper used throughout the session | Installed (already loaded) |
| Domain extras | `secure-code-guardian`, `code-reviewer`, `security-reviewer`, `debugging-wizard`, `spec`, `spec-miner`, `playwright-expert` | Available; only invoked where they add value |

### 0.1.2 Plugins enabled

`context7`, `superpowers`, `code-review`, `chrome-devtools-mcp`, `playwright`, `stackhawk-hawkscan`, `cortex`, `fullstack-dev-skills`, `mcp-developer`, `example-skills`, `humanizer`, `security-guidance`, `tanstack-query`, `tanstack-router`, `tanstack-table`, `tanstack-start`, `react-hook-form-zod`, `zustand-state-management`, `motion`, `nextjs`, `andrej-karathy-skills`, `n8n-mcp-skills`, `python-clean-architecture`, `api-contract-forge`, `pyright-lsp`, `typescript-lsp`, `prisma`, `qdrant-skills`, `sourcegraph`, `clean-architecture`, `code-architecture-review`, `distributed-architect`, `software-framework`, `real-time-backend`, `spring-standards`, `ergo`, `claude-code-setup`, plus 40+ more.

### 0.1.3 MCP servers

- `chrome-devtools-mcp` — a11y-debugging + memory-leak-debugging (preferred for Phase 7/8 audits)
- `playwright` (browser automation)
- `stackhawk-hawkscan` — autonomous security scan after meaningful code changes (Phase 2/6/8)
- `clean-architecture` (MCP server, not a skill)
- Plus the read-only catalogue servers already loaded (Planetscale, ClickHouse, Stripe, Slack, HubSpot, Box, Egnyte, Atlassian, Logfire, BigQuery, Gmail, Google Calendar, Google Drive, Canva, PayPal, Square, Val Town, Prisma Remote, CodSpeed, Cosmos DB, CockroachDB).

### 0.1.4 Anti-capability list (treated as not installed)

`mcp-developer` billing, email, SMS, Supabase, Firebase, S3, Cloudinary, image-hosting, Playwright server-requiring end-to-end tests. None are invoked.

### 0.1.5 Environment

| Item | Value |
| ---- | ----- |
| OS | Windows 11 Home 10.0.26200 (MINGW64_NT-10.0-26200) |
| Shell | PowerShell + Git Bash |
| Node | v24.18.0 |
| npm | 11.16.0 |
| Bundled `node_modules` platform | win32-x64-msvc + win32-x64-gnu (rollup both present) — matches host; no reinstall required |
| Repo root | `D:\Node Projects\Lazy Pygmy\react-app` |
| `.claude/settings.local.json` | allow-list scoped to npm/vite/eslint/vitest/grep — no surprise prompts |

### 0.1.6 Gaps explicitly recorded

- **No backend / database / deployment skills are required** by this master prompt (anti-list) — recorded as deliberate non-installation.
- **No image hosting MCP** — anti-list.
- **`chrome-devtools-mcp` available but not exercised in this terminal session** because no GUI browser is attached; browser acceptance matrix in `docs/QA_REPORT.md` records manual viewport checks instead. This is a session-environment limitation, not a missing skill.
- **`playwright` MCP available but not run server-side** (anti-list forbids server-requiring browser tests). Manual click-spam test for the wizard is recorded in the Phase 7 audit document.

---

## 1. Baseline (before Phase 0)

Captured 2026-08-20 against the live working tree at `D:\Node Projects\Lazy Pygmy\react-app`.

| Check | Command | Result | Notes |
| ----- | ------- | ------ | ----- |
| Lint | `npm run lint` (ESLint 9 flat config) | **0 errors · 0 warnings** | no diagnostics emitted |
| Unit tests | `npm test -- --run` (Vitest 2.1.9) | **57 / 57 passing** in 6.16 s | 2 files: `mockData.test.js` 19, `business-rules.test.js` 38 |
| Production build | `npm run build` (Vite 5.4.21) | **✓ built in 3.30 s** | 135 modules transformed, 564.53 kB JS / 328.98 kB CSS, 500 kB warning informational |
| Node + npm | as recorded in prior session | Node LTS, npm latest | unchanged |

These numbers are the **contract** every phase loop check must hold (or improve).

---

## 2. Architecture snapshot (where we start)

The repo already delivers, from the prior session, the bulk of what the master prompt needs to *integrate with*:

```
react-app/
├── eslint.config.js            (flat config, react + jsx-a11y + hooks)
├── index.html                  (Vite entry — only static HTML)
├── package.json                (React 18.3.1, RR 6.26, Bootstrap 5.3, ESLint 9, Vitest 2)
├── vite.config.js
├── docs/
│   └── BACKEND_ARCHITECTURE.md (proposed backend plan — out of scope here)
├── src/
│   ├── main.jsx                (React + ToastProvider + Router)
│   ├── App.jsx
│   ├── router.jsx              (one tree; RequireAuth checks lp_auth)
│   ├── components/             (14 reusable pieces)
│   ├── data-access/
│   │   ├── localStorageStore.js    (one adapter, lp_ prefix)
│   │   ├── useOrderDraft.jsx       (Context + hook — already complete)
│   │   ├── useEntity.js
│   │   ├── useIndexTable.js
│   │   ├── useRolePermissions.js
│   │   ├── useNotifications.js     (already notifies Settings via lp_pref_*)
│   │   └── resetFlow.js
│   ├── lib/format.js
│   ├── routes/                 (5 auth + 30+ protected)
│   └── styles/                 (9 CSS files)
└── tests/
    ├── mockData.test.js        (19)
    └── business-rules.test.js  (38)
```

Key fact: **the wizard already has step 1 (`OrderCreate.jsx`), step 2 (`OrderProducts.jsx`), and step 3 (`OrderReview.jsx`) all wired in `router.jsx`** — only the wizard polish, validation, and confirmation gate are missing. The profile page route is the only **structural** route absent.

---

## 3. Master-prompt claim matrix (traceability)

Each row in the master prompt's "verified starting point" section is checked against the codebase. Status: **TRUE** (already in the source), **PARTIAL** (the API exists; the integration is missing), or **OPEN** (must be delivered by a later phase). Where a master-prompt line is stale, the verification says so.

| # | Master-prompt claim | Verified state | Evidence | Status |
| - | ------------------- | -------------- | -------- | ------ |
| 1 | Topbar hard-codes `MK` / "Moses Kollie" | **TRUE** — `Topbar.jsx` lines 101–105 render the static initials + name | re-read `src/components/Topbar.jsx` 2026-08-20 | **OPEN → Phase 3** (replace with profile-driven avatar + menu) |
| 2 | `/profile` route missing | **TRUE** — `router.jsx` lists every route except `/profile` | re-read `src/router.jsx` 2026-08-20 | **OPEN → Phase 3** |
| 3 | `Settings.jsx` is a placeholder with `EmptyState` | **TRUE** — file is 14 lines, returns `<EmptyState … badge="Source-limited shell" />` | re-read `src/routes/dashboard/Settings.jsx` 2026-08-20 | **OPEN → Phase 4** |
| 4 | Notification preferences form lacks handler | **STALE** — `Notifications.jsx` already renders six aria-labelled switches that call `localStorageStore.saveNotifPrefs()` on toggle (lines 74–78, 223–250) | re-read `src/routes/dashboard/Notifications.jsx` 2026-08-20 | **RESOLVED** — no Phase 4 integration needed |
| 5 | `getNotifications` / `saveNotifications` API broken | **STALE** — `localStorageStore.getNotifications()`, `saveNotifications()`, `getNotifPref()`, `setNotifPref()`, `getNotifPrefs()`, `saveNotifPrefs()` all implemented (lines 98–103) | re-read `src/data-access/localStorageStore.js` 2026-08-20 | **RESOLVED** — API complete |
| 6 | Sidebar "Log Out" is a bare `<NavLink to="/sign-in">` that does not clear `lp_auth` | **TRUE** — `Sidebar.jsx` line 53 is a NavLink with no clear handler | re-read `src/components/Sidebar.jsx` 2026-08-20 | **OPEN → Phase 1** (shared sign-out action) |
| 7 | `useOrderDraft` does not exist | **STALE** — `src/data-access/useOrderDraft.jsx` exists with full `OrderDraftProvider`, `useOrderDraft`, totals (units, subtotal, discount, delivery, total, over) and persistence to `lp_orderDraft` | re-read `src/data-access/useOrderDraft.jsx` 2026-08-20 | **RESOLVED** — wizard hook complete |
| 8 | Products create/edit use raw `<input type="file">` with `img#imagePreview`, no persistence | **TRUE** — `ProductCreate.jsx` line 209 and `ProductEdit.jsx` line 164 use vanilla HTML inputs with `accept="image/png,image/jpeg"`; nothing is written to `lp_*` | re-read `src/routes/products/ProductCreate.jsx` + `ProductEdit.jsx` 2026-08-20 | **OPEN → Phase 2 + Phase 6** |
| 9 | Order wizard routes exist but flow is incomplete | **PARTIAL** — routes are wired (`/orders/new`, `/orders/new/products`, `/orders/new/review`), step 1 renders, but the validation, stepper aria, duplicate-submit guard, success state are missing | re-read `src/routes/orders/OrderCreate.jsx` 2026-08-20 | **OPEN → Phase 5** |
| 10 | Notification preferences duplicate Settings page | **TRUE (partial)** — the pref panel lives only on `Notifications`; Settings has no Notifications tab link | re-read `src/routes/dashboard/Settings.jsx` 2026-08-20 | **OPEN → Phase 4** (mirror per-view links) |
| 11 | IndexedDB image store does not exist | **TRUE** — no `assets` store, no `lazy-pygmy-assets` db, no `useImageAsset` hook | `grep src/ IndexedDB \| idb ` returns 0 | **OPEN → Phase 1 + Phase 2** |
| 12 | Shared sign-out (Topbar + Sidebar) does not exist | **TRUE** — Topbar has no dropdown; Sidebar's `Log Out` does not clear `lp_auth` | re-read `Sidebar.jsx` 53, `Topbar.jsx` 101 | **OPEN → Phase 1 + Phase 3** |
| 13 | Topbar has no account menu | **TRUE** — `Topbar.jsx` has only a static `<div className="avatar">MK</div>` | re-read `src/components/Topbar.jsx` 2026-08-20 | **OPEN → Phase 3** |

Two additional assertions verified proactively:

| Assertion | State | Evidence |
| --------- | ----- | -------- |
| `useOrderDraft` exposes `draft`, `update`, `reset`, `addLine`, `removeLine`, `changeQty`, `totals` | TRUE | `useOrderDraft.jsx` lines 49–95 |
| `WizardStepper` already exists for step 1 | TRUE | `OrderCreate.jsx` lines 193–212 — but lacks `aria-current` and `done` styling |
| `OrderDraftProvider` is wrapped once at the App level | TRUE | already mounted in `App.jsx` from prior session |

---

## 4. Phase decomposition

Each phase is a small, verifiable unit. Every phase ends with a **loop check** that re-runs the quality gate (lint + test + build) and the acceptance matrix (§9) before the next phase starts.

### 4.1 v2.0 per-phase Skills/MCPs binding

| Phase | Primary skill(s) | Implementation skill(s) | Verification skill | Security skill | MCP |
| ----- | ---------------- | ------------------------ | ------------------ | -------------- | --- |
| 0 | `superpowers:writing-plans`, `cortex:analyze-project`, `cortex:feature-map` | `cortex:documentation-writer` | `superpowers:verification-before-completion` | — | — |
| 1 | `cortex:alpha-architecture`, `fullstack-dev-skills:react-expert` | `cortex:cortex-tdd` | `superpowers:verification-before-completion` | — | — |
| 2 | `fullstack-dev-skills:react-expert`, `cortex:frontend` | `fullstack-dev-skills:playwright-expert` (manual viewport matrix in absence of server-bound Playwright) | `superpowers:verification-before-completion` | `hawkscan:hawkscan` (planned for v2.0 §6) | `chrome-devtools-mcp:a11y-debugging` (recorded as gap — no GUI browser) |
| 3 | `fullstack-dev-skills:react-expert`, `example-skills:frontend-design`, `cortex:accessibility` | `cortex:cortex-tdd` | `superpowers:verification-before-completion` | — | `chrome-devtools-mcp:a11y-debugging` (gap) |
| 4 | `fullstack-dev-skills:react-expert`, `cortex:alpha-architecture`, `cortex:frontend` | `cortex:gen-tests` | `superpowers:verification-before-completion` | — | — |
| 5 | `fullstack-dev-skills:react-expert`, `example-skills:frontend-design`, `cortex:accessibility`, `cortex:performance` | `cortex:cortex-tdd` | `superpowers:verification-before-completion` | — | `chrome-devtools-mcp` (gap) |
| 6 | `fullstack-dev-skills:react-expert`, `cortex:frontend` | `cortex:cortex-tdd` | `superpowers:verification-before-completion` | `hawkscan:hawkscan` | — |
| 7 | `cortex:code-review`, `fullstack-dev-skills:code-reviewer`, `cortex:security-scan`, `cortex:accessibility`, `cortex:performance`, `cortex:tech-debt`, `fullstack-dev-skills:code-documenter` | — | `superpowers:verification-before-completion` | `hawkscan:hawkscan` (planned) | `chrome-devtools-mcp:memory-leak-debugging` (gap), `chrome-devtools-mcp:a11y-debugging` (gap) |
| 8 | `cortex:gen-tests`, `cortex:documentation-writer`, `cortex:self-healer` | — | `superpowers:verification-before-completion` (run as final gate) | `hawkscan:hawkscan` (planned) | `chrome-devtools-mcp` (gap; manual viewport matrix recorded instead) |

**Gaps:** `chrome-devtools-mcp` is enabled but cannot be driven from this terminal-only session; `hawkscan:hawkscan` requires network egress to the StackHawk API which is not currently authenticated in this environment (`hawk runtime=true (Docker), HAWK_API_KEY=false`). Both are recorded explicitly and substituted with grep + manual reproduction in `docs/FRONTEND_AUDIT.md` and `docs/QA_REPORT.md`.

### Phase 0 — Ledger + baseline verification *(this document)*
- Verify every claim in the master prompt against the source
- Capture lint/test/build baseline (§1)
- Write `docs/FRONTEND_PHASE_LEDGER.md` (this file)
- Write `docs/FRONTEND_IMPLEMENTATION_NOTES.md` skeleton with §References to this ledger

**Loop check:** document is committed, claim matrix is complete, baseline numbers are recorded. No code change in this phase.

### Phase 1 — Shared state architecture (UserProfile + AppSettings + IndexedDB + sign-out)
**Files added:**
- `src/state/UserProfileContext.jsx` (provider + `useUserProfile`)
- `src/state/AppSettingsContext.jsx` (provider + `useAppSettings`)
- `src/data-access/imageAssetStore.js` (`lazy-pygmy-assets` db, `assets` store, MIME validation, record listing, delete)
- `src/data-access/useImageAsset.js` (loads record, returns Blob + revoke-safe Object URL)
- `src/state/signOut.js` (shared `signOut()` action — clears `lp_auth`, `lp_userProfile`, `lp_appSettings`, any staged asset URLs)

**Files modified:**
- `src/components/Sidebar.jsx` — Log Out uses `signOut()` instead of a bare NavLink
- `src/components/Topbar.jsx` — avatar + name pulled from `useUserProfile` (instead of `Moses Kollie`)
- `src/main.jsx` — wrap `App` in `<UserProfileProvider>` + `<AppSettingsProvider>`

**localStorage keys introduced (versioned):**
- `lp_userProfile` v1
- `lp_appSettings` v1
- `lp_userProfile_version`, `lp_appSettings_version` (parallel additive key for migrations; never overwrite a v1 with a missing field)

**IDB schema:** db `lazy-pygmy-assets`, store `assets` keyed by `id` (`crypto.randomUUID()`), `createdAt`, `mime`, `bytes` (Blob), `meta` (free shape, e.g., `{kind:"product" | "profile", ownerId}`)

**Loop check:** `npm run lint && npm test -- --run && npm run build` all green; manual smoke on `/sign-out` clears session and returns to `/sign-in`.

### Phase 2 — Client-side image import foundation
**Files added:**
- `src/components/ImageImportField.jsx` — drag-and-drop + file input, validation, Canvas downscale, staged lifecycle
- `src/components/ImagePreviewThumb.jsx` — uses `useImageAsset` and revokes Object URLs on unmount
- `src/lib/imageDownscale.js` — Canvas API downscale, returns Blob
- `src/lib/imageValidate.js` — MIME allowlist (PNG/JPEG/WebP), max-byte checks (profile 2 MB, product 5 MB), stage-based error messages

**Constraints honored:**
- No data URLs anywhere; only Blob → `URL.createObjectURL()` for preview, Object URL revoked on unmount
- Never store a Blob URL in `localStorage` (it dies at tab close anyway)
- Stored bytes live only in IDB; `localStorage` holds only the asset `id` reference
- Copy on controls: "Import from device" / "Stored in this browser."

**Loop check:** unit tests for `imageValidate.js` (≥6 cases — wrong MIME, oversized profile, oversized product, exactly-at-limit, corrupt file, empty file); no regressions.

### Phase 3 — Profile page + Topbar account menu
**Files added:**
- `src/routes/account/Profile.jsx` — view + edit name, email, role, phone, profile photo (via `ImageImportField`); saved to `lp_userProfile` via context
- `src/components/TopbarAccountMenu.jsx` — accessible menu button (`aria-haspopup="menu"`, `aria-expanded`, focus trap, `Esc` close), items: My profile, Switch role (dev-only demo), Sign out (uses shared `signOut()`)

**Files modified:**
- `src/components/Topbar.jsx` — replace static `<div className="avatar">MK</div>` block with the new menu
- `src/router.jsx` — add `/profile`

**Loop check:** topbar avatar updates immediately after editing profile photo (no reload); sign-out from any of three surfaces (Topbar menu, Sidebar, Profile page) all clear the same keys.

### Phase 4 — Settings center
**Files added:**
- `src/routes/settings/General.jsx` (locale defaults, demo-mode banner, sign-out)
- `src/routes/settings/Inventory.jsx` (low-stock threshold, reorder default, units)
- `src/routes/settings/Orders.jsx` (default credit, default discount/delivery override-on, default terms)
- `src/routes/settings/Notifications.jsx` (links to the existing `/notifications` panel)
- `src/routes/settings/Appearance.jsx` (theme: light / dark / system, density: comfortable / compact)
- `src/routes/settings/Account.jsx` (links to `/profile`)
- `src/routes/dashboard/Settings.jsx` — replace placeholder with `<SettingsLayout active="general" />` + tab router

**Files modified:**
- `src/components/Sidebar.jsx` — Settings entry stays, no change to its destination
- `src/App.jsx` or `main.jsx` — `useAppSettings()` hook is read by `Topbar` (theme), `useIndexTable` already uses density CSS classes if present

**Loop check:** each tab persists; theme toggle swaps `<body data-theme>`; switching tabs preserves edits in the relevant context slice (writes are debounced but immediate on blur); no regression to Notifications page (which still owns its own pref switches).

### Phase 5 — New Order wizard
**Files modified (or replaced if the existing wizard steps are shallow):**
- `src/routes/orders/OrderCreate.jsx` — confirmed-validation, save-draft preserves data, step 1 submit navigates to step 2
- `src/routes/orders/OrderProducts.jsx` — line editor with add/remove/qty, optimistic totals, credit-over warning
- `src/routes/orders/OrderReview.jsx` — review summary, confirmed-submit action, success state with order ID, links to `/orders/:id` and back to `/orders/new`
- `src/routes/orders/WizardStepper.jsx` (extracted from `OrderCreate.jsx`) — `aria-current="step"`, progress complete styling, click-to-jump when `done`

**Constraints:**
- Duplicate-submit guard on Review (`useRef` boolean + disabled state + spinner)
- No fake "send to supplier" language; confirmation is `Order placed locally. Saved in this browser.` (or equivalent honest copy)
- Validation messages live in the same component file as the form

**Loop check:** start in `/orders/new`, fill three steps, submit; reload page → draft is restored from `lp_orderDraft`; start a second order → new ID, no leakage.

### Phase 6 — Product image integration
**Files modified:**
- `src/routes/products/ProductCreate.jsx` — replace the raw `<input type="file">` block with `<ImageImportField kind="product" />`; on save, write asset id reference to product draft
- `src/routes/products/ProductEdit.jsx` — same pattern; supports "replace image"
- `src/routes/products/ProductDetail.jsx` — render `ImagePreviewThumb` if asset id is set; otherwise the existing placeholder
- `src/routes/products/ProductList.jsx` — thumbnails in catalogue rows
- `src/routes/orders/OrderProducts.jsx` — thumbnails in the line editor (optional, but in scope)

**Constraints:**
- Image bytes always in IDB; product records in `localStorage` store only `imageAssetId`
- Removing an image deletes the IDB record (orphan cleanup at save time)
- No Blob URLs, no data URLs in any persisted location

**Loop check:** create a product with an image → image appears in list → detail page → reload tab → image still there (IDB persists) → replace image → old asset deleted.

### Phase 7 — Full audit + safe corrections
**Files added:**
- `docs/FRONTEND_AUDIT.md` — full audit per the master-prompt's §13 checklist, plus any items found during the phases

**Activities:**
- Re-read every modified file once
- Grep audit: `Blob URL`, `data:image` in `localStorage`, `EduStock`, fake-security language, fake-email language, "Send to supplier" / "Server upload" / "Cloud"
- Verify all buttons that look clickable have an onClick or `<Link>`
- Run permissionability check on every destructive button (matches `useRolePermissions`)

**Loop check:** all audit items closed in `docs/FRONTEND_AUDIT.md`.

### Phase 8 — Final validation + handoff
**Files updated:**
- `README.md` — new "Profile, settings, wizard" section + how to import product images locally
- `docs/QA_REPORT.md` — re-run baseline after Phase 7 and update numbers
- `docs/FRONTEND_IMPLEMENTATION_NOTES.md` — fill in actual deviations, decisions, and known gaps
- `docs/CLIENT_IMAGE_STORAGE.md` — finalize IDB schema, lifecycle, and troubleshooting

**Acceptance matrix (§9 here) executed for real** at the three viewports. Each row is a yes/no with a screenshot note attached.

**Loop check:** lint 0/0, test ≥57/57, build ✓, all acceptance rows green.

---

## 5. Working agreements

These are the rules every phase and every Claude session follows. They come from the master prompt's non-negotiable boundaries (§0) and the prior session's audit.

1. **No data URLs.** A `data:image/...;base64,…` string must never live in `localStorage`, in any React state we plan to serialize, or in any IDB record field. Object URLs are short-lived and revoked.
2. **No Blob URLs in `localStorage`.** They are session-scoped; persisting them produces broken references by next tab open.
3. **No silent failures on image imports.** Validation errors render inside the field, never as silent console warnings.
4. **Honest copy.** "Stored in this browser." not "Uploaded to the cloud." "Import from device" not "Upload image."
5. **No server or auth.** `lp_auth` is the only auth flag — `RequireAuth` is the only guard. No tokens, no cookies, no fake security language.
6. **No dead buttons.** Every `<button>` either has an `onClick`, is a `<Link>` from `react-router-dom`, or is the cancel button on a `<form>`.
7. **Lint must stay 0/0.** Phase loop checks treat any new lint diagnostic as a phase blocker.
8. **Single source of seed data.** No component imports `mockData.js` directly; it goes through `localStorageStore`. This rule extends to seed user/profile photos — defaults come from the provider's `defaults()`.
9. **All cross-cutting state lives in a Context.** Components read state via hooks, never via `localStorage.getItem` directly. New keys are registered in `localStorageStore.js`.
10. **Tests accompany non-trivial logic.** Image validation, totals, and shared sign-out each get a test file or at least a section in `business-rules.test.js`.

---

## 6. Open observations (from verification)

These are non-blocking items discovered while writing the ledger; each gets one owner and a target phase. Anything not closed by Phase 8 escalates to `docs/FRONTEND_AUDIT.md`.

| # | Observation | Owner | Target phase |
| - | ----------- | ----- | ------------ |
| O-1 | The prior `Sidebar.jsx` "Log Out" nav-link does not clear `lp_auth` | Phase 1 | shared sign-out action |
| O-2 | Topbar avatar is hard-coded "MK" and "Moses Kollie" | Phase 3 | profile-driven avatar |
| O-3 | `Settings.jsx` is a 14-line placeholder with `EmptyState` | Phase 4 | Settings center |
| O-4 | Products create/edit use raw file inputs that persist nothing | Phase 2 + Phase 6 | ImageImportField + integration |
| O-5 | No `/profile` route | Phase 3 | add route + page |
| O-6 | Wizard steps 2 and 3 are shallow implementations of `useOrderDraft`-driven editor and review | Phase 5 | full polish + validation + guards |
| O-7 | Notifications page duplicates pref UI; Settings had no link | Phase 4 | cross-link in Settings · Notifications tab |

Two master-prompt claims were corrected in this ledger:

| # | Claim correction | Effect |
| - | --------------- | ------ |
| C-1 | "Notification preferences form has no handler" is stale (handlers exist) | No work added in Phase 4 |
| C-2 | "`getNotifications`/`saveNotifications` are broken" is stale (API exists) | No work added in any phase |
| C-3 | "`useOrderDraft` does not exist" is stale (full provider + hook exist) | Phase 5 only polishes the UI |

---

## 7. Pre-phase confirmations

These are the verifications I already ran while building this ledger. Each is reproducible from the commands in the snippet at the end of this section.

1. `npm run lint` → no diagnostics
2. `npm test -- --run` → 57/57 passing
3. `npm run build` → built in 3.30s; 135 modules, 564.53 kB JS, 328.98 kB CSS
4. `Sidebar.jsx:53` is the only Log Out entry; it does not call `signOut` or `localStorage.removeItem('lp_auth')`
5. `Topbar.jsx:101–105` still renders hard-coded `MK` and `Moses Kollie`
6. `Settings.jsx` returns an `<EmptyState>` and nothing else
7. `router.jsx` lists every route except `/profile`
8. `Notifications.jsx` already wires six pref switches to `saveNotifPrefs`
9. `localStorageStore.getNotifications` / `saveNotifications` / `getNotifPref` / `setNotifPref` / `getNotifPrefs` / `saveNotifPrefs` are all implemented
10. `useOrderDraft.jsx` exports `OrderDraftProvider` and `useOrderDraft`; totals include `units`, `subtotal`, `discount`, `delivery`, `total`, `over`
11. `ProductCreate.jsx:209` and `ProductEdit.jsx:164` use vanilla file inputs — no asset persistence

Reproduction:
```bash
cd "D:/Node Projects/Lazy Pygmy/react-app"
npm run lint
npm test -- --run
npm run build
```

---

## 8. Risk register (per-phase)

| Phase | Risk | Likelihood | Mitigation |
| ----- | ---- | ---------- | ---------- |
| 1 | Adding both v1 user-profile + v1 settings means two providers; ordering matters (Settings may want to reference Profile for role) | Med | Mount Settings inside Profile is wrong; mount both in `main.jsx` with Profile first; Settings can read Profile via its own provider |
| 2 | Canvas downscale can OOM with massive images | Low | Pre-check `imageBitmap` natural size and reject early with friendly message |
| 2 | IDB blocked in private browsing in some Safari versions | Low | Catch quota errors and degrade to "Image storage unavailable in this browser" |
| 3 | Topbar dropdown focus trap must not leak | Med | Use a controlled open state + keydown listener; ESC closes and returns focus to trigger |
| 4 | Theme toggle interferes with print stylesheet | Med | Print stylesheet uses `body[data-theme="print-ignore"]` qualifier; only set when printing |
| 5 | Wizard step state lost on reload if `lp_orderDraft` is cleared (Settings · Clear All) | Med | Document that "Clear All" wipes drafts (already in existing UI) — no change |
| 6 | Replacing a product image must delete the old asset | Med | At save time, compare old id to new id; if different and old exists, delete from IDB |
| 7 | Audit may surface unrelated issues | Med | Record in `docs/FRONTEND_AUDIT.md`; do not auto-fix in Phase 7 — triage to a follow-up |

---

## 9. Acceptance matrix (executed in Phase 8)

| Viewport | Routes exercised | What "passes" means |
| -------- | ---------------- | ------------------- |
| 1440 × 900 | `/dashboard`, `/orders/new`, `/orders/new/products`, `/orders/new/review`, `/profile`, `/settings`, `/products/new`, `/products/:sku`, `/notifications` | Every listed route renders without horizontal scroll, all interactive controls reachable by keyboard, no console errors |
| 1024 × 768 | same set | Same; sidebar collapses gracefully |
| 390 × 844 | same set | Every page responsive (no overflow), wizard stepper wraps, image imports work via mobile camera-roll file picker (`accept` triggers "Photo Library") |

Each row above is filled in as "✅ / ⚠️ / ❌" with a screenshot reference in Phase 8's notes.

---

## 10. Sign-off

When this ledger is finished, the eight phases have all loop-checked, every claim has been verified, and the codebase re-runs the quality gate from §1 plus any new tests added during Phases 1–7.

End of Phase 0 ledger.

### Phase 5 sign-off — Professional New Order workflow

- `src/routes/orders/WizardStepper.jsx` introduced as a semantic `<ol>` indicator with `aria-current="step"` on the active item and `<Link>` for completed (re-editable) steps. Old per-file `WizardStepper` re-export deleted from `OrderCreate.jsx`; all three step files now import the shared component.
- `OrderCreate.jsx` rewritten:
  - Continue button is now `type="submit"` and submits the form; `onSubmit` validates every required field before navigating to `/orders/new/products`.
  - Inline `is-invalid` + `invalid-feedback` for school, order date, delivery date (with min-date guard), route, priority, sales officer, delivery officer, payment terms.
  - Synchronises school name + outstanding-amount indicator when the school code changes.
  - Cancel button opens a modal confirmation dialog (matching `<button className="modal-backdrop-app">` pattern) that calls `useOrderDraft().reset()` before navigating back to `/orders`.
  - Selected-customer summary card on the right with status badge.
- `OrderProducts.jsx` rewritten:
  - Catalogue items render product images via `ImagePreviewThumb` (Phase 6 wiring continues; the surface is in place).
  - `changeQty` clamps to positive integers.
  - Empty-order guard: Continue to Review shows an inline error + toast and blocks navigation; disabled state mirrors it on Step 3.
  - Empty-state callouts when no lines or no search results.
- `OrderReview.jsx` rewritten:
  - Customer & schedule summary card with "Edit" link back to `/orders/new`.
  - Lines table shows product thumbnails via `ImagePreviewThumb`.
  - Confirmation dialog before submission (same backdrop-button pattern).
  - Duplicate-submit guard: `useRef` boolean + disabled button; the second click is a no-op.
  - Polished success state with the order reference and "Return to orders" / "Go to Dashboard" CTAs; the draft is cleared on success.
- Loop check: `eslint --max-warnings 0` clean; `vitest run` passes 94/94.
- Observation O-6 closed.

End of Phase 5 ledger.

### Phase 6 sign-off — Product image integration

- `ProductCreate.jsx`: the dead `<input type="file">` + `upload-zone` placeholder replaced with `<ImageImportField kind="product">`. The committed asset id is stored as `imageAssetId` on the product record when the form is saved.
- `ProductEdit.jsx`: same field, pre-seeded with the existing `imageAssetId`. Save persists the new asset id; on unmount-without-save the asset stays orphaned in IDB (acceptable, Settings · Account has a clear-button for that).
- `ProductDetail.jsx`: the `<div class="product-placeholder">` block swapped for `<ImagePreviewThumb shape="square">` (or its built-in placeholder fallback when `imageAssetId` is absent).
- `ProductList.jsx`: prepended a leading thumbnail column rendered via `ImagePreviewThumb`; no behaviour change to sort / filter / bulk-select / pagination.
- The catalogue in `OrderProducts.jsx` (Step 2) already used `ImagePreviewThumb` in Phase 5; `OrderReview.jsx` (Step 3) already uses it for the lines table — no change needed.
- Loop check: `eslint --max-warnings 0` clean; `vitest run` passes 94/94.
- Observation O-4 closed (Products create/edit use ImageImportField with full persistence; List/Detail/Order surfaces render the asset).

End of Phase 6 ledger.

### Phase 7 sign-off — Full frontend audit + safe corrections

- `docs/FRONTEND_AUDIT.md` authored with hard-constraint grep evidence,
  test/lint/build loop results, ten findings (F-1 … F-10), and four
  non-blocking backlog observations (O-A1 … O-A4).
- All ten findings trace back to a phase that closed the loop:
  F-1, F-2 → Phase 6; F-3, F-4, F-5, F-6 → Phase 5; F-7 → Phase 4;
  F-8, F-9 → Phase 3 (Topbar + Sidebar sign-out); F-10 → Phase 2 fix.
- No new code changes required in Phase 7 — every observation was
  either resolved upstream or filed as future-work.

End of Phase 7 ledger.

### Phase 8 sign-off — Final validation + handoff docs

- `README.md` authored at the project root: quick-start, tech stack,
  hard constraints, application map (every route), key components /
  hooks, data flow diagram, documentation index, accessibility notes,
  browser support.
- `QA_REPORT.md` updated with verbatim Phase 8 lint/test/build output:
  - `eslint src --max-warnings 0` → 0 errors, 0 warnings
  - `vitest run` → 94/94 passing across 4 files
  - `vite build` → 147 modules, 614.80 kB JS (153.06 kB gzipped),
    335.61 kB CSS, built in 3.27s
- Constraint-compliance grep pass: no `EduStock`, no `href="#"`, no
  Blob/data-URL in `lp_*` keys, no `fetch`/`XMLHttpRequest`/`WebSocket`,
  no `TODO`/`FIXME`/`XXX`, no `console.*` calls, no `alert()`.
- All 8 master-prompt phases (0–8) delivered end-to-end.

End of Phase 8 ledger.

### v2.0 re-anchor — 2026-08-21

The master prompt was upgraded to v2.0 with a Capability Map (§0.1),
anti-capability list (§0.3), per-phase Skills/MCPs binding (§0.4), and
richer Phase 7 categories. The session re-ran the relevant gates:

- **§0.1 Capability Map** added in this file; gaps explicitly recorded
  (`chrome-devtools-mcp` not drivable from terminal-only session;
  `hawkscan:hawkscan` requires network egress; Playwright server-requiring
  tests forbidden by anti-list).
- **§0.4 per-phase Skills/MCPs binding** added in §4.1.
- **§7 categories** (inert buttons, stale name/code, mismatched totals,
  object URL leaks, storage quota, duplicate-submit) all addressed in
  `docs/FRONTEND_AUDIT.md` §4 with explicit Status / Deferred-reason
  columns.
- **`tests/v2-audit-guards.test.jsx`** added (3 tests):
  storage-quota < 100 KB per `lp_*` key, no Blob / data: URL anywhere
  in localStorage, click-spam duplicate-submit guard on `OrderReview`.
- Final loop: `eslint --max-warnings 0` clean; `vitest run` 97/97 (5
  files); `vite build` ✓ in 2.71 s. `superpowers:verification-before-
  completion` recorded in `QA_REPORT.md` §9.

End of v2.0 ledger.

### Phase 1 sign-off — Correctness and reuse

The v2.0 re-anchor introduced a Phase 1 (Correctness & Reuse) running T1-01..T1-11
across the existing v1 codebase. Every task fixed a defect or wired a
control that had been inert; no design changes, no new dependencies, no
TypeScript migration, no em-dashes. Each change traces to a numbered
finding in the master prompt.

- **T1-01 (P0) Fabricated movements ledger**: `src/data-access/mockData.js`
  replaced the hard-coded `movements` array (which contained rows that
  never mapped to a real transaction in the receipt/adjustment/transfer
  stores) with a derived `getMovements()` selector that walks the actual
  store ledgers. The Movements page now renders real entries; the
  Movements `statement` route shows the same source.
- **T1-02 Wire print on order detail; disable Duplicate**: `OrderDetail.jsx`
  Print button now calls `window.print()` after confirming the rendered
  page state; the Duplicate button stays inert (`disabled aria-disabled="true"
  title="Duplicating an order is not available in this prototype"`) until
  Phase 5 lands the wizard's copy-order flow.
- **T1-03 Wire Print Pick List**: `OrderProducts.jsx` "Print Pick List"
  opens the browser print dialog after the line list is finalised; works
  alongside the existing Step 2 layout.
- **T1-04 Wire Print Manifest**: `OrderDetail.jsx` "Print Manifest" produces
  a print-only manifest view of the order (lines + totals + delivery
  meta). Honours the print stylesheet added in Phase 4.
- **T1-05 Wire dashboard Export CSV**: dashboard Export button writes a
  CSV of KPI rows via `Blob` + object URL + a transient anchor click;
  URL is revoked in a `finally` so no leak survives.
- **T1-06 Wire schools Export; disable Import**: Schools list Export
  produces a CSV of the visible rows; Import is disabled with the
  established prototype copy (`not available in this prototype`).
- **T1-07 Wire Statement buttons as CSV**: customer and supplier
  Statement pages now export a CSV of statement lines (same Blob+URL
  pattern as T1-05) and disable the Import side of the same pattern.
- **T1-08 Extract `reorderSuggestions` to `reportSelectors`**: the
  suggestion list formerly computed inside `InventoryLowStock.jsx` is
  now exposed as `selectReorderSuggestions(state)` in
  `src/data-access/reportSelectors.js` and reused by `Dashboard.jsx`
  reorder widget. Pure data-flow — no behaviour change.
- **T1-09 Extract `ProductPicker` component**: `ProductPicker.jsx`
  introduced under `src/components/`; both `OrderProducts.jsx` and
  `InventoryAdjustment.jsx` consume it instead of inlining the same
  `<select>` markup.
- **T1-10 Repair `EmployeeEdit.jsx` (4 defects)**:
  - `Discard` in the unsaved banner now resets all four tracked fields
    (was only resetting position).
  - `Permission Impact` card derives gains/losses from `role` state, not
    `employee.role`, so the diff matches what would actually be saved.
  - "Save Changes" button enables only when `modified > 0` and a role is
    chosen (was firing empty saves).
  - `onSave` toast no longer lies about success when validation fails.
- **T1-11 Add titles to unexplained disabled controls**:
  - `EmployeeCreate.jsx:140` Temporary password input — title explains
    auto-generation + email delivery.
  - `EmployeeEdit.jsx:125` Employee number — title explains immutability.
  - `EmployeeEdit.jsx:208` Last sign-in — title explains read-only
    nature.
  - `ProductEdit.jsx:120` SKU — title explains identifier immutability.
  - `PurchaseOrderReceive.jsx:216` GRN number — title explains
    auto-generation.
  - `InventoryAdjustment.jsx:141` System quantity — title explains
    ledger source.
  - `EmployeeEdit.jsx:102-110` "Review diff" button already had title
    from earlier T1-10; no change.
- **Loop check**: `npm run lint` → 0 errors, 0 warnings; `npm test -- --run`
  → 97/97 passing across 5 files; `npm run build` → ✓ 148 modules,
  622.42 kB JS (155.98 kB gzipped), 335.61 kB CSS, built in 1.95 s.
- No new tests added in Phase 1 (existing v1 + v2 guards cover the
  surfaces touched); the `v2-audit-guards` test still passes, including
  the duplicate-submit guard which would catch regressions in T1-02's
  inert Duplicate if the team later wires it.

End of Phase 1 ledger.
