/**
 * Status-to-badge-class mapping — verbatim port of LP.statusClass
 * from assets/js/app.js (line 4). Keyword rules per AUDIT_REPORT.md §5.8
 * and master prompt §1.5.
 */
export function statusClass(s) {
  const x = (s || '').toLowerCase();
  if (
    x.includes('out of') ||
    x.includes('cancel') ||
    x === 'unpaid' ||
    x.includes('overdue') ||
    x.includes('rejected') ||
    x.includes('damaged') ||
    x.includes('written off')
  )
    return 'badge-out';
  if (
    x.includes('low') ||
    x.includes('packed') ||
    x.includes('partial') ||
    x.includes('pending') ||
    x.includes('suspended') ||
    x.includes('inspection') ||
    x.includes('transit') ||
    x.includes('short')
  )
    return 'badge-low';
  if (x.includes('processing') || x.includes('approved') || x.includes('dispatched')) return 'badge-processing';
  if (x.includes('draft') || x.includes('inactive')) return 'badge-draft';
  if (x.includes('under review')) return 'badge-under-review';
  return 'badge-instock';
}
