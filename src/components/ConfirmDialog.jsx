import { useState, useEffect } from 'react';

/**
 * ConfirmDialog — generic confirm-before-submit modal.
 *
 * Distinct from DeleteConfirmModal (which is for *destructive removal*).
 * This is for *irreversible submission* of a new transaction — GRN posting,
 * stock adjustment, transfer submission, return approval — where the data
 * already exists on the form but the user has one last chance to back out
 * before the value moves. Same gate pattern: a required "I understand"
 * checkbox that controls whether the primary action button is enabled.
 *
 * Props:
 *   open           — boolean
 *   onClose()      — backdrop click / Cancel / ×
 *   onConfirm()    — invoked after the gate is ticked
 *   title          — heading
 *   summary        — short body paragraph stating what's about to happen
 *   consequences   — string[] of bullets shown in the "What happens next" block
 *   acknowledge    — label of the "I understand" checkbox
 *   confirmLabel   — text of the primary button (e.g. "Post receipt")
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm submission',
  summary,
  consequences = [],
  acknowledge = 'I have reviewed the details above and want to proceed.',
  confirmLabel = 'Confirm',
}) {
  const [checked, setChecked] = useState(false);

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
      <div className="modal-app" role="dialog" aria-modal="true" aria-labelledby="confirmDialogHeading">
        <div className="modal-app-dialog">
          <div className="modal-app-head">
            <h5 id="confirmDialogHeading" className="mb-0">{title}</h5>
            <button className="btn-close-app" aria-label="Close" onClick={onClose}>×</button>
          </div>
          <div className="modal-app-body">
            {summary && <p>{summary}</p>}
            {consequences.length > 0 && (
              <>
                <div className="section-kicker mb-2">What happens next</div>
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
              className="btn btn-primary-app"
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