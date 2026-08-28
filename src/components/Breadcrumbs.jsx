import { Link } from 'react-router-dom';

/**
 * Breadcrumbs — replaces the per-page <ol class="breadcrumb"> blocks.
 * Pass `items` as an array of { label, to? } (to omitted for the last item).
 */
export default function Breadcrumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="breadcrumb">
      <ol className="breadcrumb">
        {items.map((it, i) => (
          <li key={i} className={`breadcrumb-item${i === items.length - 1 ? ' active' : ''}`}>
            {i < items.length - 1 && it.to ? <Link to={it.to}>{it.label}</Link> : it.label}
          </li>
        ))}
      </ol>
    </nav>
  );
}
