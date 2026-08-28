import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import RowActionsMenu from '../../components/RowActionsMenu.jsx';
import KpiCard from '../../components/KpiCard.jsx';
import Pagination from '../../components/Pagination.jsx';
import useIndexTable from '../../hooks/useIndexTable.js';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { money } from '../../lib/format.js';

/**
 * SupplierIndex — replaces suppliers/index.html (PPT slide 25).
 * KPI ribbon + paginated all-suppliers table from LPStore.getSuppliers().
 * Audit fix #27: wired through useIndexTable for search + filter + sort +
 * pagination + bulk-select. The previous version had decorative selects
 * that did nothing.
 *
 * Audit fix NAV-04: any `?q=…` link (e.g. from a dashboard card) now
 * pre-populates the search field so the link's intent is honoured.
 */
export default function SupplierIndex() {
  const suppliers = localStorageStore.getSuppliers();
  const active = suppliers.filter((s) => s.status === 'Active').length;
  const review = suppliers.filter((s) => s.status === 'Under Review').length;
  const inactive = suppliers.filter((s) => s.status === 'Inactive').length;
  const outstanding = suppliers.reduce((a, b) => a + (b.outstanding || 0), 0);
  const avgRating = suppliers.length === 0 ? 0 : (suppliers.reduce((a, b) => a + (b.rating || 0), 0) / suppliers.length).toFixed(1);

  const filterKeys = useMemo(() => [
    { key: 'location', options: (rows) => [...new Set(rows.map((s) => s.location))] },
    { key: 'terms', options: (rows) => [...new Set(rows.map((s) => s.terms))] },
    { key: 'status', options: (rows) => [...new Set(rows.map((s) => s.status))] },
  ], []);

  const t = useIndexTable({
    rows: suppliers,
    idKey: 'code',
    searchKeys: ['name', 'code', 'contact'],
    filterKeys,
    initialSort: { key: 'name', asc: true },
  });

  // Honour an incoming `?q=…` link so cross-page deep links actually
  // narrow the table. We only set the search box when the URL has the
  // param and the user hasn't already typed something — otherwise we'd
  // clobber local edits on re-render.
  const [searchParams] = useSearchParams();
  const incomingQ = searchParams.get('q') || '';
  useEffect(() => {
    if (incomingQ && t.search.q !== incomingQ) {
      t.search.onChange(incomingQ);
    }
    // We intentionally only react to URL changes — depending on t.search.q
    // would cause an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingQ]);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Suppliers' }]} />
      <PageHeader
        title="Supplier Directory"
        subtitle={`${suppliers.length} suppliers · ${suppliers.filter((s) => (s.outstanding || 0) > 0).length} with outstanding balances · ${money(outstanding)} payable · average rating ${avgRating} / 5`}
      >
        <Link to="/suppliers/new" className="btn btn-primary-app">+ Add Supplier</Link>
      </PageHeader>

      <div className="row g-3 mb-3">
        <KpiTile label="Active suppliers" value={active} note="across 6 counties" />
        <KpiTile label="Under review" value={review} note="delivery issues" />
        <KpiTile label="Inactive" value={inactive} note="no orders in 12 months" />
        <KpiTile label="Outstanding payable" value={money(outstanding)} note={`${suppliers.filter((s) => (s.outstanding || 0) > 0).length} suppliers`} />
      </div>

      <div className={`bulk-bar mb-3 ${t.selected.size === 0 ? 'd-none' : ''}`}>
        <strong>{t.selected.size}</strong> selected ·{' '}
        <button className="btn btn-sm btn-link" onClick={t.clearSelection}>Clear</button>
      </div>

      <div className="filter-bar mb-3">
        <div className="row g-2">
          <div className="col-lg-4">
            <input
              id="supplierSearch"
              name="supplierSearch"
              className="form-control"
              placeholder="Search by name, code or contact"
              value={t.search.q}
              onChange={(e) => t.search.onChange(e.target.value)}
              aria-label="Search suppliers"
            />
          </div>
          <SimpleFilter id="supCounty" label="County" value={t.filter.values.location || ''} onChange={(v) => t.filter.set('location', v)} options={t.filter.options.location} />
          <SimpleFilter id="supTerms" label="Terms" value={t.filter.values.terms || ''} onChange={(v) => t.filter.set('terms', v)} options={t.filter.options.terms} />
          <SimpleFilter id="supStatus" label="Status" value={t.filter.values.status || ''} onChange={(v) => t.filter.set('status', v)} options={t.filter.options.status} />
        </div>
      </div>

      <div className="app-card overflow-hidden">
        <div className="card-head d-flex justify-content-between flex-wrap gap-2">
          <h5>All Suppliers</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-app">
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={t.paged.length > 0 && t.selected.size === t.paged.length}
                    onChange={t.toggleAll}
                    aria-label="Select all suppliers on this page"
                  />
                </th>
                <th scope="col">
                  <button type="button" className="sort-btn" onClick={() => t.sort.onSort('name')}>Supplier
                    {t.sort.key === 'name' && <i className={`bi bi-caret-${t.sort.asc ? 'up' : 'down'}-fill`} aria-hidden="true"></i>}
                  </button>
                </th>
                <th scope="col">Location</th>
                <th scope="col">Contact</th>
                <th scope="col">Terms</th>
                <th scope="col" className="text-end">Products</th>
                <th scope="col" className="text-end">Purchases</th>
                <th scope="col" className="text-end">Outstanding</th>
                <th scope="col" className="text-end">Rating</th>
                <th scope="col">Status</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {t.paged.map((s) => (
                <tr key={s.code}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={t.selected.has(s.code)}
                      onChange={() => t.toggleOne(s.code)}
                      aria-label={`Select ${s.name}`}
                    />
                  </td>
                  <td>
                    <Link to={`/suppliers/${s.code}`}>
                      <strong>{s.code}</strong> {s.name}
                    </Link>
                  </td>
                  <td>{s.location}</td>
                  <td>{s.contact}</td>
                  <td>{s.terms}</td>
                  <td className="numeric">{s.products}</td>
                  <td className="numeric">{money(s.purchases)}</td>
                  <td className="numeric">{s.outstanding ? money(s.outstanding) : '—'}</td>
                  <td className="numeric fw-bold">{s.rating ?? '—'}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    <RowActionsMenu
                      viewTo={`/suppliers/${s.code}`}
                      editTo={`/suppliers/${s.code}/products`}
                      label={`Actions for ${s.name}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-body-app">
          <Pagination
            page={t.page}
            pageSize={t.pageSize}
            total={t.total}
            onPageChange={t.setPage}
            onPageSizeChange={t.setPageSize}
          />
        </div>
      </div>
    </>
  );
}

function KpiTile({ label, value, note }) {
  return (
    <div className="col-md-3">
      <KpiCard label={label} value={value} />
      <div className="small-note mt-1 ms-1">{note}</div>
    </div>
  );
}

function SimpleFilter({ id, label, value, onChange, options }) {
  return (
    <div className="col-lg-2">
      <select
        id={id}
        name={id}
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} filter`}
      >
        <option value="">{label}: All</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
