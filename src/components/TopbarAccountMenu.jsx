/**
 * TopbarAccountMenu — Phase 3 account dropdown.
 *
 * Replaces the static "MK / Moses Kollie" block in Topbar with a real
 * accessible menu button. Items: My profile, Settings, Sign out.
 *
 * Accessibility:
 *   - The trigger button carries aria-haspopup="menu" and aria-expanded.
 *   - Escape closes and returns focus to the trigger.
 *   - Click-outside closes without losing focus.
 *   - Menu items are <Link> or <button>; the menu has role="menu".
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from '../state/signOut.js';
import { useUserProfile } from '../state/UserProfileContext.jsx';
import { useImageAsset } from '../data-access/useImageAsset.js';

export default function TopbarAccountMenu() {
  const { profile, initials } = useUserProfile();
  const { url: avatarUrl } = useImageAsset(profile.photoAssetId);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to trigger per WAI-ARIA menu button pattern.
    triggerRef.current?.focus();
  }, []);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    },
    [close]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const onSignOut = (e) => {
    e.preventDefault();
    signOut();
    navigate('/sign-in', { replace: true });
  };

  return (
    <div
      className="account-menu"
      onKeyDown={onKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        className="account-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${profile.displayName}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="avatar" aria-hidden="true">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="avatar-img"
              width={32}
              height={32}
            />
          ) : (
            initials
          )}
        </span>
        <span className="d-none d-md-inline lh-sm text-start">
          <span className="fw-bold small d-block">{profile.displayName}</span>
        </span>
        <i className="bi bi-chevron-down small ms-1" aria-hidden="true"></i>
      </button>
      {open && (
        <div
          ref={menuRef}
          className="account-menu-list"
          role="menu"
          aria-label="Account"
        >
          <Link to="/profile" role="menuitem" onClick={close}>
            <i className="bi bi-person" aria-hidden="true"></i>
            My profile
          </Link>
          <Link to="/settings" role="menuitem" onClick={close}>
            <i className="bi bi-gear" aria-hidden="true"></i>
            Settings
          </Link>
          <hr />
          <button type="button" role="menuitem" onClick={onSignOut}>
            <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
