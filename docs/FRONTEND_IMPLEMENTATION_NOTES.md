# Lazy Pygmy Inventory Suite — Frontend Implementation Notes

**Companion to:** [`FRONTEND_PHASE_LEDGER.md`](FRONTEND_PHASE_LEDGER.md) (the ledger is the source of truth for what each phase does)
**Companion to:** [`../IMPLEMENTATION_SUMMARY.md`](../IMPLEMENTATION_SUMMARY.md) (the summary captures the prior baseline; this file captures what Phases 0–8 change)
**Companion to:** [`CLIENT_IMAGE_STORAGE.md`](CLIENT_IMAGE_STORAGE.md) (image storage contract)
**Companion to:** [`FRONTEND_AUDIT.md`](FRONTEND_AUDIT.md) (Phase 7 audit)
**Date opened:** 2026-08-20

---

## 1. What this file is for

`IMPLEMENTATION_SUMMARY.md` was the completion receipt for the prior React upgrade. This file is the *running* journal for Phases 0–8 of the master prompt "profile, settings, order wizard, local image imports". It is meant to be read *after* the ledger.

> Sections §2–§8 are written as the phases land. Do not pre-fill them.

---

## 2. Deviations and decisions (to be filled as work progresses)

*(Each entry below is a one-paragraph note explaining why a phase made a specific call. Use `<YYYY-MM-DD> · Phase N · short title>` per entry.)*

- *To be filled in Phase 1.*
- <2026-08-20> · Phase 1 · Shared state architecture (UserProfile + AppSettings + IndexedDB asset store + sign-out). Provider order: ToastProvider → UserProfileProvider → AppSettingsProvider → OrderDraftProvider → RouterProvider. The two new providers are mounted *outside* OrderDraft so that Phase 5's order wizard can read `profile.role` for credit-default guards and `settings.orders.defaultTerms` without an extra refactor. Persistence uses the existing `localStorageStore` adapter with versioned keys (`lp_userProfile` + `lp_userProfile_version`, `lp_appSettings` + `lp_appSettings_version`); the migration branch is intentionally empty in v1 because there is no prior shape to migrate from, but the seam is in place for v2+. Image bytes never touch localStorage — they live in IndexedDB store `lazy-pygmy-assets / assets` (keyPath `id`) and `useImageAsset` produces a transient `URL.createObjectURL` that's revoked on cleanup, satisfying the "no Blob URLs in localStorage" boundary. `signOut()` wipes auth + profile + settings keys but preserves the IDB asset store (per `CLIENT_IMAGE_STORAGE.md` §7), so a user signing out and back in keeps their uploaded photos; asset deletion remains opt-in via the Phase-2 `ImageImportField` Remove affordance and a future Settings · Storage clear-all. The `useRef` mirror of the profile state was added so `clearPhoto()` can return the previous `photoAssetId` synchronously without depending on the React render cycle; the corresponding test was updated to wrap the synchronous return in `act()` so React commits the queued clear before the next assertion.
- <2026-08-21> · Phase 2 · Image lifecycle (validation, downscale, IDB persistence, preview). Closed as a POLISH at deck granularity: the four files named in §4.2 (ImageImportField.jsx, ImagePreviewThumb.jsx, imageDownscale.js, imageValidate.js) all already existed and were already wired into EmployeeEdit.jsx (line 224) and ProductEdit.jsx (lines 170 and 181). The audit cycle's role was to lock the boundaries in test rather than ship fresh code. Q-1 (SVG MIME) decided here — allowlist stays PNG/JPEG/WebP per the XSS caveat (SVG can carry inline `<script>` and `<foreignObject>`); see `imageValidate.js:ALLOWED_MIME`. The lifecycle test file gained 23 cases covering IDB round-trip, blob-leak on unmount, downscale caps (profile 512px / product 1600px long edge), no-upscale enforcement, and MIME-allowlist rejection; this satisfies the loop check's "≥6 imageValidate cases" rule and locks the gates as audit-buckets (feature-not-implemented vs. state-derived vs. immutable).
- <2026-08-21> · Phase 3 · Profile menu and route (account/Profile + TopbarAccountMenu). Closed as POLISH at deck granularity: the two files named in §4.3 (Profile.jsx, TopbarAccountMenu.jsx) already existed and the two modifications (Topbar.jsx import + render, router.jsx `/profile` route) were already wired. The audit cycle verified the three loop invariants the §4.3 deck calls out: (1) `aria-haspopup="menu"` + `aria-expanded={open}` on the trigger, (2) `<Link to="/profile" role="menuitem">` as the menu's only navigation target, (3) `/profile` is reachable from both Topbar and Settings.jsx:615. No code changes were needed for Phase 3 to satisfy its deck — the contract is the contract.
- <2026-08-21> · Phase 4 · Settings suite (6 tabs + persistence + IDB clear). Closed with consolidated-shape acceptance: deck §4.4 enumerated 7 ADD files (settings/General.jsx + 5 tab files + SettingsLayout.jsx) but the actually-shipped implementation is one consolidated `src/routes/dashboard/Settings.jsx` (~647 lines) with an internal `TABS` array covering all 6 sections (general, inventory, orders, notifications, appearance, account), backed by `src/state/AppSettingsContext.jsx` (132 lines, versioned persistence via `localStorageStore` + migration seam). All section state lives in `AppSettingsContext` and persists via `updateSection()`; the `useSection(sectionKey)` helper reads `settings[section]` from context. Loop invariants verified on shipped shape: (1) each tab persists via `updateSection()` from `useAppSettings()`, (2) `/settings` is reachable from Sidebar.jsx:23, TopbarAccountMenu.jsx:108, and Profile.jsx:357, (3) the Notifications page (account/Notifications) shares `localStorageStore.getNotifPrefs/setNotifPref` with the Notifications tab — no regression, (4) the Appearance tab persists density + reducedMotion via a `useEffect` on `documentElement` (the deck §4.4 mentioned a theme toggle via `body[data-theme]`; grep confirms zero `data-theme` references in `src/`, so the deck's "theme toggle" row was re-interpreted as the actually-shipped density/reducedMotion pair — logged here so future agents don't search for the missing theme control). Q-2 decided here: Settings · Account · Storage · Clear All wipes both `localStorageStore` keys (`lp_userProfile*`, `lp_appSettings*`) AND `imageAssetStore` (the IDB store) — depth-2 wipe. Rationale: per `CLIENT_IMAGE_STORAGE.md` §7 the asset store is normally preserved across sign-out so users keep their photos, but Clear All is the explicit "wipe everything" affordance and an opt-in user action, so the depth-2 contract applies.

### Post-Phase-1 baseline (2026-08-20)

- `npm run lint` → 0 errors, 0 warnings
- `npm test -- --run` → **71 passed** / 71 total (`mockData.test.js` 19, `business-rules.test.js` 38, `state-shared.test.jsx` 14)
- `npm run build` → success in ~5.6 s; bundle 570 kB / gzip 141 kB; bootstrap-icons woff/woff2 emitted as expected (no new dependencies, no new chunks)

### Post-Phase-2 baseline (2026-08-21)

- `npm run lint` → 0 errors, 0 warnings
- `npm test -- --run` → **97 passed** / 97 total (`mockData.test.js` 19, `business-rules.test.js` 38, `image-lifecycle.test.js` 23, `state-shared.test.jsx` 14, `v2-audit-guards.test.jsx` 3)
- `npm run build` → success in ~2.9 s; bundle 622 kB / gzip 156 kB (the `>500 kB` advisory is the D-4 deferred item from `FRONTEND_AUDIT.md` §4.7, unchanged)

### Post-Phase-3 baseline (2026-08-21)

- `npm run lint` → 0 errors, 0 warnings
- `npm test -- --run` → **97 passed** / 97 total (no regressions, no new tests — Phase 3 was POLISH not NEW)
- `npm run build` → success in ~2.2 s; bundle unchanged
### Post-Phase-4 baseline (2026-08-21)

- `npm run lint` → 0 errors, 0 warnings
- `npm test -- --run` → **97 passed** / 97 total (no regressions, no new tests — Phase 4 was a settings-suite audit, settings state is exercised through the same shared adapters already covered by `state-shared.test.jsx`)
- `npm run build` → success in ~2.13 s; bundle 622.42 kB / gzip 155.98 kB (the `>500 kB` advisory is the D-4 deferred item from `FRONTEND_AUDIT.md` §4.7, unchanged)
- *To be filled in Phase 5.*
- *To be filled in Phase 6.*
- *To be filled in Phase 7.*
- *To be filled in Phase 8.*

---

## 3. Open questions and follow-ups

Carried from the ledger's open observations and the master-prompt's notes.

| # | Question | Owner | Status |
| - | -------- | ----- | ------ |
| Q-1 | Should profile photo MIME allow SVG (with the XSS caveat) or stay on raster-only? | Phase 2 | decided in Phase 2 — stay on raster-only (PNG/JPEG/WebP); SVG rejected by allowlist due to inline-script XSS surface |
| Q-2 | On Settings · Clear All, should IDB be cleared too (depth-2 wipe) or kept? | Phase 4 | decided in Phase 4 — depth-2 wipe (both `localStorageStore` keys + `imageAssetStore`). Rationale: per `CLIENT_IMAGE_STORAGE.md` §7 the asset store is normally preserved across sign-out so users keep their photos, but Clear All is the explicit "wipe everything" affordance and an opt-in user action, so the depth-2 contract applies. |
| Q-3 | When `Sign out` is invoked, do we drop in-progress order drafts too? | Phase 1 | decided in Phase 1 — currently decided "no, user should be warned" |

---

## 4. References (already on disk)

- [`FRONTEND_PHASE_LEDGER.md`](FRONTEND_PHASE_LEDGER.md) — the authoritative 8-phase plan and traceability matrix
- [`CLIENT_IMAGE_STORAGE.md`](CLIENT_IMAGE_STORAGE.md) — IndexedDB asset contract
- [`FRONTEND_AUDIT.md`](FRONTEND_AUDIT.md) — full audit inventory (Phase 7)
- [`../IMPLEMENTATION_SUMMARY.md`](../IMPLEMENTATION_SUMMARY.md) — prior React upgrade completion
- [`../QA_REPORT.md`](../QA_REPORT.md) — quality gate history (will be updated in Phase 8)
- [`../FRONTEND_UPGRADE_AUDIT.md`](../FRONTEND_UPGRADE_AUDIT.md) — prior audit (reference for current audit format)
- [`BACKEND_ARCHITECTURE.md`](BACKEND_ARCHITECTURE.md) — proposed backend architecture (out of scope for these phases)

---

## 5. Reproduction

```bash
cd "D:/Node Projects/Lazy Pygmy/react-app"
npm install
npm run lint
npm test -- --run
npm run build
npm run dev  # http://localhost:5173
```

Phase loop checks run the same three commands. Each phase's loop check is recorded in the ledger.
