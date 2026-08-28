import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import GlobalSearch from './GlobalSearch.jsx';
import TopbarAccountMenu from './TopbarAccountMenu.jsx';
import { ROLE_NAMES } from '../data-access/useRolePermissions.js';
import { localStorageStore } from '../data-access/localStorageStore.js';
import { useNotifications } from '../data-access/useNotifications.js';

/**
 * Topbar — mirrors app-shell.js topbar() with the exact 9-item "New" menu.
 *
 * Notification badge is bound to useNotifications() so the count updates
 * whenever notifications are marked read or cleared anywhere in the app.
 *
 * The user block (avatar + name) is now a real account menu (Phase 3).
 * The "Help" button is wired to a printable shortcuts sheet instead of
 * being inert.
 *
 * Both the "New" dropdown and the keyboard-shortcuts modal are now
 * React-controlled (no data-bs-toggle / data-bs-dismiss), so the topbar
 * works without the Bootstrap JS bundle (NAV-02). On screens narrower
 * than the breakpoint the Active-role select collapses to icon-only and
 * the help-button label disappears to keep the topbar from overflowing
 * (GL-04).
 */
const NEW_MENU = [
  { label: 'New Product', to: '/products/new' },
  { label: 'New Order', to: '/orders/new' },
  { label: 'New Purchase Order', to: '/purchase-orders/new' },
  { label: 'Stock Adjustment', to: '/inventory/adjustment' },
  { label: 'Stock Transfer', to: '/warehouses/transfers/new' },
  { label: 'New School', to: '/schools/new' },
  { label: 'New Supplier', to: '/suppliers/new' },
  { label: 'New Warehouse', to: '/warehouses/new' },
  { label: 'New Employee', to: '/employees/new' },
];

const SHORTCUTS = [
  { combo: 'g d', desc: 'Go to Dashboard' },
  { combo: 'g o', desc: 'Go to Orders' },
  { combo: 'g p', desc: 'Go to Products' },
  { combo: 'g n', desc: 'Go to Notifications' },
  { combo: 'g s', desc: 'Go to Settings' },
  { combo: '?', desc: 'Toggle this shortcut sheet' },
];

export default function Topbar({ onOpenMobileNav }) {
  const [role, setRole] = useState(() => localStorageStore.get('activeRole', 'Administrator'));
  const { unreadCount } = useNotifications();
  const [showHelp, setShowHelp] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  const newMenuRef = useRef(null);
  const newButtonRef = useRef(null);

  const changeRole = (e) => {
    const next = e.target.value;
    localStorageStore.set('activeRole', next);
    setRole(next);
  };

  // Close the "New" dropdown when the user clicks anywhere outside of it,
  // presses Escape, or navigates (NavLink triggers a route change). This is
  // the behaviour Bootstrap's JS bundle gave us for free; we replicate it
  // here so the topbar keeps working without it.
  useEffect(() => {
    if (!newOpen) return;
    const onDocClick = (e) => {
      if (
        newMenuRef.current?.contains(e.target) ||
        newButtonRef.current?.contains(e.target)
      )
        return;
      setNewOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setNewOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [newOpen]);

  // Collapse the dropdown after a navigation so the topbar stays clean.
  const handleNewPick = () => setNewOpen(false);

  return (
    <header className="app-topbar">
      <button
        className="btn btn-outline-secondary mobile-menu-btn"
        type="button"
        aria-label="Open navigation"
        onClick={onOpenMobileNav}
      >
        <i className="bi bi-list"></i>
      </button>
      <GlobalSearch />
      <div className="topbar-actions">
        <label
          className="d-none d-lg-flex align-items-center gap-2 small text-muted-app"
          htmlFor="activeRoleSelect"
        >
          <i className="bi bi-person-badge" aria-hidden="true"></i>
          <span className="visually-hidden">Active role</span>
        </label>
        <select
          id="activeRoleSelect"
          name="activeRole"
          className="form-select form-select-sm d-none d-lg-block topbar-role"
          value={role}
          onChange={changeRole}
          aria-label="Active role — drives the can(role, permission) gate across destructive actions"
        >
          {ROLE_NAMES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm icon-only-btn d-lg-none"
          aria-label={`Active role: ${role}. Pick another from the role selector.`}
          title={`Active role: ${role}`}
          onClick={() => {
            const idx = ROLE_NAMES.indexOf(role);
            const next = ROLE_NAMES[(idx + 1) % ROLE_NAMES.length];
            localStorageStore.set('activeRole', next);
            setRole(next);
          }}
        >
          <i className="bi bi-person-badge"></i>
        </button>
        <div className="dropdown topbar-new" ref={newMenuRef}>
          <button
            ref={newButtonRef}
            className="btn btn-primary-app px-3"
            type="button"
            aria-haspopup="menu"
            aria-expanded={newOpen}
            aria-label="Create a new record"
            onClick={() => setNewOpen((o) => !o)}
          >
            <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>
            <span className="new-label">New</span>
          </button>
          {newOpen && (
            <ul
              className="dropdown-menu dropdown-menu-end show"
              role="menu"
            >
              {NEW_MENU.map((m) => (
                <li key={m.to}>
                  <Link
                    className="dropdown-item"
                    to={m.to}
                    role="menuitem"
                    onClick={handleNewPick}
                  >
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link to="/notifications" className="icon-circle position-relative is-notifications" aria-label="Notifications">
          <i className="bi bi-bell"></i>
          {unreadCount > 0 && (
            <span
              className="notification-count"
              aria-label={`${unreadCount} unread`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <button
          type="button"
          className="icon-circle is-help"
          aria-label="Keyboard shortcuts"
          aria-expanded={showHelp}
          onClick={() => setShowHelp((s) => !s)}
        >
          <i className="bi bi-question-lg"></i>
        </button>
        <TopbarAccountMenu />
      </div>
      {showHelp && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(20, 24, 32, 0.5)', zIndex: 1500 }}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <button
            type="button"
            aria-label="Close shortcuts"
            className="position-absolute top-0 start-0 w-100 h-100 modal-backdrop-app"
            onClick={() => setShowHelp(false)}
          ></button>
          <div
            className="app-card"
            style={{ maxWidth: 480, width: '90%', position: 'relative', zIndex: 1 }}
          >
            <div className="card-head d-flex justify-content-between align-items-center">
              <h5 className="m-0">Keyboard shortcuts</h5>
              <button
                type="button"
                className="btn-close-app"
                aria-label="Close shortcuts"
                onClick={() => setShowHelp(false)}
              >
                ×
              </button>
            </div>
            <div className="card-body-app">
              <table className="table table-sm mb-0">
                <tbody>
                  {SHORTCUTS.map((s) => (
                    <tr key={s.combo}>
                      <td style={{ width: 80 }}>
                        <kbd>{s.combo}</kbd>
                      </td>
                      <td>{s.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="small-note mt-2">
                These are convention labels only; this prototype does not bind
                global keys. See <Link to="/profile">your profile</Link> for
                account-level settings.
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
