import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import RowActionsMenu from '../../components/RowActionsMenu.jsx';
import Pagination from '../../components/Pagination.jsx';
import useIndexTable from '../../hooks/useIndexTable.js';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { exportCsv, money } from '../../lib/format.js';

/**
 * SchoolIndex — replaces schools.html (PPT slide 31).
 * KPI ribbon + filterable, paginated school table.
 * Audit fix #27: wired through useIndexTable for search + filter + sort +
 * pagination + bulk-select. The previous version had decorative selects
 * that did nothing.
 */
const TYPES = ['Primary', 'Secondary', 'Kindergarten', 'Nursery'];

export default function SchoolIndex() {
  const all = localStorageStore.getSchools();

  const filterKeys = useMemo(() => [
    { key: 'county', options: (rows) => [...new Set(rows.map((s) => s.county))] },
    { key: 'type', options: TYPES },
    { key: 'status', options: (rows) => [...new Set(rows.map((s) => s.status))] },
  ], []);

  const t = useIndexTable({
    rows: all,
    idKey: 'code',
    searchKeys: ['name', 'code', 'contact'],
    filterKeys,
    initialSort: { key: 'name', asc: true },
  });

  const totalPupils = all.reduce((a, b) => a + (b.pupils || 0), 0);
  const receivable = all.reduce((a, b) => a + (b.outstanding || 0), 0);
  const owing = all.filter((s) => s.outstanding > 0).length;

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Schools' }]} />
      <PageHeader
        title="School Directory"
        subtitle={`${all.length} active schools · ${totalPupils.toLocaleString()} pupils served · ${money(receivable)} receivable · ${t.filter.options.county.length} counties`}
      >
        <button
          className="btn btn-outline-app"
          disabled
          aria-disabled="true"
          title="Bulk import is not available in this prototype"
        >
          Import
        </button>
        <button
          className="btn btn-outline-app"
          onClick={() =>
            exportCsv(
              'schools.csv',
              all.map((s) => ({
                code: s.code,
                name: s.name,
                type: s.type,
                county: s.county,
                contact: s.contact,
                pupils: s.pupils,
                orders: s.orders,
                total_spend: s.spend.toFixed(2),
                outstanding: (s.outstanding || 0).toFixed(2),
                status: s.status,
              })),
            )
          }
        >
          Export
        </button>
        <Link to="/schools/new" className="btn btn-primary-app">+ Add School</Link>
      </PageHeader>

      <div className="row g-3 mb-3">
        <Tile label="Active schools" value={all.filter((s) => s.status === 'Active').length} note={`across ${t.filter.options.county.length} counties`} />
        <Tile label="Pupils served" value={totalPupils.toLocaleString()} note={`average ${Math.round(totalPupils / Math.max(1, all.length))} per school`} teal />
        <Tile label="Orders this month" value="286" note="+18 vs December" teal />
        <Tile label="Receivable" value={money(receivable)} note={`${owing} schools owing`} red />
      </div>

      <div className={`bulk-bar mb-3 ${t.selected.size === 0 ? 'd-none' : ''}`}>
        <strong>{t.selected.size}</strong> selected ·{' '}
        <button className="btn btn-sm btn-link" onClick={t.clearSelection}>Clear</button>
      </div>

      <div className="filter-bar mb-3">
        <div className="row g-2">
          <div className="col-lg-4">
            <input
              id="schoolSearch"
              name="schoolSearch"
              className="form-control"
              placeholder="Search by name, code or contact"
              value={t.search.q}
              onChange={(e) => t.search.onChange(e.target.value)}
              aria-label="Search schools"
            />
          </div>
          <SimpleFilter id="schoolCounty" label="County" value={t.filter.values.county || ''} onChange={(v) => t.filter.set('county', v)} options={t.filter.options.county} />
          <SimpleFilter id="schoolType" label="Type" value={t.filter.values.type || ''} onChange={(v) => t.filter.set('type', v)} options={t.filter.options.type} />
          <SimpleFilter id="schoolStatus" label="Status" value={t.filter.values.status || ''} onChange={(v) => t.filter.set('status', v)} options={t.filter.options.status} />
        </div>
      </div>

      <div className="app-card overflow-hidden">
        <div className="card-head">
          <h5>All Schools</h5>
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
                    aria-label="Select all schools on this page"
                  />
                </th>
                <th scope="col">
                  <button type="button" className="sort-btn" onClick={() => t.sort.onSort('name')}>School
                    {t.sort.key === 'name' && <i className={`bi bi-caret-${t.sort.asc ? 'up' : 'down'}-fill`} aria-hidden="true"></i>}
                  </button>
                </th>
                <th scope="col">Type</th>
                <th scope="col">County</th>
                <th scope="col">Contact</th>
                <th scope="col" className="text-end">Pupils</th>
                <th scope="col" className="text-end">Orders</th>
                <th scope="col" className="text-end">Total Spend</th>
                <th scope="col" className="text-end">Outstanding</th>
                <th scope="col">Status</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {t.paged.map((s) => {
                const initials = s.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                return (
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
                      <Link className="entity-link" to={`/schools/${s.code}`}>
                        <span className={`mini-avatar ${s.outstanding > 0 ? 'teal' : ''}`}>{initials}</span>
                        <strong>{s.name}</strong>
                        <small>{s.code}</small>
                      </Link>
                    </td>
                    <td>{s.type}</td>
                    <td>{s.county}</td>
                    <td>{s.contact}</td>
                    <td className="numeric">{s.pupils.toLocaleString()}</td>
                    <td className="numeric">{s.orders}</td>
                    <td className="numeric fw-bold">{money(s.spend)}</td>
                    <td className={`numeric fw-bold ${s.outstanding > 0 ? 'text-danger' : ''}`}>
                      {s.outstanding ? money(s.outstanding) : '—'}
                    </td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      <RowActionsMenu
                        viewTo={`/schools/${s.code}`}
                        editTo={`/schools/${s.code}/orders`}
                        label={`Actions for ${s.name}`}
                      />
                    </td>
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

function Tile({ label, value, note, teal, red }) {
  const cls = red ? 'kpi-card kpi-red' : teal ? 'kpi-card kpi-teal' : 'kpi-card';
  return (
    <div className="col-md-3">
      <div className={cls}>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        <div className="kpi-note">{note}</div>
      </div>
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
