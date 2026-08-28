import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * RowActionsMenu — React-controlled kebab dropdown for a single table row.
 *
 * Renders the existing `.row-menu` trigger button so index tables keep their
 * visual style. Opens a small popover with View / Edit links, both of which
 * auto-close the menu on activation.
 *
 * Closes on:
 *   - click outside (document mousedown, excluding the wrapper)
 *   - Escape (document keydown)
 *   - clicking any menu link
 *
 * Props:
 *   - viewTo  string: route for the "View" link (omit to hide)
 *   - editTo  string: route for the "Edit" link (omit to hide)
 *   - label   string: accessible label for the trigger (defaults to "Row actions")
 */
export default function RowActionsMenu({ viewTo, editTo, label }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const ariaLabel = label || 'Row actions';
  const hasMenu = !!viewTo || !!editTo;

  return (
    <div className="row-actions-wrap" ref={wrapRef}>
      <button
        type="button"
        className="row-menu"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={!hasMenu}
        onClick={() => hasMenu && setOpen((v) => !v)}
      >
        <i className="bi bi-three-dots-vertical" aria-hidden="true"></i>
      </button>
      {open && hasMenu && (
        <div className="row-actions-menu" role="menu" aria-label={ariaLabel}>
          {viewTo && (
            <Link
              to={viewTo}
              role="menuitem"
              className="row-actions-link"
              onClick={() => setOpen(false)}
            >
              <i className="bi bi-eye" aria-hidden="true"></i>
              <span>View</span>
            </Link>
          )}
          {editTo && (
            <Link
              to={editTo}
              role="menuitem"
              className="row-actions-link"
              onClick={() => setOpen(false)}
            >
              <i className="bi bi-pencil" aria-hidden="true"></i>
              <span>Edit</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}