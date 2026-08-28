/**
 * Pagination — shared list-pagination control.
 *
 * Uses Bootstrap 5 default .pagination / .page-item / .page-link classes
 * (the static HTML prototype does not define custom pagination styles).
 *
 * Props:
 *   page       — current 0-indexed page
 *   pageSize   — rows per page
 *   total      — total row count
 *   onPageChange(page) — invoked when the user changes page
 *   onPageSizeChange(size) — invoked when the user changes page size
 */
const PAGE_SIZES = [10, 25, 50];

export default function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(0, page), pageCount - 1);
  const start = total === 0 ? 0 : safePage * pageSize + 1;
  const end = Math.min(total, (safePage + 1) * pageSize);

  // Build a compact window of page numbers: always show 1, current ± 1, last.
  const pages = [];
  const push = (p) => {
    if (p >= 0 && p < pageCount && !pages.includes(p)) pages.push(p);
  };
  push(0);
  push(pageCount - 1);
  push(safePage - 1);
  push(safePage);
  push(safePage + 1);
  pages.sort((a, b) => a - b);

  const ellipsisBefore = pages[0] > 0;
  const ellipsisAfter = pages[pages.length - 1] < pageCount - 1;

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
      <div className="text-muted-app small">
        {total === 0
          ? '0 results'
          : `Showing ${start}–${end} of ${total}`}
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2 gap-sm-3">
        <label className="d-flex align-items-center gap-2 small text-muted-app mb-0">
          <span>Rows per page</span>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Rows per page"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <nav aria-label="Pagination">
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${safePage === 0 ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                aria-label="Previous page"
                disabled={safePage === 0}
                onClick={() => onPageChange(safePage - 1)}
              >
                ‹
              </button>
            </li>

            {ellipsisBefore && (
              <li className="page-item disabled"><span className="page-link">…</span></li>
            )}

            {pages.map((p) => (
              <li key={p} className={`page-item ${p === safePage ? 'active' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  aria-current={p === safePage ? 'page' : undefined}
                  onClick={() => onPageChange(p)}
                >
                  {p + 1}
                </button>
              </li>
            ))}

            {ellipsisAfter && (
              <li className="page-item disabled"><span className="page-link">…</span></li>
            )}

            <li className={`page-item ${safePage >= pageCount - 1 ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                aria-label="Next page"
                disabled={safePage >= pageCount - 1}
                onClick={() => onPageChange(safePage + 1)}
              >
                ›
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}