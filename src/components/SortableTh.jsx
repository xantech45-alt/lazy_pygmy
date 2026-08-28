/**
 * SortableTh — a clickable <th> that flips the sort key when clicked.
 * Shows a caret next to the active column. Accessibility: the button
 * receives focus and announces the sort action via aria-label.
 */
export default function SortableTh({ k, sortKey, asc, onSort, children }) {
  const isActive = sortKey === k;
  return (
    <th scope="col">
      <button
        type="button"
        className="sort-btn"
        onClick={() => onSort(k)}
        aria-label={`Sort by ${children}`}
      >
        {children}{' '}
        {isActive && <i className={`bi bi-caret-${asc ? 'up' : 'down'}-fill`} aria-hidden="true"></i>}
      </button>
    </th>
  );
}
