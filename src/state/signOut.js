/**
 * Shared sign-out action.
 *
 * Wipes the per-session keys and lets the caller navigate. We do NOT
 * clear the entity collections (products, orders, suppliers, …) or the
 * order draft — those belong to the workspace, not the user session.
 *
 * Keys removed (all under the `lp_` prefix used by localStorageStore):
 *   lp_auth                  the auth flag RequireAuth checks
 *   lp_userProfile           profile data
 *   lp_userProfile_version   profile schema version
 *   lp_appSettings           app settings data
 *   lp_appSettings_version   app-settings schema version
 *
 * IndexedDB asset bytes are intentionally preserved across sign-out so
 * the user does not lose uploaded product images or profile photos when
 * they sign out and back in. Asset deletion is opt-in via the
 * ImageImportField's "Remove" affordance and Settings · Storage clear-all.
 *
 * Per docs/CLIENT_IMAGE_STORAGE.md §7.
 */
const KEYS_TO_WIPE = [
  'auth',
  'userProfile',
  'userProfile_version',
  'appSettings',
  'appSettings_version',
];

export function signOut() {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }
  for (const k of KEYS_TO_WIPE) {
    try {
      window.localStorage.removeItem(`lp_${k}`);
    } catch {
      // best-effort; ignore quota / private-mode errors
    }
  }
}
