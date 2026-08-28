/**
 * Phase 1 shared state: profile, app settings, sign-out, image store.
 *
 * Covers the new surface in src/state/ and src/data-access/ introduced
 * for the profile + settings + image-asset foundation. These tests
 * intentionally use jsdom and the real localStorage (not a mock) so the
 * localStorageStore adapter and its key-prefixing are exercised as in
 * production.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { UserProfileProvider, useUserProfile, DEFAULT_PROFILE, PROFILE_VERSION } from '../src/state/UserProfileContext.jsx';
import {
  AppSettingsProvider,
  useAppSettings,
  DEFAULT_APP_SETTINGS,
  SETTINGS_VERSION,
} from '../src/state/AppSettingsContext.jsx';
import { signOut } from '../src/state/signOut.js';
import { localStorageStore } from '../src/data-access/localStorageStore.js';

const PREFIX = 'lp_';

function clearLocalStorage() {
  for (const k of Object.keys(window.localStorage)) {
    if (k.startsWith(PREFIX)) window.localStorage.removeItem(k);
  }
}

function profileWrapper({ children }) {
  return <UserProfileProvider>{children}</UserProfileProvider>;
}
function settingsWrapper({ children }) {
  return (
    <UserProfileProvider>
      <AppSettingsProvider>{children}</AppSettingsProvider>
    </UserProfileProvider>
  );
}

describe('UserProfileContext', () => {
  beforeEach(() => {
    clearLocalStorage();
  });

  it('hydrates with the v1 defaults on first load', () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper: profileWrapper });
    expect(result.current.profile.displayName).toBe(DEFAULT_PROFILE.displayName);
    expect(result.current.profile.email).toBe(DEFAULT_PROFILE.email);
    expect(result.current.initials).toBe(DEFAULT_PROFILE.initials);
  });

  it('persists a versioned snapshot so the next load skips the migrate() branch', () => {
    renderHook(() => useUserProfile(), { wrapper: profileWrapper });
    expect(localStorageStore.get('userProfile_version', 0)).toBe(PROFILE_VERSION);
    expect(localStorageStore.get('userProfile')).toBeTruthy();
  });

  it('setDisplayName updates name + recomputes initials', () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper: profileWrapper });
    act(() => result.current.setDisplayName('Josephine Doe'));
    expect(result.current.profile.displayName).toBe('Josephine Doe');
    expect(result.current.profile.initials).toBe('JD');
  });

  it('setDisplayName falls back to the default when the value is empty/whitespace', () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper: profileWrapper });
    act(() => result.current.setDisplayName('   '));
    expect(result.current.profile.displayName).toBe(DEFAULT_PROFILE.displayName);
    expect(result.current.profile.initials).toBe(DEFAULT_PROFILE.initials);
  });

  it('setPhoto + clearPhoto round-trip an asset id', () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper: profileWrapper });
    act(() => result.current.setPhoto('asset-123'));
    expect(result.current.profile.photoAssetId).toBe('asset-123');
    let previous;
    act(() => {
      previous = result.current.clearPhoto();
    });
    expect(previous).toBe('asset-123');
    expect(result.current.profile.photoAssetId).toBeNull();
  });

  it('throws when used outside the provider', () => {
    // Suppress the expected React error log so the test output stays clean.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useUserProfile())).toThrow(
      /must be used within <UserProfileProvider>/
    );
    spy.mockRestore();
  });
});

describe('AppSettingsContext', () => {
  beforeEach(() => {
    clearLocalStorage();
  });

  it('hydrates every section with the v1 defaults', () => {
    const { result } = renderHook(() => useAppSettings(), { wrapper: settingsWrapper });
    expect(result.current.settings.general.timezone).toBe(DEFAULT_APP_SETTINGS.general.timezone);
    expect(result.current.settings.inventory.lowStockThreshold).toBe(10);
    expect(result.current.settings.orders.defaultTerms).toBe('Net 30');
    expect(result.current.settings.notifications.inApp).toBe(true);
    expect(result.current.settings.appearance.theme).toBe('system');
    expect(result.current.settings.account.sessionTimeoutMinutes).toBe(30);
  });

  it('records the v1 version on first persist', () => {
    renderHook(() => useAppSettings(), { wrapper: settingsWrapper });
    expect(localStorageStore.get('appSettings_version', 0)).toBe(SETTINGS_VERSION);
  });

  it('updateSection patches only the targeted section', () => {
    const { result } = renderHook(() => useAppSettings(), { wrapper: settingsWrapper });
    act(() => result.current.updateSection('inventory', { lowStockThreshold: 25 }));
    expect(result.current.settings.inventory.lowStockThreshold).toBe(25);
    // other sections untouched
    expect(result.current.settings.orders.defaultTerms).toBe('Net 30');
    expect(result.current.settings.notifications.inApp).toBe(true);
  });

  it('resetSection restores just that section', () => {
    const { result } = renderHook(() => useAppSettings(), { wrapper: settingsWrapper });
    act(() => result.current.updateSection('orders', { defaultTerms: 'Net 60' }));
    act(() => result.current.updateSection('inventory', { allowNegativeStock: true }));
    act(() => result.current.resetSection('orders'));
    expect(result.current.settings.orders.defaultTerms).toBe('Net 30');
    expect(result.current.settings.inventory.allowNegativeStock).toBe(true);
  });

  it('resetAll restores the full default tree', () => {
    const { result } = renderHook(() => useAppSettings(), { wrapper: settingsWrapper });
    act(() => result.current.updateSection('appearance', { theme: 'dark' }));
    act(() => result.current.resetAll());
    expect(result.current.settings.appearance.theme).toBe('system');
    expect(result.current.settings.general.timezone).toBe(DEFAULT_APP_SETTINGS.general.timezone);
  });

  it('migrates an older partial stored value by re-applying defaults', () => {
    // Pretend an earlier partial write left only the orders section
    localStorageStore.set('appSettings', { orders: { defaultTerms: 'Net 60' } });
    localStorageStore.set('appSettings_version', 0);
    const { result } = renderHook(() => useAppSettings(), { wrapper: settingsWrapper });
    expect(result.current.settings.orders.defaultTerms).toBe('Net 60');
    expect(result.current.settings.general.timezone).toBe(DEFAULT_APP_SETTINGS.general.timezone);
    expect(result.current.settings.inventory.lowStockThreshold).toBe(10);
  });
});

describe('signOut', () => {
  beforeEach(() => {
    clearLocalStorage();
  });

  it('removes the auth, profile, and settings keys but leaves entity data alone', () => {
    localStorageStore.set('auth', '1');
    localStorageStore.set('userProfile', { displayName: 'Test' });
    localStorageStore.set('userProfile_version', 1);
    localStorageStore.set('appSettings', { general: {} });
    localStorageStore.set('appSettings_version', 1);
    // unrelated workspace data that should NOT be touched
    localStorageStore.set('products', [{ id: 'P-1' }]);
    localStorageStore.set('orderDraft', { id: 'ORD-1' });

    signOut();

    expect(localStorageStore.get('auth')).toBeUndefined();
    expect(localStorageStore.get('userProfile')).toBeUndefined();
    expect(localStorageStore.get('userProfile_version')).toBeUndefined();
    expect(localStorageStore.get('appSettings')).toBeUndefined();
    expect(localStorageStore.get('appSettings_version')).toBeUndefined();
    expect(localStorageStore.get('products')).toEqual([{ id: 'P-1' }]);
    expect(localStorageStore.get('orderDraft')).toEqual({ id: 'ORD-1' });
  });

  it('survives a quota / private-mode removeItem error', () => {
    localStorageStore.set('auth', '1');
    const original = window.localStorage.removeItem.bind(window.localStorage);
    const spy = vi.spyOn(window.localStorage, 'removeItem').mockImplementation((k) => {
      if (k === 'lp_auth') throw new Error('quota');
      original(k);
    });
    expect(() => signOut()).not.toThrow();
    spy.mockRestore();
  });
});
