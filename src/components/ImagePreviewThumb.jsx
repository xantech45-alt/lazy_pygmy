/**
 * ImagePreviewThumb — read-only image surface that resolves an asset id via
 * `useImageAsset` and revokes the transient Object URL on unmount/id-change.
 *
 * Per docs/CLIENT_IMAGE_STORAGE.md §3.3:
 *   - URL lives in React state only; never persisted.
 *   - URL is revoked on unmount and on id change.
 *   - Falls back to the children/placeholder when the asset is missing or
 *     IDB is unavailable.
 *
 * Props:
 *   - assetId: string | null | undefined
 *   - alt: alt text (defaults to '' when the adjacent context supplies the name)
 *   - shape: 'square' | 'wide' | 'avatar' | 'product'  (drives the CSS class)
 *   - className: extra wrapper classes
 *   - fallback: React node rendered when no asset id / no record / error
 */
import { useEffect, useState } from 'react';
import { imageAssetStore } from '../data-access/imageAssetStore.js';

/**
 * useImageAsset is already provided in src/data-access/useImageAsset.js.
 * Re-import here for a self-contained reader surface.
 */
import { useImageAsset } from '../data-access/useImageAsset.js';

export default function ImagePreviewThumb({
  assetId,
  alt = '',
  shape = 'product',
  className = '',
  fallback = null,
  width,
  height,
}) {
  const { url, loading, error } = useImageAsset(assetId);
  const [missing, setMissing] = useState(false);

  // If useImageAsset set an error, treat it as "missing" once.
  useEffect(() => {
    if (error) setMissing(true);
    if (!error && !assetId) setMissing(false);
  }, [error, assetId]);

  // If the asset id is provided but useImageAsset resolves to null
  // (record gone from IDB, possibly after prune), treat as missing too.
  useEffect(() => {
    if (!loading && assetId && !url) setMissing(true);
  }, [loading, assetId, url]);

  const showFallback = !assetId || missing || (!loading && !url);

  return (
    <div className={`image-preview-thumb image-preview-${shape} ${className}`}>
      {showFallback ? (
        fallback ?? <DefaultFallback shape={shape} />
      ) : (
        <img
          src={url}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="image-preview-img"
        />
      )}
    </div>
  );
}

function DefaultFallback({ shape }) {
  if (shape === 'avatar') {
    return (
      <div className="image-preview-fallback image-preview-fallback-avatar" aria-hidden="true">
        <i className="bi bi-person"></i>
      </div>
    );
  }
  return (
    <div className="image-preview-fallback image-preview-fallback-product" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

/**
 * Helper exported so callers can write
 *   `await imageAssetStore.put({...})` from outside the field.
 * Re-exporting here keeps callers from having to import the store directly.
 */
export { imageAssetStore };
