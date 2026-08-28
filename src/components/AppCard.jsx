/**
 * AppCard — generic content card with optional head section + body.
 * Mirrors .app-card, .card-head, .card-body-app CSS pattern.
 */
export default function AppCard({ head, body, className = '', children }) {
  return (
    <div className={`app-card ${className}`}>
      {head && <div className="card-head">{head}</div>}
      {(body || children) && <div className="card-body-app">{body ?? children}</div>}
    </div>
  );
}
