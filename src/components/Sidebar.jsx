import { NavLink, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { signOut } from '../state/signOut.js';

/**
 * Sidebar — 13 nav items in exact order from app-shell.js (lines 9–22).
 * Each item maps a section id → label → URL path → Bootstrap icon.
 * Mirrors the active-state styling from layout.css .sidebar-nav .nav-link.active.
 */
const ITEMS = [
  { id: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: 'speedometer2' },
  { id: 'inventory', label: 'Inventory', to: '/inventory', icon: 'boxes' },
  { id: 'products', label: 'Products', to: '/products', icon: 'box-seam' },
  { id: 'orders', label: 'Orders', to: '/orders', icon: 'cart3' },
  { id: 'purchase-orders', label: 'Purchase Orders', to: '/purchase-orders', icon: 'clipboard-check' },
  { id: 'schools', label: 'Schools', to: '/schools', icon: 'building' },
  { id: 'suppliers', label: 'Suppliers', to: '/suppliers', icon: 'truck' },
  { id: 'warehouses', label: 'Warehouses', to: '/warehouses', icon: 'house-gear' },
  { id: 'employees', label: 'Employees', to: '/employees', icon: 'people' },
  { id: 'reports', label: 'Reports', to: '/reports', icon: 'file-earmark-bar-graph' },
  { id: 'analytics', label: 'Analytics', to: '/analytics', icon: 'bar-chart' },
  { id: 'notifications', label: 'Notifications', to: '/notifications', icon: 'bell' },
  { id: 'settings', label: 'Settings', to: '/settings', icon: 'gear' },
];

export default function Sidebar({ className = 'app-sidebar', onNavigate }) {
  const navigate = useNavigate();

  // Phase 1 sign-out: shared action clears auth + profile + settings and
  // sends the user to /sign-in. The RequireAuth guard then re-blocks the
  // app until they sign back in. Index-entity data + the order draft are
  // intentionally preserved (per docs/CLIENT_IMAGE_STORAGE.md §7).
  const handleSignOut = useCallback(
    (e) => {
      e.preventDefault();
      signOut();
      navigate('/sign-in', { replace: true });
    },
    [navigate]
  );

  // When the sidebar is rendered inside the mobile drawer we want each
  // link tap to close the drawer — pass the caller's onNavigate down.
  const handleNav = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside className={className}>
      <div className="sidebar-brand d-flex align-items-center gap-2">
        <img
          src="/logo.png"
          alt="Lazy Pygmy logo"
          className="brand-mark"
          width={34}
          height={34}
        />
        <div>
          <div className="fw-bold text-white">Lazy Pygmy</div>
          <div className="small sidebar-suite">
            Inventory Suite
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {ITEMS.map((it) => (
          <NavLink key={it.id} to={it.to} className="nav-link" onClick={handleNav}>
            <i className={`bi bi-${it.icon}`}></i>
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-capacity mb-3">
          <div className="small">Warehouse capacity</div>
          <div className="fs-4 fw-bold text-white font-numeric">71%</div>
          <div className="capacity-line mb-1">
            <span style={{ width: '71%' }}></span>
          </div>
          <div className="small">18,450 of 26,000 units</div>
        </div>
        <NavLink
          to="/sign-in"
          className="nav-link text-light px-2"
          onClick={(e) => {
            handleNav();
            handleSignOut(e);
          }}
        >
          <i className="bi bi-box-arrow-right me-2"></i>Log Out
        </NavLink>
      </div>
    </aside>
  );
}

export const NAV_ITEMS = ITEMS;
