/**
 * KpiCard — KPI tile used on the dashboard (5-up grid) and overview cards.
 * Variants: teal / green / amber / red / gray / mint (left-border color).
 * Plain numbers render via Arial font (font-numeric).
 */
import { brand } from '../lib/brand.js';

export default function KpiCard({ label, value, trend, trendColor, variant }) {
  const style = variantStyle(variant);
  return (
    <div className="kpi-card" style={style}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value font-numeric">{value}</div>
      {trend && (
        <div
          className="kpi-trend font-numeric"
          style={trendColor ? { color: trendColor } : undefined}
        >
          {trend}
        </div>
      )}
    </div>
  );
}

function variantStyle(v) {
  switch (v) {
    case 'teal':
      return { borderLeftColor: brand.accentTeal };
    case 'green':
      return { borderLeftColor: 'var(--color-success)' };
    case 'amber':
      return { borderLeftColor: 'var(--color-warning)' };
    case 'red':
      return { borderLeftColor: 'var(--color-danger)' };
    case 'gray':
      return { borderLeftColor: 'var(--color-text-faint)' };
    case 'mint':
      return { borderLeftColor: brand.accentTealLight };
    default:
      return undefined;
  }
}
