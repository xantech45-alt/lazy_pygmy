/**
 * User profile + account context.
 *
 * Per the master prompt and docs/FRONTEND_PHASE_LEDGER.md §4 (Phase 1):
 *   - Local-only; no network, no auth provider.
 *   - Persisted to localStorage under lp_userProfile (data) and
 *     lp_userProfile_version (version). Mirrors the versioned-key pattern
 *     used by the other data-access adapters in the app.
 *   - Photo is referenced by asset id (lp_userProfile.photoAssetId);
 *     the bytes live in IndexedDB via imageAssetStore (Phase 2 reads
 *     the id through useImageAsset).
 *
 * v1 shape: see DEFAULT_PROFILE. Future versions must add a `migrate()`
 * branch that maps previous shapes onto the current one.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { localStorageStore } from '../data-access/localStorageStore.js';

export const PROFILE_VERSION = 1;
const PROFILE_KEY = 'userProfile';
const PROFILE_VERSION_KEY = 'userProfile_version';

export const DEFAULT_PROFILE = Object.freeze({
  displayName: 'Moses Kollie',
  email: 'moses.kollie@lazypygmy.lr',
  role: 'Administrator',
  initials: 'MK',
  title: 'Operations Lead',
  photoAssetId: null,
  preferences: Object.freeze({
    theme: 'system',
    density: 'comfortable',
  }),
  updatedAt: null,
});

function deriveInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '');
  return letters.join('') || '?';
}

/**
 * v1: there is no previous schema to migrate from. This function is the
 * seam where future versions will map old → new.
 */
function migrate(stored) {
  return { ...DEFAULT_PROFILE, ...(stored || {}) };
}

const UserProfileContext = createContext(null);

export function UserProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const version = localStorageStore.get(PROFILE_VERSION_KEY, 0);
    if (version < PROFILE_VERSION) {
      const migrated = migrate(localStorageStore.get(PROFILE_KEY));
      localStorageStore.set(PROFILE_KEY, migrated);
      localStorageStore.set(PROFILE_VERSION_KEY, PROFILE_VERSION);
      return migrated;
    }
    return localStorageStore.get(PROFILE_KEY, DEFAULT_PROFILE);
  });

  // A ref mirror of the latest profile so action callbacks can both
  // (a) read the current photoAssetId synchronously (clearPhoto) and
  // (b) write a functional update without closing over a stale render.
  // The ref is kept in lock-step via a layout effect.
  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const persist = useCallback((updater) => {
    setProfile((prev) => {
      const nextRaw = typeof updater === 'function' ? updater(prev) : updater;
      const stamped = { ...nextRaw, updatedAt: new Date().toISOString() };
      localStorageStore.set(PROFILE_KEY, stamped);
      localStorageStore.set(PROFILE_VERSION_KEY, PROFILE_VERSION);
      return stamped;
    });
  }, []);

  const update = useCallback((patch) => persist((p) => ({ ...p, ...patch })), [persist]);

  const setPhoto = useCallback(
    (assetId) => persist((p) => ({ ...p, photoAssetId: assetId || null })),
    [persist]
  );

  const clearPhoto = useCallback(() => {
    // Read the previous id from the ref (synchronous, always current) and
    // queue the clear. The actual IDB record is removed by the caller —
    // ImageImportField on remove, or signOut/clearAll paths.
    const previousId = profileRef.current.photoAssetId || null;
    persist((p) => ({ ...p, photoAssetId: null }));
    return previousId;
  }, [persist]);

  const setDisplayName = useCallback(
    (displayName) => {
      const next = String(displayName || '').trim() || DEFAULT_PROFILE.displayName;
      persist((p) => ({ ...p, displayName: next, initials: deriveInitials(next) }));
    },
    [persist]
  );

  const value = useMemo(
    () => ({
      profile,
      update,
      setPhoto,
      clearPhoto,
      setDisplayName,
      initials: profile.initials || deriveInitials(profile.displayName),
    }),
    [profile, update, setPhoto, clearPhoto, setDisplayName]
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within <UserProfileProvider>');
  return ctx;
}
