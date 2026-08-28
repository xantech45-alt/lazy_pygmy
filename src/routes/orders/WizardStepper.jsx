/**
 * WizardStepper — Phase 5 polished semantic step indicator.
 *
 * - Uses <ol>/<li> with aria-current="step" on the active item.
 * - Click-to-jump only for completed steps (not the future one).
 * - Shows "✓" on completed steps and the step number otherwise.
 *
 * Props:
 *   - active: 1 | 2 | 3
 *   - completed: array of step indices the user has finished (e.g., [1, 2])
 *   - reachable: array of step indices the user can click into (defaults to
 *                completed so users can re-edit prior steps)
 */
import { Link } from 'react-router-dom';

const STEPS = [
  { n: 1, label: 'Customer & schedule', to: '/orders/new' },
  { n: 2, label: 'Add products', to: '/orders/new/products' },
  { n: 3, label: 'Review & submit', to: '/orders/new/review' },
];

export default function WizardStepper({ active, completed = [], reachable }) {
  const reachableSet = new Set(reachable ?? completed);
  return (
    <ol className="wizard-steps mb-4 list-unstyled" aria-label="Order wizard steps">
      {STEPS.map((s, i) => {
        const isActive = active === s.n;
        const isDone = completed.includes(s.n) && !isActive;
        const canJump = reachableSet.has(s.n) && !isActive;
        const content = (
          <>
            <span aria-hidden="true">{isDone ? '✓' : s.n}</span>
            <span>{s.label}</span>
          </>
        );
        if (canJump) {
          return (
            <li key={s.n} className={`wizard-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
              <Link to={s.to} aria-current={isActive ? 'step' : undefined}>
                {content}
              </Link>
            </li>
          );
        }
        return (
          <li
            key={s.n}
            className={`wizard-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
            aria-current={isActive ? 'step' : undefined}
          >
            {content}
          </li>
        );
      })}
    </ol>
  );
}
