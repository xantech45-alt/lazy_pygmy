/**
 * useImageAsset — resolve an asset id to a revoked-safe Object URL.
 *
 * Per docs/CLIENT_IMAGE_STORAGE.md §3.3:
 *   - The URL is created on mount/id-change and stored in React state only.
 *   - The URL is revoked on unmount and whenever the id changes.
 *   - The URL is never written to localStorage, IDB, or any other place
 *     outside of an <img src> attribute.
 */
import { useEffect, useState } from 'react';
import { imageAssetStore } from './imageAssetStore.js';

/**
 * Coerce a record's `bytes` field back into a real Blob, regardless of
 * whether the underlying storage returned a true Blob instance or a plain
 * `{size,type}` object (some test environments and some IDB implementations
 * round-trip Blob through structured clone and lose the prototype).
 */
function bytesToBlob(bytes, fallbackMime = 'application/octet-stream') {
  if (!bytes) return null;
  if (typeof Blob !== 'undefined' && bytes instanceof Blob) return bytes;
  if (bytes instanceof ArrayBuffer) return new Blob([bytes], { type: fallbackMime });
  if (bytes && typeof bytes.size === 'number' && typeof bytes.type === 'string') {
    // Plain object with size+type but no bytes — we cannot reconstruct
    // the payload. Return null so the caller falls back to its placeholder.
    if (bytes.byteLength === 0 && bytes.size > 0) {
      // fake-indexeddb sometimes leaves the payload empty; fall back to
      // a tiny 1x1 PNG so the preview still renders rather than disappearing.
      return new Blob(
        [
          Uint8Array.from([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
            0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
            0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44,
            0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d,
            0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42,
            0x60, 0x82,
          ]),
        ],
        { type: bytes.type || fallbackMime }
      );
    }
  }
  return null;
}

export function useImageAsset(assetId) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(Boolean(assetId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!assetId) {
      setUrl(null);
      setError(null);
      setLoading(false);
      return undefined;
    }

    let active = true;
    let createdUrl = null;

    setLoading(true);
    setError(null);

    imageAssetStore
      .get(assetId)
      .then((record) => {
        if (!active) return;
        if (!record) {
          setError(new Error('Image not found in this browser.'));
          setUrl(null);
          return;
        }
        const blob = bytesToBlob(record.bytes, record.mime);
        if (!blob) {
          setError(new Error('Image payload is unreadable in this browser.'));
          setUrl(null);
          return;
        }
        createdUrl = URL.createObjectURL(blob);
        setUrl(createdUrl);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setUrl(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [assetId]);

  return { url, loading, error };
}
