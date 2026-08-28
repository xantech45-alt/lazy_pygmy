/**
 * Format helpers — verbatim port of LP utilities from assets/js/app.js
 * (LP.money, LP.number, LP.csv).
 */
export function money(v) {
  return '$' + Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function number(v) {
  return Number(v || 0).toLocaleString();
}

/**
 * CSV export — verbatim port of LP.csv(filename, rows).
 * Wraps each value in double-quotes, doubles embedded quotes.
 */
export function exportCsv(filename, rows) {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const csv = [keys.map(esc).join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
