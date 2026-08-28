import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import AppCard from '../../components/AppCard.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { useNotifications, recentCount } from '../../data-access/useNotifications.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * Notifications — replaces notifications.html.
 *
 * - filters: All / Unread / Stock / Orders / System
 * - prefs persist per-user key `pref_<n>` in `lp_pref_<n>`
 * - "Mark all read" flips unread=false on every notification.
 * - Mark single read/unread via the dropdown on each row.
 * - Mark all read auto-dismisses when unreadCount reaches 0.
 * - Subtitle is dynamic: `${unreadCount} unread · ${recentCount} in the last 7 days`.
 * - Preferences expose aria-labelled switches via .pref-label[htmlFor].
 */
const PREF_KEYS = ['pref0', 'pref1', 'pref2', 'pref3', 'pref4', 'pref5'];
const PREF_LABELS = [
  ['Low stock alerts', 'Email + in-app'],
  ['Out of stock alerts', 'Email + SMS'],
  ['Order status changes', 'In-app only'],
  ['Purchase order approvals', 'Email'],
  ['Weekly summary report', 'Email, Mondays'],
  ['Supplier delivery delays', 'In-app only'],
];
const PREFS_DEFAULT = [true, true, true, true, false, true];

const FILTERS = [
  { id: 'All', label: 'All' },
  { id: 'Unread', label: 'Unread' },
  { id: 'Stock', label: 'Stock' },
  { id: 'Orders', label: 'Orders' },
  { id: 'System', label: 'System' },
];

export default function Notifications() {
  const toast = useToast();
  const { items, unreadCount, markAllRead, markRead, markUnread, clearRead } =
    useNotifications();
  const [filter, setFilter] = useState('All');

  const [prefs, setPrefs] = useState(() => localStorageStore.getNotifPrefs(PREFS_DEFAULT));

  // Live-update subtitle when notifications change in other tabs.
  const last7 = useMemo(() => recentCount(items, 7), [items]);

  const writePrefs = (next) => {
    setPrefs(next);
    localStorageStore.saveNotifPrefs(next);
  };

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (filter === 'All') return true;
      if (filter === 'Unread') return n.unread;
      return n.type === filter;
    });
  }, [items, filter]);

  const onMarkAll = () => {
    markAllRead();
    toast('All notifications marked as read.');
  };

  const onClearRead = () => {
    clearRead();
    toast('Read notifications removed.');
  };

  const togglePref = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    writePrefs(next);
    toast('Notification preference updated.');
  };

  const filtersWithCount = FILTERS.map((f) => ({
    ...f,
    label: f.id === 'Unread' ? `Unread (${unreadCount})` : f.id,
  }));

  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Home', to: '/dashboard' }, { label: 'Notifications' }]}
      />
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread · ${last7} in the last 7 days`}
      >
        <button
          type="button"
          className="btn btn-outline-app"
          onClick={onMarkAll}
          disabled={unreadCount === 0}
        >
          <i className="bi bi-check2-all me-1"></i>Mark all read
        </button>
        <button
          type="button"
          className="btn btn-outline-app"
          onClick={onClearRead}
          disabled={items.length === unreadCount}
        >
          <i className="bi bi-trash me-1"></i>Clear read
        </button>
        <Link to="/settings" className="btn btn-outline-app">
          <i className="bi bi-sliders me-1"></i>Settings
        </Link>
      </PageHeader>

      <div className="row g-3">
        <div className="col-xl-8">
          <AppCard>
            <div className="card-head">
              <h5>Activity Feed</h5>
              <div
                className="toolbar mt-2"
                role="tablist"
                aria-label="Notification filters"
              >
                {filtersWithCount.map((f) => {
                  const value = f.id;
                  const active = filter === value;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-controls="notificationFeed"
                      className={`btn btn-sm ${
                        active ? 'btn-primary-app' : 'btn-outline-app'
                      }`}
                      onClick={() => setFilter(value)}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div id="notificationFeed" role="tabpanel" aria-live="polite">
              {filtered.length === 0 ? (
                <div className="p-4 text-muted-app">
                  {filter === 'Unread'
                    ? 'You are all caught up — no unread notifications.'
                    : 'No notifications in this view.'}
                </div>
              ) : (
                <ul className="list-unstyled m-0">
                  {filtered.map((n) => {
                    const id = n.id ?? `n-${n.title}`;
                    return (
                      <li
                        key={id}
                        className={`activity-item ${n.level || ''} ${
                          n.unread ? 'unread' : ''
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div className="flex-grow-1">
                            <div className="fw-bold">
                              {n.title}
                              {n.unread && (
                                <span
                                  className="badge bg-primary-app ms-2 align-middle"
                                  aria-label="Unread"
                                >
                                  New
                                </span>
                              )}
                            </div>
                            <div className="text-muted-app">{n.text}</div>
                            <div className="small text-faint mt-1">
                              <span className="badge-status">{n.type}</span>
                              <span className="ms-2">{n.time}</span>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            {n.unread ? (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-app"
                                onClick={() => {
                                  markRead(id);
                                }}
                                aria-label={`Mark ${n.title} as read`}
                              >
                                <i className="bi bi-check2"></i>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-app"
                                onClick={() => markUnread(id)}
                                aria-label={`Mark ${n.title} as unread`}
                              >
                                <i className="bi bi-dot"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </AppCard>
        </div>

        <div className="col-xl-4">
          <AppCard>
            <div className="card-head">
              <h5>Preferences</h5>
              <div className="small-note">How you are alerted</div>
            </div>
            <div className="card-body-app">
              {PREF_KEYS.map((k, i) => {
                const switchId = `notif-pref-${i}`;
                const labelText = PREF_LABELS[i][0];
                return (
                  <div
                    key={k}
                    className="d-flex justify-content-between align-items-center py-3 border-bottom"
                  >
                    <div>
                      <label htmlFor={switchId} className="fw-bold pref-label">
                        {labelText}
                      </label>
                      <div className="small-note">{PREF_LABELS[i][1]}</div>
                    </div>
                    <div className="form-check form-switch m-0">
                      <input
                        id={switchId}
                        className="form-check-input pref-switch"
                        type="checkbox"
                        role="switch"
                        checked={!!prefs[k]}
                        onChange={() => togglePref(k)}
                        aria-label={`Toggle ${labelText}`}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="bg-light rounded p-3 mt-3 small-note">
                <strong>Quiet hours</strong>
                <br />
                20:00 – 06:00 Africa/Monrovia. Critical stock alerts still delivered.
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </>
  );
}