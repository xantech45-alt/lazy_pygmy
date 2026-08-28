import { statusClass } from '../lib/status.js';

/**
 * StatusBadge — replaces the inline `<span class="badge-status ${LP.statusClass(s)}">${s}</span>` pattern.
 * Encodes AUDIT_REPORT.md §5.8 keyword rules.
 */
export default function StatusBadge({ status, label }) {
  return <span className={`badge-status ${statusClass(status)}`}>{label ?? status}</span>;
}
