/**
 * ImageImportField — Phase 2 reusable image-import primitive.
 *
 * Per docs/CLIENT_IMAGE_STORAGE.md and FRONTEND_PHASE_LEDGER.md:
 *   - Browse + drag/drop.
 *   - Accept PNG, JPEG, WebP only.
 *   - Profile max 2 MB / 512 px long edge; product max 5 MB / 1600 px long edge.
 *   - Inline validation errors; no silent rejections.
 *   - Staged pipeline: Select → Validate → Downscale → Persist (IDB) → Preview.
 *   - Never persist a Blob URL. The persisted reference is an asset `id`
 *     (a crypto.randomUUID()), and only the *parent* receives it via
 *     onCommit(assetId, meta). The transient local preview here uses a
 *     revoked-safe Object URL in component state only.
 *   - Replace removes the previously-committed asset from IDB.
 *   - Cancel during/after selection drops the staged asset.
 *
 * Props:
 *   - kind: 'profile' | 'product'  (drives size cap + downscale target)
 *   - currentAssetId: string | null | undefined  (the committed asset id)
 *   - onCommit(assetId, meta) — fires on successful stage-4 persist.
 *   - onRemove() — fires after the previous asset is deleted (replace or remove).
 *   - label, helpText — copy overrides
 *   - shape: 'square' | 'wide'  (visual hint for the preview surface)
 *   - maxSizeMb — optional override (rare; otherwise driven by kind)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { imageAssetStore } from '../data-access/imageAssetStore.js';
import { imageValidate, assertMagic, assertDimensions } from '../lib/imageValidate.js';
import { imageDownscale } from '../lib/imageDownscale.js';

const STAGES = Object.freeze({
  IDLE: 'idle',
  VALIDATING: 'validating',
  DOWNSCALING: 'downscaling',
  PERSISTING: 'persisting',
  READY: 'ready',
  ERROR: 'error',
});

const KIND_LIMITS = {
  profile: { maxBytes: 2 * 1024 * 1024, mb: 2 },
  product: { maxBytes: 5 * 1024 * 1024, mb: 5 },
};

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `ia-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function ImageImportField({
  kind = 'product',
  currentAssetId = null,
  onCommit,
  onRemove,
  label = 'Image',
  helpText,
  shape = 'square',
  maxSizeMb,
  ownerId = '',
}) {
  const [stage, setStage] = useState(STAGES.IDLE);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [stagedAssetId, setStagedAssetId] = useState(null);
  const [committedAssetId, setCommittedAssetId] = useState(currentAssetId);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const objectUrlRef = useRef(null);

  // Re-mirror committedAssetId when the parent updates currentAssetId
  // (e.g., after Cancel or after parent save restores a prior image).
  useEffect(() => {
    setCommittedAssetId(currentAssetId || null);
  }, [currentAssetId]);

  // Revoke any local preview URL when it changes or on unmount.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const setLocalPreview = useCallback((blob) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    setPreviewUrl(url);
  }, []);

  const reset = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl(null);
    setStagedAssetId(null);
    setStage(STAGES.IDLE);
    setError(null);
  }, []);

  const deleteAssetSafe = useCallback(async (id) => {
    if (!id) return;
    try {
      await imageAssetStore.delete(id);
    } catch {
      /* best-effort; ignore IDB failures during cleanup */
    }
  }, []);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setError(null);

      // Stage 1: synchronous rules (MIME + size + empty)
      const validation = imageValidate(file, kind);
      if (!validation.ok) {
        setError(validation.message);
        setStage(STAGES.ERROR);
        return;
      }

      setStage(STAGES.VALIDATING);

      // Stage 1b: magic-byte sanity (async)
      const magicErr = await assertMagic(file);
      if (magicErr) {
        setError(magicErr);
        setStage(STAGES.ERROR);
        return;
      }

      // Stage 1c: dimension cap (async)
      const dimErr = await assertDimensions(file, kind);
      if (dimErr) {
        setError(dimErr);
        setStage(STAGES.ERROR);
        return;
      }

      setStage(STAGES.DOWNSCALING);

      let downscaled;
      try {
        downscaled = await imageDownscale(file, kind);
      } catch (err) {
        setError(
          err && err.message
            ? `Couldn't process that image. ${err.message}`
            : "Couldn't process that image."
        );
        setStage(STAGES.ERROR);
        return;
      }

      // Show local preview using the downscaled blob BEFORE we commit
      // (so the user sees something instant even on slow IDB).
      setLocalPreview(downscaled.blob);

      setStage(STAGES.PERSISTING);

      const newAssetId = newId();
      const record = {
        id: newAssetId,
        kind,
        mime: downscaled.mime,
        bytes: downscaled.blob,
        width: downscaled.width,
        height: downscaled.height,
        createdAt: new Date().toISOString(),
        meta: { ownerId: ownerId || undefined },
      };

      try {
        await imageAssetStore.put(record);
      } catch (err) {
        setError(
          'Image storage is not available in this browser mode. Try a normal window.'
        );
        setStage(STAGES.ERROR);
        // Drop the local preview since we have nothing committed.
        reset();
        return;
      }

      setStagedAssetId(newAssetId);
      setCommittedAssetId(newAssetId);
      setStage(STAGES.READY);

      // If a previous asset existed, delete it (orphan cleanup).
      if (currentAssetId && currentAssetId !== newAssetId) {
        deleteAssetSafe(currentAssetId);
      }

      // Hand the new id to the parent.
      if (typeof onCommit === 'function') {
        onCommit(newAssetId, {
          width: downscaled.width,
          height: downscaled.height,
          mime: downscaled.mime,
        });
      }
    },
    [kind, currentAssetId, ownerId, onCommit, setLocalPreview, deleteAssetSafe, reset]
  );

  const onInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleFile(file);
    // Reset the input so the same file can be re-picked after a cancel.
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const onPickClick = () => inputRef.current?.click();

  const handleRemove = () => {
    // Drop the staged asset if one is staged but not yet committed by parent.
    if (stagedAssetId && stagedAssetId !== committedAssetId) {
      deleteAssetSafe(stagedAssetId);
    }
    // Drop the currently-committed asset.
    if (committedAssetId) {
      deleteAssetSafe(committedAssetId);
    }
    if (typeof onRemove === 'function') onRemove();
    setCommittedAssetId(null);
    reset();
  };

  const handleCancel = () => {
    if (stagedAssetId && stagedAssetId !== committedAssetId) {
      deleteAssetSafe(stagedAssetId);
    }
    reset();
  };

  const limitMb = maxSizeMb || KIND_LIMITS[kind]?.mb || 5;
  const helperCopy =
    helpText ||
    (kind === 'profile'
      ? `PNG, JPEG, or WebP · up to ${limitMb} MB · stored in this browser.`
      : `PNG, JPEG, or WebP · up to ${limitMb} MB · stored in this browser.`);

  const busy = stage === STAGES.VALIDATING || stage === STAGES.DOWNSCALING || stage === STAGES.PERSISTING;
  const hasImage = Boolean(previewUrl) || Boolean(committedAssetId);

  return (
    <div className="image-import-field">
      <div className="image-import-label">
        <strong>{label}</strong>
        <div className="small-note">{helperCopy}</div>
      </div>
      <div
        className={`image-import-dropzone ${shape} ${dragOver ? 'drag-over' : ''} ${hasImage ? 'has-image' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {previewUrl ? (
          // Local staged preview (Blob URL, revoked on unmount/replace).
          <img src={previewUrl} alt="" className="image-import-preview" />
        ) : (
          <div className="image-import-empty">
            <i className="bi bi-image" aria-hidden="true"></i>
            <div>
              <strong>{kind === 'profile' ? 'Import photo from device' : 'Import image from device'}</strong>
              <div className="small-note">PNG, JPEG, or WebP · up to {limitMb} MB</div>
            </div>
          </div>
        )}
        {busy && (
          <div className="image-import-busy" aria-live="polite">
            <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
            {stage === STAGES.VALIDATING && 'Validating…'}
            {stage === STAGES.DOWNSCALING && 'Downscaling…'}
            {stage === STAGES.PERSISTING && 'Saving to this browser…'}
          </div>
        )}
      </div>

      {error && (
        <div className="image-import-error small text-danger-app mt-2" role="alert">
          <i className="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="visually-hidden"
        onChange={onInputChange}
        aria-label={`${label} file input`}
      />

      <div className="d-flex flex-wrap gap-2 mt-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-app"
          onClick={onPickClick}
          disabled={busy}
        >
          <i className="bi bi-upload me-1" aria-hidden="true"></i>
          {hasImage ? 'Replace' : 'Import from device'}
        </button>
        {hasImage && (
          <>
            <button
              type="button"
              className="btn btn-sm btn-outline-app"
              onClick={handleCancel}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger-app"
              onClick={handleRemove}
              disabled={busy}
            >
              <i className="bi bi-trash me-1" aria-hidden="true"></i>
              Remove
            </button>
          </>
        )}
      </div>

      <div className="image-import-storage-note small-note mt-2">
        <i className="bi bi-shield-lock me-1" aria-hidden="true"></i>
        Stored in this browser. Nothing is uploaded.
      </div>
    </div>
  );
}
