/**
 * PageHeader — title + subtitle + right-aligned toolbar slot.
 * Mirrors the .page-header pattern repeated on every authenticated page.
 */
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}
      </div>
      <div className="toolbar">{children}</div>
    </div>
  );
}
