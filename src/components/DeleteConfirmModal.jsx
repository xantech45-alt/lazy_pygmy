import { useState, useEffect } from 'react';

/**
 * DeleteConfirmModal — shared destructive-action confirmation modal.
 *
 * Reproduces the canonical Products delete pattern (master-prompt §1.7):
 *   - Consequence copy listing what will be removed/affected
 *   - A required "I understand" checkbox that gates the confirm button
 *   - Disabled until the box is checked
 *
 * Props:
 *   open           — boolean, controls visibility
 *   onClose()      — invoked on backdrop click / Cancel / ×
 *   onConfirm()    — invoked on confirm click (after the gate is ticked)
 *   title          — modal heading
 *   subtitle       — short identifying line under the title (e.g. "BK-0142 · ABC Beginner Book")
 *   consequences   — string[] of bullet items shown in the "Before you delete" block
 *   acknowledge    — label of the "I understand" checkbox
 *   confirmLabel   — text of the destructive button (e.g. "Delete product")
 */
export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Delete this record?',
  subtitle,
  consequences = [],
  acknowledge = 'I understand this cannot be undone.',
  confirmLabel = 'Delete',
}) {
  const [checked, setChecked] = useState(false);

  // Reset the checkbox each time the modal is reopened so an old tick
  // doesn't survive across opens.
  useEffect(() => {
    if (open) setChecked(false);
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="modal-backdrop-app"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="modal-app" role="dialog" aria-modal="true" aria-labelledby="deleteConfirmHeading">
        <div className="modal-app-dialog">
          <div className="modal-app-head">
            <div>
              <h5 id="deleteConfirmHeading" className="mb-0">{title}</h5>
              {subtitle && <div className="small-note mt-1">{subtitle}</div>}
            </div>
            <button className="btn-close-app" aria-label="Close" onClick={onClose}>×</button>
          </div>
          <div className="modal-app-body">
            {consequences.length > 0 && (
              <>
                <p>This action cannot be undone.</p>
                <div className="section-kicker mb-2">Before you delete</div>
                <ul className="mb-3">
                  {consequences.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </>
            )}
            <label className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <span className="form-check-label">{acknowledge}</span>
            </label>
          </div>
          <div className="modal-app-foot">
            <button className="btn btn-outline-app" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-danger-app"
              disabled={!checked}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}