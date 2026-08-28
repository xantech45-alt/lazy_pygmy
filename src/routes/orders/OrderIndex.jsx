import { Link } from 'react-router-dom';
import { useState } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import RowActionsMenu from '../../components/RowActionsMenu.jsx';
import Pagination from '../../components/Pagination.jsx';
import usePagination from '../../hooks/usePagination.js';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { money } from '../../lib/format.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * OrderIndex — replaces orders.html (PPT slide 35).
 * 5 KPI cards + status filter chips + paginated recent-orders table.
 * Audit fix #27: added search + bulk-select + row-actions on top of the
 * existing pill-style status filter chips (the chips are the established
 * UX for this page and were preserved).
 */
const FILTERS = ['All', 'Pending', 'Confirmed', 'Processing', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'];

export default function OrderIndex() {
  const [status, setStatus] = useState('All');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(new Set());
  const all = localStorageStore.getOrders();
  const term = q.toLowerCase();
  const filtered = all
    .filter((o) => (status === 'All' || o.status === status))
    .filter((o) => !term || (o.order + o.school + o.officer).toLowerCase().includes(term));
  const { page, pageSize, setPage, setPageSize, paged, total } = usePagination(filtered);
  const toast = useToast();

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map((o) => o.order)));
  };
  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Orders' }]} />
      <PageHeader
        title="Orders Dashboard"
        subtitle="286 orders this month · $18,640 revenue · 24 awaiting processing · 12 ready to dispatch"
      >
        <button className="btn btn-outline-app" onClick={() => toast(`Export queued (orders.csv, ${filtered.length} rows).`)}>Export</button>
        <Link to="/orders/new" className="btn btn-primary-app">+ New Order</Link>
      </PageHeader>

      <div className="row g-3 mb-3">
        <KpiTile label="Orders this month" value="286" note="+18 vs December" />
        <KpiTile label="Awaiting processing" value="24" note="8 over 48 hrs" amber />
        <KpiTile label="Ready to dispatch" value="12" note="3 routes today" />
        <KpiTile label="Delivered" value="168" note="59% of month" green />
        <KpiTile label="Revenue" value="$18,640" note="+12.8% vs Dec" teal />
      </div>

      <div className={`bulk-bar mb-3 ${selected.size === 0 ? 'd-none' : ''}`}>
        <strong>{selected.size}</strong> selected ·{' '}
        <button className="btn btn-sm btn-link" onClick={() => setSelected(new Set())}>Clear</button>
      </div>

      <div className="filter-bar mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-lg-4">
            <input
              id="orderSearch"
              name="orderSearch"
              className="form-control"
              placeholder="Search by order #, school or officer"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
              aria-label="Search orders"
            />
          </div>
          <div className="col-lg-8 d-flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`btn btn-sm ${status === f ? 'btn-primary-app' : 'btn-outline-app'}`}
                onClick={() => { setStatus(f); setPage(0); }}
                aria-pressed={status === f}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="app-card">
        <div className="card-head d-flex justify-content-between">
          <h3 className="card-heading">Recent Orders</h3>
          <strong className="text-primary">Newest first</strong>
        </div>
        <div className="table-responsive">
          <table className="table table-app">
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={paged.length > 0 && selected.size === paged.length}
                    onChange={toggleAll}
                    aria-label="Select all orders on this page"
                  />
                </th>
                <th scope="col">Order</th>
                <th scope="col">School</th>
                <th scope="col">Date</th>
                <th scope="col" className="text-end">Items</th>
                <th scope="col" className="text-end">Units</th>
                <th scope="col" className="text-end">Total</th>
                <th scope="col">Payment</th>
                <th scope="col">Status</th>
                <th scope="col">Officer</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {paged.map((o) => (
                <tr key={o.order}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selected.has(o.order)}
                      onChange={() => toggleOne(o.order)}
                      aria-label={`Select order ${o.order}`}
                    />
                  </td>
                  <td className="sku">
                    <Link to={`/orders/${o.order}`}>{o.order}</Link>
                  </td>
                  <td>{o.school}</td>
                  <td>{o.date}</td>
                  <td className="numeric">{o.items}</td>
                  <td className="numeric">{o.units.toLocaleString()}</td>
                  <td className="numeric fw-bold">{money(o.total)}</td>
                  <td><StatusBadge status={o.payment} /></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{o.officer}</td>
                  <td>
                    <RowActionsMenu
                      viewTo={`/orders/${o.order}`}
                      editTo={`/orders/${o.order}/processing`}
                      label={`Actions for order ${o.order}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-toolbar">
          <span className="small-note">Unpaid orders over 14 days move to Overdue automatically</span>
        </div>
        <div className="card-body-app">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(n) => { setPageSize(n); setPage(0); }}
          />
        </div>
      </div>
    </>
  );
}

function KpiTile({ label, value, note, amber, green, teal }) {
  const cls = teal ? 'kpi-card kpi-teal' : green ? 'kpi-card kpi-green' : amber ? 'kpi-card kpi-amber' : 'kpi-card';
  return (
    <div className="col">
      <div className={cls}>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        <div className="kpi-note">{note}</div>
      </div>
    </div>
  );
}
