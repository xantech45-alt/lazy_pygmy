import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Pagination from '../../components/Pagination.jsx';
import useIndexTable from '../../hooks/useIndexTable.js';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { money, number } from '../../lib/format.js';

/**
 * WarehouseIndex — replaces warehouses/index.html (PPT slide 19).
 * Audit fix #27: wired the capacity table through useIndexTable for search
 * + filter + sort + bulk-select. The 3 warehouse cards at the top are still
 * driven from `all` because they show full capacity context regardless of
 * filters.
 */
export default function WarehouseIndex() {
  const warehouses = localStorageStore.getWarehouses();

  const filterKeys = useMemo(() => [
    { key: 'status', options: (rows) => [...new Set(rows.map((w) => w.status))] },
    { key: 'location', options: (rows) => [...new Set(rows.map((w) => w.location))] },
  ], []);

  const t = useIndexTable({
    rows: warehouses,
    idKey: 'code',
    searchKeys: ['name', 'code', 'manager'],
    filterKeys,
    initialSort: { key: 'name', asc: true },
  });

  // KPI reads stay driven by the unfiltered set so the cards always show
  // total fleet position.
  const totalCapacity = warehouses.reduce((a, b) => a + b.capacity, 0);
  const totalUnits = warehouses.reduce((a, b) => a + b.units, 0);
  const totalValue = warehouses.reduce((a, b) => a + b.value, 0);
  const utilization = Math.round((totalUnits / totalCapacity) * 100);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Warehouses' }]} />
      <PageHeader
        title="Warehouses"
        subtitle={`${warehouses.length} warehouses · ${number(totalCapacity)} unit capacity · ${number(totalUnits)} units stored · ${utilization}% utilised · ${money(totalValue)} value`}
      >
        <Link to="/warehouses/new" className="btn btn-primary-app">
          + Add Warehouse
        </Link>
      </PageHeader>

      <div className="row g-3 mb-3">
        {warehouses.map((w) => {
          const pct = Math.round((w.units / w.capacity) * 100);
          return (
            <div key={w.code} className="col-xl-4">
              <div className="app-card h-100">
                <div className="card-body-app">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="small-note">{w.code}</div>
                      <h5>
                        <Link to={`/warehouses/${w.code}`}>{w.name}</Link>
                      </h5>
                    </div>
                    <StatusBadge status={w.status} />
                  </div>
                  <div className="small-note">{w.location}</div>
                  <hr />
                  <Row label="Manager" value={w.manager} />
                  <Row label="Stored" value={number(w.units)} />
                  <Row label="Capacity" value={number(w.capacity)} />
                  <div className="progress mt-3" style={{ height: 7 }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${pct}%`, background: 'var(--color-primary)' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`bulk-bar mb-3 ${t.selected.size === 0 ? 'd-none' : ''}`}>
        <strong>{t.selected.size}</strong> selected ·{' '}
        <button className="btn btn-sm btn-link" onClick={t.clearSelection}>Clear</button>
      </div>

      <div className="filter-bar mb-3">
        <div className="row g-2">
          <div className="col-lg-4">
            <input
              id="warehouseSearch"
              name="warehouseSearch"
              className="form-control"
              placeholder="Search by name, code or manager"
              value={t.search.q}
              onChange={(e) => t.search.onChange(e.target.value)}
              aria-label="Search warehouses"
            />
          </div>
          <div className="col-lg-2">
            <select
              id="whStatus"
              name="whStatus"
              className="form-select"
              value={t.filter.values.status || ''}
              onChange={(e) => t.filter.set('status', e.target.value)}
              aria-label="Status filter"
            >
              <option value="">Status: All</option>
              {t.filter.options.status.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="col-lg-2">
            <select
              id="whLocation"
              name="whLocation"
              className="form-select"
              value={t.filter.values.location || ''}
              onChange={(e) => t.filter.set('location', e.target.value)}
              aria-label="Location filter"
            >
              <option value="">Location: All</option>
              {t.filter.options.location.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="app-card overflow-hidden">
        <div className="card-head">
          <h5>Capacity Comparison</h5>
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
                    aria-label="Select all warehouses on this page"
                  />
                </th>
                <th scope="col">Warehouse</th>
                <th scope="col">Manager</th>
                <th scope="col" className="text-end">Units</th>
                <th scope="col" className="text-end">Capacity</th>
                <th scope="col" className="text-end">Available</th>
                <th scope="col">Utilisation</th>
                <th scope="col" className="text-end">Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {t.paged.map((w) => {
                const pct = Math.round((w.units / w.capacity) * 100);
                return (
                  <tr key={w.code}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={t.selected.has(w.code)}
                        onChange={() => t.toggleOne(w.code)}
                        aria-label={`Select ${w.name}`}
                      />
                    </td>
                    <td>
                      <Link to={`/warehouses/${w.code}`}>
                        <strong>{w.code}</strong> {w.name}
                      </Link>
                    </td>
                    <td>{w.manager}</td>
                    <td className="numeric">{number(w.units)}</td>
                    <td className="numeric">{number(w.capacity)}</td>
                    <td className="numeric">{number(w.capacity - w.units)}</td>
                    <td>{pct}%</td>
                    <td className="numeric">{money(w.value)}</td>
                  </tr>
                );
              })}
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

function Row({ label, value }) {
  return (
    <div className="d-flex justify-content-between">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
