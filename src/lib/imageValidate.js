/**
 * Image validator — Phase 2 of FRONTEND_PHASE_LEDGER.md.
 *
 * Implements docs/CLIENT_IMAGE_STORAGE.md §4 rules:
 *   - MIME allowlist: PNG / JPEG / WebP only (raster).
 *   - Raw size caps: profile 2 MB, product 5 MB.
 *   - Dimension caps: profile 4096², product 8192².
 *   - Empty file → reject.
 *   - Magic-byte sanity check vs declared MIME.
 *
 * Returns { ok: true, file } or { ok: false, message }. Never throws —
 * callers (ImageImportField) translate the message into user copy.
 *
 * NOTE: per the contract, dimension probing uses `createImageBitmap` (a
 * browser-native API) so this module is meant to run in real browsers,
 * not in node. Tests in `tests/image-lifecycle.test.js` exercise the
 * non-dimension rules (MIME, size, magic, empty) and stub the canvas
 * path for the dimension cases.
 */

const RULES = {
  profile: {
    maxBytes: 2 * 1024 * 1024,
    maxDimension: 4096,
  },
  product: {
    maxBytes: 5 * 1024 * 1024,
    maxDimension: 8192,
  },
};

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);

// Magic-byte prefixes used as a sanity check against the declared MIME.
const MAGIC_CHECKS = [
  {
    mime: 'image/png',
    test: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    mime: 'image/jpeg',
    test: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: 'image/webp',
    test: (b) => {
      if (b.length < 12) return false;
      // "RIFF" .... "WEBP"
      const riff = b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46;
      const webp =
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
      return riff && webp;
    },
  },
];

function copyShape(file) {
  // Wrap file so object identity is preserved; consumer code may rely on it.
  return { ok: true, file };
}

/**
 * Validate a File / Blob against the rules for a given kind.
 *
 * @param {File|Blob} file
 * @param {'profile'|'product'} kind
 * @returns {{ ok: boolean, file?: File|Blob, message?: string }}
 */
export function imageValidate(file, kind = 'profile') {
  const rule = RULES[kind] || RULES.profile;

  // Empty-file check (PNG transparency can sometimes strip metadata, so
  // we rely on the actual byte length).
  if (!file || (typeof file.size === 'number' && file.size === 0)) {
    return { ok: false, message: 'That image is empty. Pick another file.' };
  }

  // MIME allowlist.
  const mime = file.type || '';
  if (!ALLOWED_MIME.has(mime)) {
    return {
      ok: false,
      message: 'Only PNG, JPEG, or WebP images are supported.',
    };
  }

  // Size cap.
  if (typeof file.size === 'number' && file.size > rule.maxBytes) {
    const mb = Math.round(rule.maxBytes / (1024 * 1024));
    return {
      ok: false,
      message: `Image is too large. Limit is ${mb} MB for ${
        kind === 'profile' ? 'profile photos' : 'product images'
      }.`,
    };
  }

  // Magic-byte sanity check is intentionally NOT run here — it's async
  // and called separately by the staged ImageImportField component.
  // See assertMagic() below.

  return copyShape(file);
}

/**
 * Async companion to imageValidate — verifies the file's magic bytes
 * match its declared MIME. Returns null if OK, or a friendly message
 * if it doesn't.
 *
 * ImageImportField should call this during the "Validate" stage so it
 * has an await point to surface to the user.
 *
 * Reads via FileReader (a cross-environment API) instead of Blob#arrayBuffer
 * because Blob#slice returns a Blob in modern browsers but jsdom's Blob
 * implementation may not expose arrayBuffer() on a slice in all versions.
 * FileReader is available in jsdom and in every browser we target.
 */
export async function assertMagic(file) {
  if (!file || typeof file.size !== 'number' || file.size === 0) return null;

  const mime = file.type || '';
  const checker = MAGIC_CHECKS.find((m) => m.mime === mime);
  if (!checker) {
    return "That image's file format is not supported.";
  }

  const bytes = await readSliceBytes(file, 0, 12);
  return checker.test(bytes)
    ? null
    : "That image's file format doesn't match its extension.";
}

/**
 * Read the first `n` bytes of a Blob-like object as a Uint8Array.
 * Works in browsers and jsdom (FileReader is universal).
 * Falls back to Blob#arrayBuffer() when available.
 */
async function readSliceBytes(blob, start, end) {
  // Preferred path: native Blob#arrayBuffer (works in modern browsers and
  // recent jsdom releases).
  if (blob && typeof blob.slice === 'function' && typeof blob.arrayBuffer === 'function') {
    try {
      const slice = blob.slice(start, end);
      const buf = await slice.arrayBuffer();
      return new Uint8Array(buf);
    } catch {
      // Fall through to FileReader path below.
    }
  }
  return new Promise((resolve, reject) => {
    if (typeof FileReader === 'undefined') {
      reject(new Error('FileReader is not available in this environment.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const out = new Uint8Array(reader.result || 0);
      resolve(out.slice(start, Math.min(end, out.length)));
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader failed.'));
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Async version of the dimension check. Uses `createImageBitmap` which
 * is available in every browser the app supports (Phase 2 contract §4).
 */
export async function assertDimensions(file, kind = 'profile') {
  const rule = RULES[kind] || RULES.profile;
  if (!file || typeof createImageBitmap !== 'function') return null;
  try {
    const bitmap = await createImageBitmap(file);
    const long = Math.max(bitmap.width, bitmap.height);
    bitmap.close?.();
    if (long > rule.maxDimension) {
      return `Image is ${long}px on the long edge — limit is ${rule.maxDimension}px. Import will be rescaled automatically.`;
    }
    return null;
  } catch {
    return "That image couldn't be read. It may be corrupt.";
  }
}
