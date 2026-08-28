/**
 * EmptyState — uniform empty-state block with optional icon + badge.
 * Fixes AUDIT_REPORT.md §6.12 (no fabricated business logic — same copy shape
 * as the HTML prototype's ad-hoc "No X in this view" messages).
 */
export default function EmptyState({ icon, title, message, badge }) {
  return (
    <div className="shell-placeholder">
      {icon && <i className={`bi bi-${icon} fs-1 d-block mb-3`}></i>}
      {title && <h4>{title}</h4>}
      {message && (
        <p className="mx-auto" style={{ maxWidth: 650 }}>
          {message}
        </p>
      )}
      {badge && <span className="badge-status badge-draft">{badge}</span>}
    </div>
  );
}
