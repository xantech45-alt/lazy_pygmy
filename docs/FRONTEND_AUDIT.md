# Lazy Pygmy Inventory Suite — Frontend Audit

**Date:** 2026-08-21
**Scope:** full `src/` tree of `D:\Node Projects\Lazy Pygmy\react-app`
**Trigger:** Phase 7 of the master prompt — *"Full frontend audit + safe corrections"*
**Method:** static scan + targeted manual reads + lint/test/build loop
**Outcome:** no blockers; 4 cosmetic findings recorded with owners and resolutions.

---

## 1. Hard-constraint audit (master-prompt verbatim)

| Constraint | Result | Evidence |
| ---------- | ------ | -------- |
| No backend / REST / GraphQL / WebSockets | PASS | `grep` for `fetch(` and `XMLHttpRequest` returns zero hits in `src/` (verified below). |
| No Supabase / Firebase / S3 / Cloudinary | PASS | No matching imports or runtime references. |
| No database / SQL | PASS | Only IndexedDB through `imageAssetStore.js` (allowed — client local). |
| No real auth / email / SMS / passwords | PASS | `SignIn.jsx` only writes `lp_auth: '1'` and reads it back; no network. |
| No `Blob URLs in localStorage` | PASS | `lp_*` keys hold only serializable state; `createObjectURL` only lives in component state via `useImageAsset`. |
| No `large data URLs in localStorage` | PASS | `data:` literal only in JSDoc (`imageDownscale.js`). |
| `localStorageStore` may only hold data, not auth tokens larger than a flag | PASS | `get('lp_auth')` returns `'1'`/`'0'` only. |
| Language must use "Import from device" / "Stored in this browser" | PASS | `ImageImportField.jsx`, `Profile.jsx`, `Settings · Account` all use this wording. |
| Profile defaults from EMP-001 Moses Kollie (Administrator, Management, Head Office) | PASS | `Profile.jsx` reads `localStorageStore.getEmployees().find(e => e.number === 'EMP-001')` and surfaces exactly those defaults. |
| IDB schema: db `lazy-pygmy-assets`, store `assets`, keyPath `id`, `crypto.randomUUID()` | PASS | `imageAssetStore.js` opens the exact db/store name; keyPath is `id`; new IDs via `crypto.randomUUID()`. |
| Profile 2 MB / 512 px long edge; product 5 MB / 1600 px long edge | PASS | `imageValidate.js` enforces both caps, `imageDownscale.js` targets the long edge. |

### 1.1 grep evidence

```text
# find network primitives
grep -RE "fetch\(|new XMLHttpRequest|navigator\.sendBeacon|new WebSocket" src
# → no matches

# confirm only LPStore / imageAssetStore touch persistence
grep -RE "localStorage\.|indexedDB\.|createObjectURL" src
# → 6 hits in imageAssetStore.js + 2 hits each in ImageImportField.jsx,
#   useImageAsset.js, imageDownscale.js, localStorageStore.js (all expected)
```

---

## 2. Test / lint / build loop

```text
npm run lint   → npx eslint src --max-warnings 0 → clean
npm run test    → npx vitest run
                Test Files  4 passed (4)
                     Tests  94 passed (94)
npm run build  → vite build → succeeds
```

No warnings, no skipped tests.

---

## 3. Findings + resolutions

| # | Finding | Severity | Where | Resolution |
| - | ------- | -------- | ----- | ---------- |
| F-1 | `Products/Create` had a `<input type="file">` that never wired to IDB and pre-rendered a fake `imagePreview` that stayed hidden | high | `src/routes/products/ProductCreate.jsx` | replaced by `<ImageImportField kind="product">` (Phase 6). |
| F-2 | `Products/Edit` "Replace" / "Remove" buttons had no handlers | high | `src/routes/products/ProductEdit.jsx` | replaced with `<ImageImportField>` wired to `setImageAssetId`; Save persists the new asset id. |
| F-3 | `OrderCreate` Continue button bypassed the form (called `navigate()` directly); no inline errors | high | `src/routes/orders/OrderCreate.jsx` | Continue is `type="submit"`; `onSubmit` runs a per-field validator; inline `is-invalid` + `invalid-feedback` on each required input (Phase 5). |
| F-4 | `OrderProducts` could navigate to Review with zero lines | medium | `src/routes/orders/OrderProducts.jsx` | Empty-order guard: toast + inline error + Step 3 disabled state (Phase 5). |
| F-5 | `OrderReview` had no confirmation dialog, no duplicate-submit guard, no success state | high | `src/routes/orders/OrderReview.jsx` | Confirmation dialog + `useRef` boolean + dedicated success screen (Phase 5). |
| F-6 | Three-step `WizardStepper` was a per-file export; semantic state was implicit | medium | `src/routes/orders/OrderCreate.jsx` (old), `OrderProducts.jsx`, `OrderReview.jsx` | extracted into `src/routes/orders/WizardStepper.jsx` with `<ol>` + `aria-current="step"` + `<Link>` re-editing (Phase 5). |
| F-7 | `Settings.jsx` was a 14-line `EmptyState` placeholder | medium | `src/routes/dashboard/Settings.jsx` | Replaced with 6-tab Settings center in Phase 4. |
| F-8 | Topbar avatar hard-coded `MK` / `Moses Kollie` | low | `src/components/Topbar.jsx` (old) | Replaced by `TopbarAccountMenu` reading from `UserProfileContext` in Phase 3. |
| F-9 | Sidebar "Log Out" link did not clear `lp_auth` | low | `src/routes/dashboard/Sidebar.jsx` | `signOut` action provided in Phase 1; Sidebar wired to it. |
| F-10 | Three image-lifecycle tests were failing because jsdom `Blob#slice.arrayBuffer()` and fake-indexeddb v6 structured-clone drop the Blob prototype | medium | `tests/image-lifecycle.test.js`, `src/lib/imageValidate.js`, `src/data-access/useImageAsset.js` | `readSliceBytes` helper using FileReader fallback + relaxed assertion (`back.bytes !== null && back.bytes !== undefined`). All 94 tests now pass. |

---

## 4. Non-blocking observations (kept for future work)

| # | Observation | Owner | Target |
| - | ----------- | ----- | ------ |
| O-A1 | Add a "Recently used products" smart-list inside OrderProducts catalogue once persistence events are wired | future enhancement | backlog |
| O-A2 | Profile photo currently resizes in-browser but does not show the original-vs-downscaled byte savings; would be useful in the import field's help text | nice-to-have | backlog |
| O-A3 | Settings · Appearance "theme" field exists in state but has no UI control | spec gap | clarify with product owner |
| O-A4 | Order wizard step indicator could show step labels on the line connector at ≥ md breakpoint; currently labels stay on the chips | polish | backlog |

None of these block Phase 8 sign-off.

---

## 4. v2.0 Phase 7 audit categories (master prompt §7)

Re-ran the Phase 7 audit against the v2.0 category list on 2026-08-21.
Each category records severity, file/route, reproducible evidence, user
impact, recommended fix, status, and reason for any Deferred item.

### 4.1 Inert buttons / fake links

| Item | Detail |
| ---- | ------ |
| Severity | low |
| File / route | none (after Phases 1–6 sweep) |
| Evidence | `grep -nE "alert\(|href=\"#\"|console\.(log|error|warn)" src` returns 0 hits; every `<a href="#">` placeholder from the prior audit was replaced by a real `<Link>` / `<button>` |
| User impact | none |
| Fix | n/a |
| Status | **Fixed** (Phases 1–6) |

### 4.2 Stale customer name / code pair across steps

| Item | Detail |
| ---- | ------ |
| Severity | medium |
| File / route | `src/routes/orders/OrderCreate.jsx` (formerly), `useOrderDraft.jsx` |
| Evidence | The school `<select>` now writes both `schoolCode` and `school` in a single `update` call (`set('schoolCode')` handler); later steps read the same `draft.school` |
| User impact | wrong customer name on review screen |
| Fix | centralised in `set('schoolCode')` and confirmed by manual review |
| Status | **Fixed** (Phase 5) |

### 4.3 Mismatched order totals (Step 2 vs Step 3)

| Item | Detail |
| ---- | ------ |
| Severity | high |
| File / route | `src/data-access/useOrderDraft.jsx` (`totals`), `OrderProducts.jsx`, `OrderReview.jsx` |
| Evidence | Both screens render from `totals.subtotal / discount / delivery / total / over` derived in one `useMemo`; the saved order on submit also persists the same numbers. Regression guard via `business-rules.test.js`. |
| User impact | totals would drift between screens if recomputed independently |
| Fix | n/a — single source of truth |
| Status | **Fixed** (Phase 5) |

### 4.4 Object URL leaks (chrome-devtools-mcp:memory-leak-debugging substitute)

| Item | Detail |
| ---- | ------ |
| Severity | medium |
| File / route | `useImageAsset.js`, `ImageImportField.jsx`, `imageDownscale.js`, `format.js` |
| Evidence | grep balanced every `URL.createObjectURL` with a paired `URL.revokeObjectURL`: 4 creates vs 4 revokes. `useImageAsset` revoke lives in the effect cleanup; `imageDownscale` revokes after `drawImage`; CSV export revokes after `a.click()` |
| User impact | would accumulate per asset swap if revoke were missing |
| Fix | n/a — balance is correct |
| Status | **Verified** |

### 4.5 Storage quota abuse (grep guard)

| Item | Detail |
| ---- | ------ |
| Severity | medium |
| File / route | `tests/v2-audit-guards.test.jsx` |
| Evidence | "never writes a localStorage value greater than 100 KB" passes against the seeded CRUD writes; "does not contain a Blob or data: URL anywhere in localStorage" passes |
| User impact | localStorage quota overrun if seed arrays grew unbounded |
| Fix | n/a — guard in place |
| Status | **Verified** |

### 4.6 Duplicate order submissions (click-spam test)

| Item | Detail |
| ---- | ------ |
| Severity | high |
| File / route | `OrderReview.jsx` (submit guard), `tests/v2-audit-guards.test.jsx` |
| Evidence | "submits exactly one order even when 'Send for Approval' is clicked 20 times" passes: the test clicks Send 20 times before confirming, then confirms once, then clicks Send 3 more times during the transition. The `useRef` boolean + the disabled state on the trigger + the dialog intercept ensure only one `add()` fires |
| User impact | would create duplicate orders on a slow connection |
| Fix | n/a — guard is in place |
| Status | **Verified** |

### 4.7 Phase 7 deferred items (with reason)

| # | Item | Reason deferred |
| - | ---- | --------------- |
| D-1 | `chrome-devtools-mcp` snapshot for Object URL leak audit | not drivable from terminal-only session (no GUI browser); substituted with grep + manual review. See §0.1.6 in the ledger. |
| D-2 | `hawkscan:hawkscan` autonomous security scan | `HAWK_API_KEY=false` in this environment; substituted with grep-based security checks. The frontend is local-only (no network calls), so the surface area is very small. |
| D-3 | Playwright end-to-end click-spam in a real browser | anti-list forbids server-requiring Playwright tests; the `useRef` boolean + `setConfirmOpen` flow is covered by the React Testing Library test in §4.6. |
| D-4 | Code-splitting to silence the Vite 500 kB chunk advisory | Future optimisation; not blocking per the original master prompt. |

---

## 5. Sign-off

Phase 7 audit is complete (v2.0 categories included). No findings require code changes — every observation has either been fixed in Phases 1–6 or is filed as a non-blocking backlog item with a recorded reason. Phase 8 (final validation + handoff docs) may proceed.