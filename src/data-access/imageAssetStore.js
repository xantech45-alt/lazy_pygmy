/**
 * IndexedDB-backed image asset store.
 *
 * Per docs/CLIENT_IMAGE_STORAGE.md:
 *   db:     lazy-pygmy-assets  (version 1)
 *   store:  assets             (keyPath: id, no indexes in v1)
 *   record: { id, kind, mime, bytes, width, height, createdAt, meta }
 *
 * Records hold the image bytes as a Blob. URL.createObjectURL() URLs are
 * never persisted — the localStorage consumers only hold `id` references;
 * consumers render via useImageAsset (src/data-access/useImageAsset.js),
 * which creates + revokes Object URLs in component state.
 */
const DB_NAME = 'lazy-pygmy-assets';
const DB_VERSION = 1;
const STORE_NAME = 'assets';

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available in this environment.'));
  }
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open IndexedDB.'));
    req.onblocked = () => reject(new Error('IndexedDB upgrade blocked by another tab.'));
  });
  return dbPromise;
}

function withStore(mode, fn) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        let result;
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted.'));
        const req = fn(store);
        if (req && 'onsuccess' in req) {
          req.onsuccess = () => {
            result = req.result;
          };
        }
      })
  );
}

export const imageAssetStore = {
  async put(record) {
    if (!record || !record.id) {
      throw new Error('imageAssetStore.put: record.id is required');
    }
    if (!record.bytes) {
      throw new Error('imageAssetStore.put: record.bytes is required');
    }
    await withStore('readwrite', (store) => store.put(record));
    return { id: record.id };
  },

  async get(id) {
    if (!id) return null;
    return withStore('readonly', (store) => store.get(id));
  },

  async delete(id) {
    if (!id) return { deleted: 0 };
    await withStore('readwrite', (store) => store.delete(id));
    return { deleted: 1 };
  },

  async clear() {
    await withStore('readwrite', (store) => store.clear());
    return { cleared: true };
  },

  async list() {
    return withStore('readonly', (store) => store.getAll());
  },

  /**
   * Remove any record whose id is not in `referencedIds`. Used at boot
   * (Phase 8) and after Settings · Storage clear-all to sweep orphans.
   */
  async prune(referencedIds = new Set()) {
    const all = await this.list();
    const orphans = all.filter((rec) => !referencedIds.has(rec.id));
    await Promise.all(orphans.map((rec) => this.delete(rec.id)));
    return { pruned: orphans.length };
  },
};

export const IMAGE_ASSET_DB = Object.freeze({ DB_NAME, DB_VERSION, STORE_NAME });
