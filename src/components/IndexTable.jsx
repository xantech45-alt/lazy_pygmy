import SelectFilter from './SelectFilter.jsx';
import SortableTh from './SortableTh.jsx';

/**
 * IndexTable — presentation chrome for the standard list page:
 *   - search input + filter dropdowns
 *   - bulk-select checkbox column + "X selected" bar
 *   - sortable <th> buttons
 *   - id-keyed <tr> rows with a single bulk-select cell
 *
 * The caller passes the bulk of the data + a renderRow(row) that emits
 * the <td> cells. The rechromatographing of mass feature flags is
 * centralised here so every list page looks and behaves the same way.
 */
export default function IndexTable({
  id,
  search,
  sort,
  filter,
  selected,
  paged,
  total,
  page,
  pageSize,
  setPage,
  setPageSize,
  toggleAll,
  toggleOne,
  clearSelection,
  bulkLabel,
  columns,
  rowId,
  renderRow,
  toolbarExtras,
  pagination,
  onExport,
}) {
  return (
    <>
      <div className={`bulk-bar mb-3 ${selected.size === 0 ? 'd-none' : ''}`}>
        <strong>{selected.size}</strong> selected ·{' '}
        <button className="btn btn-sm btn-link" onClick={clearSelection}>
          Clear
        </button>
      </div>

      <div className="filter-bar mb-3">
        <div className="row g-2">
          <div className="col-12 col-md-6 col-lg-4">
            <input
              id={`${id}Search`}
              name={`${id}Search`}
              className="form-control"
              placeholder={search.placeholder || 'Search…'}
              value={search.q}
              onChange={(e) => search.onChange(e.target.value)}
              aria-label="Search this list"
            />
          </div>
          {filter.keys.map((fk) => (
            <div key={fk} className="col-6 col-md-3 col-lg-2">
              <SelectFilter
                id={`${id}-${fk}`}
                value={filter.values[fk] || ''}
                onChange={(v) => filter.set(fk, v)}
                label={fk.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                options={filter.options[fk] || []}
              />
            </div>
          ))}
          {toolbarExtras}
          {onExport && (
            <div className="col-auto ms-auto">
              <button className="btn btn-outline-app" onClick={onExport} type="button">
                Export CSV
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="app-card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-app" id={id}>
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={paged.length > 0 && selected.size === paged.length}
                    onChange={toggleAll}
                    aria-label={`Select all ${bulkLabel || 'rows'} on this page`}
                  />
                </th>
                {columns.map((c) =>
                  c.sortable ? (
                    <SortableTh key={c.key} k={c.key} sortKey={sort.key} asc={sort.asc} onSort={sort.onSort}>
                      {c.label}
                    </SortableTh>
                  ) : (
                    <th key={c.key} scope="col">{c.label}</th>
                  )
                )}
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => (
                <tr key={row[rowId]}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selected.has(row[rowId])}
                      onChange={() => toggleOne(row[rowId])}
                      aria-label={`Select ${row.name || row[rowId]}`}
                    />
                  </td>
                  {renderRow(row)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-body-app">
          {pagination || (
            <div className="d-flex justify-content-between small-note">
              <span>Showing {paged.length === 0 ? 0 : page * pageSize + 1}–{page * pageSize + paged.length} of {total}</span>
              <span>
                <button className="btn btn-sm btn-outline-app" disabled={page === 0} onClick={() => setPage(page - 1)}>‹ Prev</button>
                <span className="mx-2">Page {page + 1} of {Math.max(1, Math.ceil(total / pageSize))}</span>
                <button className="btn btn-sm btn-outline-app" disabled={(page + 1) * pageSize >= total} onClick={() => setPage(page + 1)}>Next ›</button>
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
