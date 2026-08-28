/**
 * Image downscale — Phase 2 of FRONTEND_PHASE_LEDGER.md.
 *
 * Implements docs/CLIENT_IMAGE_STORAGE.md §5 rules:
 *   - Long-edge cap: profile 512 px, product 1600 px.
 *   - Only downscale, never upscale.
 *   - Output format mirrors input (PNG → PNG, JPEG → JPEG, WebP → WebP).
 *   - JPEG / WebP encoded at quality 0.85.
 *
 * Returns { blob, width, height, mime } where the dimensions are the
 * post-downscale values. The pipeline is run entirely off-screen via a
 * detached canvas so the result never taints a visible surface.
 */

const CAPS = {
  profile: 512,
  product: 1600,
};

/**
 * Compute the target dimensions for a downscale. Long edge becomes `cap`,
 * the short edge scales proportionally. If the source is already smaller,
 * the source dimensions are returned unchanged (never upscale).
 *
 * @param {number} srcW
 * @param {number} srcH
 * @param {number} cap
 * @returns {{ width: number, height: number }}
 */
function computeTarget(srcW, srcH, cap) {
  const long = Math.max(srcW, srcH);
  if (long <= cap) {
    return { width: srcW, height: srcH };
  }
  const scale = cap / long;
  // Round to nearest integer; clamp to at least 1 to avoid 0×0 outputs
  // from sub-pixel rounding on bizarre aspect ratios.
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  return { width: w, height: h };
}

/**
 * Decode an arbitrary image file into an HTMLImageElement we can paint
 * onto a canvas. The image is created with createElement but never
 * inserted into the DOM, so we don't trigger layout / paint work.
 */
function decode(file) {
  return new Promise((resolve, reject) => {
    if (typeof Image === 'undefined') {
      reject(new Error('Image is not available in this environment.'));
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't decode the image."));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Encode a canvas as a Blob of the given MIME.
 */
function encode(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== 'function') {
      reject(new Error('Canvas toBlob is not available in this environment.'));
      return;
    }
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Could not encode the downscaled image.'));
      },
      mime,
      quality
    );
  });
}

/**
 * Downscale an image File / Blob for the given kind.
 *
 * @param {File|Blob} file
 * @param {'profile'|'product'} kind
 * @returns {Promise<{ blob: Blob, width: number, height: number, mime: string }>}
 */
export async function imageDownscale(file, kind = 'profile') {
  const cap = CAPS[kind] || CAPS.profile;
  const mime = file.type || 'image/png';

  // Quality applies only to formats that support it. PNG is lossless and
  // ignores the quality argument, which is harmless.
  const quality = mime === 'image/png' ? undefined : 0.85;

  const img = await decode(file);
  const { width, height } = computeTarget(img.naturalWidth, img.naturalHeight, cap);

  // Off-screen canvas — never inserted into the document, never tainted
  // because we painted from an object URL we control.
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    URL.revokeObjectURL(img.src);
    throw new Error('Canvas 2D context is not available.');
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(img.src);

  const blob = await encode(canvas, mime, quality);
  return { blob, width, height, mime };
}
