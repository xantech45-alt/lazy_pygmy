/**
 * QtyControl — minus/plus buttons + numeric input, used in the order wizard.
 * Applies the Math.max(1, qty) floor used in orders.js.
 * Closes AUDIT_REPORT.md §6.7 (aria-labels).
 */
export default function QtyControl({ value, onChange, min = 1, ariaLabel }) {
  const dec = () => onChange(Math.max(min, (value || min) - 1));
  const inc = () => onChange((value || min) + 1);
  return (
    <div className="qty-control">
      <button type="button" aria-label={`Decrease ${ariaLabel || 'quantity'}`} onClick={dec}>
        −
      </button>
      <input
        type="number"
        min={min}
        value={value}
        aria-label={ariaLabel || 'Quantity'}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || min))}
      />
      <button type="button" aria-label={`Increase ${ariaLabel || 'quantity'}`} onClick={inc}>
        +
      </button>
    </div>
  );
}
