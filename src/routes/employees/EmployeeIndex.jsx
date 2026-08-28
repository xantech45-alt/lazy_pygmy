import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import RowActionsMenu from '../../components/RowActionsMenu.jsx';
import Pagination from '../../components/Pagination.jsx';
import useIndexTable from '../../hooks/useIndexTable.js';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { useToast } from '../../components/ToastProvider.jsx';

const DEPTS = ['Management', 'Operations', 'Warehousing', 'Finance', 'Logistics', 'Procurement', 'Sales'];
const LOCATIONS = ['Head Office', 'WH-01 Central', 'WH-02 Paynesville', 'WH-03 Gbarnga'];

/**
 * EmployeeIndex — replaces employees.html (PPT slide 43).
 * Audit fix #27: wired through useIndexTable for search + filter + sort +
 * pagination + bulk-select + reset (replaces 4 unconnected decorators).
 */
export default function EmployeeIndex() {
  const all = localStorageStore.getEmployees();
  const toast = useToast();

  const filterKeys = useMemo(() => [
    { key: 'role', options: (rows) => [...new Set(rows.map((e) => e.role))] },
    { key: 'location', options: LOCATIONS },
    { key: 'department', options: DEPTS },
    { key: 'status', options: ['Active', 'Suspended'] },
  ], []);

  const t = useIndexTable({
    rows: all,
    idKey: 'number',
    searchKeys: ['name', 'number', 'email'],
    filterKeys,
    initialSort: { key: 'name', asc: true },
  });

  const active = all.filter((e) => e.status === 'Active').length;
  const suspended = all.filter((e) => e.status === 'Suspended').length;
  const rolesInUse = new Set(all.map((e) => e.role)).size;

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Employees' }]} />
      <PageHeader
        title="Employee Directory"
        subtitle={`${all.length} employees · ${rolesInUse} roles · ${LOCATIONS.length} locations · ${suspended} account suspended`}
      >
        <button className="btn btn-outline-app" onClick={() => toast(`Export queued (employees.csv, ${t.rows.length} rows).`)}>Export</button>
        <Link to="/employees/new" className="btn btn-primary-app">+ Add Employee</Link>
      </PageHeader>

      <div className="row g-3 mb-3">
        <Tile label="Total employees" value={all.length} note={`across ${LOCATIONS.length} locations`} />
        <Tile label="Active accounts" value={active} note="logged in this week" green />
        <Tile label="Suspended" value={suspended} note="pending HR review" amber />
        <Tile label="Roles in use" value={rolesInUse} note={`of ${rolesInUse} defined`} teal />
      </div>

      <div className={`bulk-bar mb-3 ${t.selected.size === 0 ? 'd-none' : ''}`}>
        <strong>{t.selected.size}</strong> selected ·{' '}
        <button className="btn btn-sm btn-link" onClick={t.clearSelection}>Clear</button>
      </div>

      <div className="filter-bar mb-3">
        <div className="row g-2">
          <div className="col-lg-3">
            <input
              id="employeeSearch"
              name="employeeSearch"
              className="form-control"
              placeholder="Search by name, number or email"
              value={t.search.q}
              onChange={(e) => t.search.onChange(e.target.value)}
              aria-label="Search employees"
            />
          </div>
          <SimpleFilter id="empRole" label="Role" value={t.filter.values.role || ''} onChange={(v) => t.filter.set('role', v)} options={t.filter.options.role} />
          <SimpleFilter id="empLocation" label="Location" value={t.filter.values.location || ''} onChange={(v) => t.filter.set('location', v)} options={t.filter.options.location} />
          <SimpleFilter id="empDept" label="Department" value={t.filter.values.department || ''} onChange={(v) => t.filter.set('department', v)} options={t.filter.options.department} />
          <SimpleFilter id="empStatus" label="Status" value={t.filter.values.status || ''} onChange={(v) => t.filter.set('status', v)} options={t.filter.options.status} />
          <div className="col-lg-1">
            <button className="btn btn-outline-app w-100" type="button" onClick={() => { t.reset(); }}>Reset</button>
          </div>
        </div>
      </div>

      <div className="app-card overflow-hidden">
        <div className="card-head">
          <h3 className="card-heading">All Employees</h3>
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
                    aria-label="Select all employees on this page"
                  />
                </th>
                <th scope="col">
                  <button type="button" className="sort-btn" onClick={() => t.sort.onSort('name')}>Employee
                    {t.sort.key === 'name' && <i className={`bi bi-caret-${t.sort.asc ? 'up' : 'down'}-fill`} aria-hidden="true"></i>}
                  </button>
                </th>
                <th scope="col">Role</th>
                <th scope="col">Department</th>
                <th scope="col">Location</th>
                <th scope="col">Phone</th>
                <th scope="col">Employed</th>
                <th scope="col">Status</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {t.paged.map((e) => {
                const initials = e.name.split(' ').map((n) => n[0]).join('');
                return (
                  <tr key={e.number}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={t.selected.has(e.number)}
                        onChange={() => t.toggleOne(e.number)}
                        aria-label={`Select ${e.name}`}
                      />
                    </td>
                    <td>
                      <Link className="entity-link" to={`/employees/${e.number}`}>
                        <span className={`mini-avatar ${e.status === 'Active' ? 'teal' : ''}`}>{initials}</span>
                        <strong>{e.name}</strong>
                        <small>{e.number}</small>
                      </Link>
                    </td>
                    <td>{e.role}</td>
                    <td>{e.department}</td>
                    <td>{e.location}</td>
                    <td>{e.phone}</td>
                    <td>{e.employed}</td>
                    <td><StatusBadge status={e.status} /></td>
                    <td>
                      <RowActionsMenu
                        viewTo={`/employees/${e.number}`}
                        editTo={`/employees/${e.number}/edit`}
                        label={`Actions for ${e.name}`}
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

function Tile({ label, value, note, green, amber, teal }) {
  const cls = teal ? 'kpi-card kpi-teal' : green ? 'kpi-card kpi-green' : amber ? 'kpi-card kpi-amber' : 'kpi-card';
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
