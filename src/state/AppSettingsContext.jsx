/**
 * App-wide settings context (Phase 4 wires the UI; Phase 1 lays the data
 * foundation so the rest of the app can already read defaults).
 *
 * Persisted to localStorage under lp_appSettings / lp_appSettings_version.
 * v1 is the first shape; future versions add a migrate() branch.
 *
 * Sections map to the Settings center tabs that Phase 4 will add:
 *   general, inventory, orders, notifications, appearance, account.
 * Each section is independently updateable via updateSection(section, patch).
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { localStorageStore } from '../data-access/localStorageStore.js';

export const SETTINGS_VERSION = 1;
const SETTINGS_KEY = 'appSettings';
const SETTINGS_VERSION_KEY = 'appSettings_version';

const DEFAULTS = Object.freeze({
  general: Object.freeze({
    timezone: 'Africa/Monrovia',
    locale: 'en-LR',
    currency: 'LRD',
    dateFormat: 'DD/MM/YYYY',
  }),
  inventory: Object.freeze({
    defaultWarehouse: null,
    lowStockThreshold: 10,
    allowNegativeStock: false,
    autoReorderEnabled: false,
  }),
  orders: Object.freeze({
    defaultTerms: 'Net 30',
    defaultRoute: null,
    creditWarningThreshold: 100,
    requireDeliverySignature: true,
  }),
  notifications: Object.freeze({
    inApp: true,
    emailDigest: false,
    lowStockAlerts: true,
    orderApprovals: true,
    quietStart: '20:00',
    quietEnd: '07:00',
  }),
  appearance: Object.freeze({
    theme: 'system',
    density: 'comfortable',
    reducedMotion: false,
  }),
  account: Object.freeze({
    sessionTimeoutMinutes: 30,
    showProfileInTopbar: true,
  }),
  updatedAt: null,
});

/**
 * Merge stored settings onto the v1 defaults, section by section, so any
 * key that was added in v1 still appears even if the stored value is from
 * an earlier partial write.
 */
function migrate(stored) {
  if (!stored || typeof stored !== 'object') return { ...DEFAULTS };
  return {
    ...DEFAULTS,
    ...stored,
    general: { ...DEFAULTS.general, ...(stored.general || {}) },
    inventory: { ...DEFAULTS.inventory, ...(stored.inventory || {}) },
    orders: { ...DEFAULTS.orders, ...(stored.orders || {}) },
    notifications: { ...DEFAULTS.notifications, ...(stored.notifications || {}) },
    appearance: { ...DEFAULTS.appearance, ...(stored.appearance || {}) },
    account: { ...DEFAULTS.account, ...(stored.account || {}) },
  };
}

export const DEFAULT_APP_SETTINGS = DEFAULTS;

const AppSettingsContext = createContext(null);

export function AppSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const version = localStorageStore.get(SETTINGS_VERSION_KEY, 0);
    if (version < SETTINGS_VERSION) {
      const merged = migrate(localStorageStore.get(SETTINGS_KEY));
      localStorageStore.set(SETTINGS_KEY, merged);
      localStorageStore.set(SETTINGS_VERSION_KEY, SETTINGS_VERSION);
      return merged;
    }
    return migrate(localStorageStore.get(SETTINGS_KEY));
  });

  const persist = useCallback((next) => {
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    localStorageStore.set(SETTINGS_KEY, stamped);
    localStorageStore.set(SETTINGS_VERSION_KEY, SETTINGS_VERSION);
    setSettings(stamped);
  }, []);

  const updateSection = useCallback(
    (section, patch) =>
      persist({
        ...settings,
        [section]: { ...(settings[section] || {}), ...patch },
      }),
    [settings, persist]
  );

  const resetSection = useCallback(
    (section) => {
      if (!DEFAULTS[section]) return;
      persist({ ...settings, [section]: { ...DEFAULTS[section] } });
    },
    [settings, persist]
  );

  const resetAll = useCallback(() => persist({ ...DEFAULTS }), [persist]);

  const value = useMemo(
    () => ({ settings, updateSection, resetSection, resetAll }),
    [settings, updateSection, resetSection, resetAll]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within <AppSettingsProvider>');
  return ctx;
}
