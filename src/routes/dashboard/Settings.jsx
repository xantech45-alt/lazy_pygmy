/**
 * Settings center — Phase 4.
 *
 * Replaces the EmptyState shell with a real settings page organized by
 * section tabs. Each control either:
 *   - persists via useAppSettings().updateSection()
 *   - is intentionally read-only (with a visible reason)
 *
 * Sections:
 *   - General       timezone, locale, currency, date format, restore defaults
 *   - Inventory     default warehouse, low-stock threshold emphasis
 *   - Orders        default payment terms + default route
 *   - Notifications centralizes the same prefs as the /notifications page
 *   - Appearance    theme (light/system) + density (comfortable/compact)
 *   - Account       link to /profile, simulated-auth notice
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import AppCard from '../../components/AppCard.jsx';
import { useAppSettings, DEFAULT_APP_SETTINGS } from '../../state/AppSettingsContext.jsx';
import { useUserProfile } from '../../state/UserProfileContext.jsx';
import { useToast } from '../../components/ToastProvider.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { useNotifications } from '../../data-access/useNotifications.js';
import { imageAssetStore } from '../../data-access/imageAssetStore.js';
import { signOut } from '../../state/signOut.js';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'orders', label: 'Orders' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'account', label: 'Account' },
];

const TIMEZONES = ['Africa/Monrovia', 'UTC', 'Africa/Abidjan', 'Africa/Accra', 'Africa/Lagos'];
const LOCALES = ['en-LR', 'en-US', 'fr-FR', 'en-GB'];
const CURRENCIES = ['LRD', 'USD', 'EUR', 'GBP'];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
const TERMS = ['Net 30', 'Net 15', 'Prepaid', 'On delivery'];
const ROUTES = ['', 'Monrovia – Bong', 'Monrovia – Nimba', 'Monrovia – Lofa'];

export default function Settings() {
  const [active, setActive] = useState('general');

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Settings' }]} />
      <PageHeader
        title="Settings"
        subtitle="Workspace preferences. Stored in this browser only."
      />

      <div className="settings-tabnav" role="tablist" aria-label="Settings sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-current={active === t.id ? 'page' : undefined}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === 'general' && <GeneralTab />}
      {active === 'inventory' && <InventoryTab />}
      {active === 'orders' && <OrdersTab />}
      {active === 'notifications' && <NotificationsTab />}
      {active === 'appearance' && <AppearanceTab />}
      {active === 'account' && <AccountTab />}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────────── */

function SectionCard({ title, children, footer }) {
  return (
    <AppCard head={<h5>{title}</h5>} body={children}>
      {footer && <div className="d-flex justify-content-end mt-3">{footer}</div>}
    </AppCard>
  );
}

function useSection(section) {
  const { settings, updateSection, resetSection } = useAppSettings();
  return {
    value: settings[section],
    update: (patch) => updateSection(section, patch),
    reset: () => resetSection(section),
  };
}

function dirtyCompare(value, defaults) {
  return JSON.stringify(value || {}) !== JSON.stringify(defaults || {});
}

/* ──────────────────────────────────────────────────────────────────────────
 * General
 * ────────────────────────────────────────────────────────────────────────── */

function GeneralTab() {
  const { value, update, reset } = useSection('general');
  const toast = useToast();
  const defaults = DEFAULT_APP_SETTINGS.general;
  const dirty = dirtyCompare(value, defaults);

  return (
    <SectionCard title="General preferences" footer={
      <>
        <button
          type="button"
          className="btn btn-outline-app me-2"
          disabled={!dirty}
          onClick={reset}
        >
          Restore defaults
        </button>
        <button
          type="button"
          className="btn btn-primary-app"
          disabled={!dirty}
          onClick={() => toast('General preferences saved.')}
        >
          Save
        </button>
      </>
    }>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="setTimezone">Timezone</label>
          <select
            id="setTimezone"
            className="form-select"
            value={value.timezone}
            onChange={(e) => update({ timezone: e.target.value })}
          >
            {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="setLocale">Locale</label>
          <select
            id="setLocale"
            className="form-select"
            value={value.locale}
            onChange={(e) => update({ locale: e.target.value })}
          >
            {LOCALES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="setCurrency">Currency</label>
          <select
            id="setCurrency"
            className="form-select"
            value={value.currency}
            onChange={(e) => update({ currency: e.target.value })}
          >
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="setDateFormat">Date format</label>
          <select
            id="setDateFormat"
            className="form-select"
            value={value.dateFormat}
            onChange={(e) => update({ dateFormat: e.target.value })}
          >
            {DATE_FORMATS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>
    </SectionCard>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Inventory
 * ────────────────────────────────────────────────────────────────────────── */

function InventoryTab() {
  const { value, update, reset } = useSection('inventory');
  const toast = useToast();
  const defaults = DEFAULT_APP_SETTINGS.inventory;
  const dirty = dirtyCompare(value, defaults);
  const warehouses = localStorageStore.getWarehouses();

  return (
    <SectionCard title="Inventory preferences" footer={
      <>
        <button
          type="button"
          className="btn btn-outline-app me-2"
          disabled={!dirty}
          onClick={reset}
        >
          Restore defaults
        </button>
        <button
          type="button"
          className="btn btn-primary-app"
          disabled={!dirty}
          onClick={() => toast('Inventory preferences saved.')}
        >
          Save
        </button>
      </>
    }>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="setDefaultWarehouse">Default warehouse</label>
          <select
            id="setDefaultWarehouse"
            className="form-select"
            value={value.defaultWarehouse || ''}
            onChange={(e) => update({ defaultWarehouse: e.target.value || null })}
          >
            <option value="">Select…</option>
            {warehouses.map((w) => (
              <option key={w.code} value={w.code}>{w.code} · {w.name}</option>
            ))}
          </select>
          <div className="small-note">
            Pre-selects the warehouse on new stock adjustments and transfers.
          </div>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="setLowStock">Low-stock threshold (units)</label>
          <input
            id="setLowStock"
            type="number"
            min="0"
            className="form-control"
            value={value.lowStockThreshold}
            onChange={(e) => update({ lowStockThreshold: Math.max(0, Number(e.target.value) || 0) })}
          />
          <div className="small-note">
            Products whose on-hand falls at or below this number are highlighted on the
            dashboard and product list. Per-product reorder values still apply.
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-check form-switch">
            <input
              id="setAllowNeg"
              type="checkbox"
              className="form-check-input"
              checked={Boolean(value.allowNegativeStock)}
              onChange={(e) => update({ allowNegativeStock: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="setAllowNeg">
              Allow negative stock (warning, off by default)
            </label>
          </div>
          <div className="small-note">
            The backend (when present) should reject negative balances. Toggle is for
            demo convenience only.
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-check form-switch">
            <input
              id="setAutoReorder"
              type="checkbox"
              className="form-check-input"
              checked={Boolean(value.autoReorderEnabled)}
              onChange={(e) => update({ autoReorderEnabled: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="setAutoReorder">
              Auto-suggest reorder POs
            </label>
          </div>
          <div className="small-note">
            When enabled, products below their reorder level appear in the
            &quot;New Purchase Order&quot; pre-fill.
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Orders
 * ────────────────────────────────────────────────────────────────────────── */

function OrdersTab() {
  const { value, update, reset } = useSection('orders');
  const toast = useToast();
  const defaults = DEFAULT_APP_SETTINGS.orders;
  const dirty = dirtyCompare(value, defaults);

  return (
    <SectionCard title="Order defaults" footer={
      <>
        <button
          type="button"
          className="btn btn-outline-app me-2"
          disabled={!dirty}
          onClick={reset}
        >
          Restore defaults
        </button>
        <button
          type="button"
          className="btn btn-primary-app"
          disabled={!dirty}
          onClick={() => toast('Order defaults saved.')}
        >
          Save
        </button>
      </>
    }>
      <div className="info-callout mb-3">
        Defaults are applied when a <strong>new</strong> order draft is created.
        Existing drafts are not overwritten.
      </div>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="setDefaultTerms">Default payment terms</label>
          <select
            id="setDefaultTerms"
            className="form-select"
            value={value.defaultTerms}
            onChange={(e) => update({ defaultTerms: e.target.value })}
          >
            {TERMS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="setDefaultRoute">Default delivery route</label>
          <select
            id="setDefaultRoute"
            className="form-select"
            value={value.defaultRoute || ''}
            onChange={(e) => update({ defaultRoute: e.target.value || null })}
          >
            {ROUTES.map((r) => (
              <option key={r || 'none'} value={r}>{r || 'No default'}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="setCreditWarn">Credit-warning threshold</label>
          <input
            id="setCreditWarn"
            type="number"
            min="0"
            className="form-control"
            value={value.creditWarningThreshold}
            onChange={(e) => update({ creditWarningThreshold: Math.max(0, Number(e.target.value) || 0) })}
          />
          <div className="small-note">
            Orders whose total exceeds the customer&apos;s available credit by this
            amount surface a review warning.
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-check form-switch">
            <input
              id="setRequireSig"
              type="checkbox"
              className="form-check-input"
              checked={Boolean(value.requireDeliverySignature)}
              onChange={(e) => update({ requireDeliverySignature: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="setRequireSig">
              Require delivery signature
            </label>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Notifications
 * ────────────────────────────────────────────────────────────────────────── */

const NOTIF_DEFAULT_PREFS = Object.freeze({
  inApp: true,
  emailDigest: false,
  lowStockAlerts: true,
  orderApprovals: true,
});

function NotificationsTab() {
  const toast = useToast();
  // Pull from the same per-key storage the /notifications page uses.
  const [prefs, setPrefs] = useState(() => localStorageStore.getNotifPrefs(NOTIF_DEFAULT_PREFS));

  const updatePref = (key, value) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    localStorageStore.setNotifPref(key, value);
    toast('Notification preference saved.');
  };

  return (
    <>
      <SectionCard title="Notification preferences">
        <p className="small-note mb-3">
          These preferences are also editable on the <Link to="/notifications">Notifications</Link> page.
          Changes here and there stay in sync.
        </p>
        <div className="form-check form-switch mb-2">
          <input
            id="npInApp"
            type="checkbox"
            className="form-check-input"
            checked={Boolean(prefs.inApp)}
            onChange={(e) => updatePref('inApp', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="npInApp">
            Show notifications inside the app
          </label>
        </div>
        <div className="form-check form-switch mb-2">
          <input
            id="npLow"
            type="checkbox"
            className="form-check-input"
            checked={Boolean(prefs.lowStockAlerts)}
            onChange={(e) => updatePref('lowStockAlerts', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="npLow">
            Low-stock alerts
          </label>
        </div>
        <div className="form-check form-switch mb-2">
          <input
            id="npOrders"
            type="checkbox"
            className="form-check-input"
            checked={Boolean(prefs.orderApprovals)}
            onChange={(e) => updatePref('orderApprovals', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="npOrders">
            Order-approval notifications
          </label>
        </div>
        <div className="form-check form-switch mb-2">
          <input
            id="npEmail"
            type="checkbox"
            className="form-check-input"
            checked={Boolean(prefs.emailDigest)}
            onChange={(e) => updatePref('emailDigest', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="npEmail">
            Daily email digest <span className="text-muted-app">(simulated — no email is sent)</span>
          </label>
        </div>
      </SectionCard>
      <QuietHoursCard />
    </>
  );
}

function QuietHoursCard() {
  const { value, update } = useSection('notifications');
  const toast = useToast();

  return (
    <AppCard head={<h5>Quiet hours</h5>}>
      <p className="small-note mb-3">
        During these hours the in-app notification sound and toast are suppressed.
        Times are interpreted in the timezone you chose in General.
      </p>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="setQuietStart">Start</label>
          <input
            id="setQuietStart"
            type="time"
            className="form-control"
            value={value.quietStart || '20:00'}
            onChange={(e) => update({ quietStart: e.target.value })}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="setQuietEnd">End</label>
          <input
            id="setQuietEnd"
            type="time"
            className="form-control"
            value={value.quietEnd || '07:00'}
            onChange={(e) => update({ quietEnd: e.target.value })}
          />
        </div>
      </div>
      <div className="d-flex justify-content-end mt-3">
        <button
          type="button"
          className="btn btn-primary-app"
          onClick={() => toast('Quiet hours saved.')}
        >
          Save
        </button>
      </div>
    </AppCard>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Appearance
 * ────────────────────────────────────────────────────────────────────────── */

function AppearanceTab() {
  const { value, update } = useSection('appearance');
  const toast = useToast();

  // Apply density + reduced motion to the document immediately on change.
  useEffect(() => {
    document.documentElement.setAttribute('data-density', value.density);
  }, [value.density]);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-reduced-motion',
      value.reducedMotion ? 'true' : 'false'
    );
  }, [value.reducedMotion]);

  return (
    <SectionCard title="Appearance & accessibility" footer={
      <button
        type="button"
        className="btn btn-primary-app"
        onClick={() => toast('Appearance saved.')}
      >
        Save
      </button>
    }>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="setDensity">Density</label>
          <select
            id="setDensity"
            className="form-select"
            value={value.density}
            onChange={(e) => update({ density: e.target.value })}
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
          <div className="small-note">Applies across the app via a root data attribute.</div>
        </div>
        <div className="col-md-6">
          <div className="form-check form-switch">
            <input
              id="setReducedMotion"
              type="checkbox"
              className="form-check-input"
              checked={Boolean(value.reducedMotion)}
              onChange={(e) => update({ reducedMotion: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="setReducedMotion">
              Reduce motion (respects <code>prefers-reduced-motion</code>)
            </label>
          </div>
          <div className="small-note">
            When on, transitions and toasts drop their motion and rely on
            accessibility-friendly timing.
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Account
 * ────────────────────────────────────────────────────────────────────────── */

function AccountTab() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const toast = useToast();

  const handleClearAssets = async () => {
    try {
      await imageAssetStore.clear();
      toast('Local image storage cleared.');
    } catch (err) {
      toast("Couldn't clear local image storage in this browser.");
    }
  };

  const handleSignOut = (e) => {
    e.preventDefault();
    signOut();
    navigate('/sign-in', { replace: true });
  };

  return (
    <div className="row g-3">
      <div className="col-lg-7">
        <AppCard head={<h5>Account</h5>}>
          <div className="kv-row"><span>Display name</span><strong>{profile.displayName}</strong></div>
          <div className="kv-row"><span>Email</span><strong>{profile.email}</strong></div>
          <div className="kv-row"><span>Role</span><strong>{profile.role}</strong></div>
          <div className="d-flex flex-wrap gap-2 mt-3">
            <Link to="/profile" className="btn btn-primary-app">
              <i className="bi bi-person me-1" aria-hidden="true"></i>
              Open profile
            </Link>
            <button type="button" className="btn btn-outline-app" onClick={handleSignOut}>
              <i className="bi bi-box-arrow-right me-1" aria-hidden="true"></i>
              Sign out
            </button>
          </div>
        </AppCard>
      </div>
      <div className="col-lg-5">
        <AppCard head={<h5>Storage</h5>}>
          <p>
            Profile photo and product images are stored locally in this browser&apos;s
            IndexedDB. Clearing them is permanent for this device only.
          </p>
          <button type="button" className="btn btn-outline-danger-app" onClick={handleClearAssets}>
            <i className="bi bi-trash me-1" aria-hidden="true"></i>
            Clear local image storage
          </button>
        </AppCard>
        <AppCard head={<h5>About authentication</h5>}>
          <div className="info-callout">
            This is a frontend demo. Account changes and sign-in are simulated and
            remain on this device. There is no real password, email, or token.
          </div>
        </AppCard>
      </div>
    </div>
  );
}
