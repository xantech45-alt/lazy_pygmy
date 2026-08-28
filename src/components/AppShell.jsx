import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

/**
 * AppShell — layout wrapper for every authenticated page.
 * Replaces the imperative mount() of app-shell.js with a single Outlet-driven
 * layout.
 *
 * Mobile off-canvas is React-controlled (no Bootstrap JS bundle), so the
 * hamburger button in <Topbar/> can open/close it via the `onOpenMobileNav`
 * callback we hand down. The offcanvas closes on backdrop click, on the X
 * button, and whenever the user navigates (route change), keeping the
 * sidebar out of the way on small screens.
 */
export default function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const openNav = useCallback(() => setNavOpen(true), []);
  const closeNav = useCallback(() => setNavOpen(false), []);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar onOpenMobileNav={openNav} />
        <main className="content-wrap">
          <Outlet />
        </main>
      </div>
      <MobileNavOffcanvas open={navOpen} onClose={closeNav} />
    </div>
  );
}

/**
 * MobileNavOffcanvas — left-sliding drawer reusing <Sidebar/> inner content.
 * Mirrors the #mobileNav / #mobileNavBody structure from app-shell.js but
 * with React state instead of Bootstrap's data-bs-dismiss attributes, so it
 * works without the Bootstrap JS bundle.
 */
function MobileNavOffcanvas({ open, onClose }) {
  if (!open) return null;
  return (
    <>
      <button
        type="button"
        className="modal-backdrop-app mobile-nav-backdrop"
        aria-label="Close navigation"
        onClick={onClose}
      ></button>
      <aside
        className="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
      >
        <div className="offcanvas-header">
          <h5 className="m-0">Lazy Pygmy</h5>
          <button
            type="button"
            className="btn-close-app"
            aria-label="Close navigation"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="offcanvas-body p-0 d-flex flex-column">
          <Sidebar className="" onNavigate={onClose} />
        </div>
      </aside>
    </>
  );
}
