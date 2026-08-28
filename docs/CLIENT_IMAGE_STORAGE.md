# Client Image Storage — Contract

**Purpose:** define how imported images live in the user's browser for the Lazy Pygmy Inventory Suite frontend.
**Authoritative scope:** profile photos and product images uploaded through the new `ImageImportField` (Phase 2) and consumed by `ImagePreviewThumb` (Phase 2), `/profile` (Phase 3), product surfaces (Phase 6), and the wizard (Phase 5).
**Repo:** `D:\Node Projects\Lazy Pygmy\react-app`
**Date opened:** 2026-08-20

This contract is the *reference* for the implementation. It is written before the code so that the contract and the test fixtures agree on day one.

---

## 1. Why a new contract

The original product create and edit pages used a vanilla `<input type="file" accept="image/png,image/jpeg" />` with a native `img#imagePreview` (verified in `src/routes/products/ProductCreate.jsx` and `src/routes/products/ProductEdit.jsx`). That pattern:

- only renders PNG and JPEG;
- never persists the file;
- does not enforce a size cap;
- has no downscale step, so a 12-megapixel camera image is loaded straight into the DOM;
- relies on DOM `id`s like `imagePreview` and `productImage` rather than React state.

This contract replaces that pattern with an explicit lifecycle that is local to the user's browser and never reaches a server.

---

## 2. Non-negotiable rules (from master prompt)

These come from the master prompt verbatim and are restated here so the contract is self-contained:

1. **No backend** — image bytes never leave the browser.
2. **No data URLs in persisted storage.** `data:image/...;base64,...` strings must not appear in `localStorage`, in any React state that is ever serialized, or in any IDB record field.
3. **No `URL.createObjectURL()` URLs in persisted storage.** They are session-scoped.
4. **No fake "upload" language.** Copy reads "Import from device" (in the import control) and "Stored in this browser." (in the storage disclosure).
5. **No MIME snobbery that fails closed.** MIME validation runs against the file's `type` first and against magic bytes as a sanity check.
6. **No dangling assets.** When a product image is replaced, the previous asset record is deleted from IDB.

---

## 3. Storage substrate

### 3.1 IndexedDB — primary store for image bytes

- **Database:** `lazy-pygmy-assets`
- **Version:** `1`
- **Object store:** `assets`
- **Key path:** `id` (a `crypto.randomUUID()` value, scoped to the user's browser)
- **Indexes:** none in v1 (full table scans are fine for the volumes this product sees)
- **Schema (per record):**

```jsonc
{
  "id": "f3b1c7e2-9a4d-4d2a-b6e3-1d8a6c5e7b9a",
  "kind": "profile" | "product",
  "mime": "image/png" | "image/jpeg" | "image/webp",
  "bytes": "Blob",          // the actual file bytes
  "width": 1024,             // post-downscale natural width
  "height": 768,             // post-downscale natural height
  "createdAt": "2026-08-20T12:00:00.000Z",
  "meta": {
    "ownerId": "moses.kollie@lazypygmy.lr" | "SKU-BK-0142"
  }
}
```

### 3.2 `localStorage` — only the reference

`localStorageStore` keys everything on `lp_`. Image-consuming features store only the asset id:

- `lp_userProfile.photoAssetId` (added in v1 of the profile contract)
- `lp_products.<sku>.imageAssetId` (added to each product record at the same key as the other product fields)

No key holds bytes or URLs. A grep of `localStorage` for `data:image`, `blob:`, or base64 strings must return zero results.

### 3.3 React state — short-lived Blob URLs

`<ImagePreviewThumb>` calls `URL.createObjectURL(assetRecord.bytes)` and stores the resulting URL in local React state. The thumbnail:

- revokes the URL on unmount (`URL.revokeObjectURL(...)`)
- revokes and replaces the URL when the asset id changes
- never writes the URL anywhere except the `src` attribute on an `<img>`

---

## 4. Validation rules (enforced at import time)

`src/lib/imageValidate.js` runs these checks before any byte is downscaled or persisted. Failure renders inline; no exception is thrown across the boundary.

| Check | Profile photo | Product image | Reason |
| ----- | ------------- | ------------- | ------ |
| MIME (allowlist) | PNG, JPEG, WebP | PNG, JPEG, WebP | per master-prompt; SVG excluded to avoid XSS risk in any future embed surface |
| Max bytes (raw) | 2 MB | 5 MB | tuned for the role each image plays |
| Max natural dimension | 4096 × 4096 | 8192 × 8192 | sanity cap; anything larger is suspiciously large |
| Empty file (`size === 0`) | rejected | rejected | friendly message |
| Magic bytes match declared MIME | spot-checked | spot-checked | catch renamed files |

The error surface is a single toast for batches and inline error text on the field for single-file imports.

---

## 5. Downscale rules

Canvas API downscale runs after validation and before persistence. The goal is to keep enough resolution for the role each image plays without ballooning IDB.

| Use | Long edge cap | JPEG/WebP quality | Notes |
| --- | -------------- | ----------------- | ----- |
| Profile photo | **512 px** | 0.85 | displayed at ≤ 96 px in the topbar avatar, ≤ 240 px on `/profile`; 512 leaves headroom for high-DPI screens |
| Product image | **1600 px** | 0.85 | displayed at ≤ 240 px in catalogue rows, ≤ 480 px on detail; 1600 leaves headroom for the future lightbox |

`imageDownscale.js` returns a `Blob` and the resulting natural width/height so callers can stash those in the IDB record.

---

## 6. Lifecycle (staged)

The `ImageImportField` runs a five-stage pipeline:

1. **Select** — file picked via `<input type="file">` or drag-and-drop. Empty / multiple / wrong MIME are rejected here.
2. **Validate** — `imageValidate.js` returns `{ok: true, file}` or `{ok: false, message}`. Failure shows inline.
3. **Downscale** — `imageDownscale.js` returns a new `Blob` with the configured cap.
4. **Persist** — `imageAssetStore.put({...})` writes the record to IDB and returns `{id}`. The id is what `localStorage` references.
5. **Preview** — the parent `<ImagePreviewThumb>` opens the record and renders a revoked-safe Object URL.

Stage transitions are reflected in the field's UI: a small per-stage indicator (e.g., "Validating…" → "Downscaling…" → "Stored in this browser."). Cancellation during any stage drops the intermediate blob.

---

## 7. Orphan cleanup

When a record's *reference* is removed, the asset should also go:

- **Product image replaced** — at save time, compare `previousId !== nextId`; if both exist, `imageAssetStore.delete(previousId)`.
- **Profile photo removed** — `useUserProfile().setPhoto(null)` calls `imageAssetStore.delete(currentPhotoAssetId)` before clearing its reference.
- **Settings · Clear All** — the wipe route also calls `imageAssetStore.clear()` (Phase 4 will decide whether this is auto or opted-in; the contract requires at least an opt-in).
- **Account deleted** — `signOut()` does not delete assets because the user may sign back in; only an explicit "remove photo" or product image replacement removes them.

A nightly or on-load `prune()` step (in Phase 7 or 8) can sweep IDs that exist in IDB but have no reference in `localStorage`. This is a safety net, not the primary mechanism.

---

## 8. Failure modes

| Failure | Behaviour |
| ------- | --------- |
| IndexedDB blocked (Safari private mode on older versions) | Field shows: "Image storage is not available in this browser mode. Try a normal window." No crash; product can still be saved without an image. |
| Quota exceeded | Field shows: "Browser storage for images is full. Remove an existing image and retry." The transient blob is revoked. |
| MIME / size violation | Field shows the precise rule ("Profile photo must be PNG, JPEG, or WebP, up to 2 MB.") inline; no downscale is attempted. |
| Network offline | N/A — this is a fully local pipeline. Nothing changes offline. |

---

## 9. Privacy + security

- Image bytes never leave the browser (no `fetch`, no `XHR`, no `navigator.sendBeacon`).
- No EXIF stripping is performed in this contract; if a future requirement strips EXIF on profile photos specifically, it lives in `imageValidate.js` as an opt-in branch.
- No image is rendered into a `<canvas>` other than the downscale step, which keeps `tainted` canvases off-screen.
- No `URL.createObjectURL` URL is ever persisted.

---

## 10. Test fixtures (Phase 2 deliverable)

A new `tests/image-lifecycle.test.js` covers:

- `imageValidate.js` — all "accept" cases (1 per allowed MIME), all "reject" cases (wrong MIME, oversized profile, oversized product, exactly-at-limit, corrupt file, empty file, renamed-extension-but-wrong-magic)
- `imageDownscale.js` — a real PNG fixture scaled down; verify resulting dimensions and Blob size is ≤ the cap
- `imageAssetStore.js` — a fake-indexeddb run that covers `put`, `get`, `delete`, `clear`, and `prune`

Suites are written before implementation in Phase 2 per the working agreement in `FRONTEND_PHASE_LEDGER.md` §5.

---

## 11. Open questions (carried forward)

| # | Question | Default in this contract | Owner |
| - | -------- | ------------------------ | ----- |
| Q-1 | Should profile photo MIME allow SVG (with the XSS caveat) or stay raster-only? | raster-only (PNG/JPEG/WebP) | Phase 2 |
| Q-2 | Should "Clear All" wipe IDB too (depth-2 wipe) or keep? | opt-in via Settings · Storage | Phase 4 |
| Q-3 | How often does `prune()` run? | on app boot (cheap: ≤ a few hundred records in v1) | Phase 8 |

---

## 12. Reference files (written as phases land)

- `src/data-access/imageAssetStore.js` — IDB adapter (Phase 1)
- `src/data-access/useImageAsset.js` — hook returning revoked-safe Object URLs (Phase 2)
- `src/lib/imageValidate.js` — validation (Phase 2)
- `src/lib/imageDownscale.js` — Canvas downscale (Phase 2)
- `src/components/ImageImportField.jsx` — staged UI (Phase 2)
- `src/components/ImagePreviewThumb.jsx` — read-only viewer (Phase 2)
- `tests/image-lifecycle.test.js` — fixtures and assertions (Phase 2)

End of contract.
