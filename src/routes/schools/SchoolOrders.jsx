import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { exportCsv, money } from '../../lib/format.js';

/**
 * SchoolOrders — replaces schools/orders.html (PPT slide 34).
 * 4 KPIs + Order History table for one school.
 */
const ORDERS = [
  { id: 'ORD-2026-0084', date: '6 Jan 2026', items: 6, units: 420, subtotal: 1344, discount: -60, total: 1284, payment: 'Paid', status: 'Delivered' },
  { id: 'ORD-2025-0071', date: '12 Dec 2025', items: 4, units: 260, subtotal: 780, discount: -38, total: 742, payment: 'Paid', status: 'Delivered' },
  { id: 'ORD-2025-0058', date: '18 Nov 2025', items: 5, units: 210, subtotal: 652, discount: -32, total: 620, payment: 'Paid', status: 'Delivered' },
  { id: 'ORD-2025-0044', date: '9 Oct 2025', items: 3, units: 180, subtotal: 550, discount: -26, total: 524, payment: 'Paid', status: 'Delivered' },
  { id: 'ORD-2025-0031', date: '15 Sep 2025', items: 4, units: 120, subtotal: 326, discount: -16, total: 310, payment: 'Paid', status: 'Delivered' },
  { id: 'ORD-2025-0022', date: '21 Jul 2025', items: 2, units: 90, subtotal: 234, discount: -12, total: 222, payment: 'Paid', status: 'Delivered' },
  { id: 'ORD-2025-0016', date: '12 Jun 2025', items: 3, units: 70, subtotal: 189, discount: -9, total: 180, payment: 'Paid', status: 'Delivered' },
  { id: 'ORD-2025-0009', date: '28 Apr 2025', items: 2, units: 45, subtotal: 116, discount: -6, total: 110, payment: 'Paid', status: 'Delivered' },
];

export default function SchoolOrders() {
  const { code } = useParams();
  const school = localStorageStore.getSchools().find((s) => s.code === code);

  if (!school) {
    return (
      <>
        <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Schools', to: '/schools' }, { label: 'Not found' }]} />
        <div className="page-header">
          <h1 className="page-title">School not found</h1>
          <Link to="/schools" className="btn btn-outline-app">Back</Link>
        </div>
      </>
    );
  }

  const units = ORDERS.reduce((a, b) => a + b.units, 0);
  const total = ORDERS.reduce((a, b) => a + b.total, 0);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Schools', to: '/schools' },
          { label: school.code, to: `/schools/${school.code}` },
          { label: 'Orders' },
        ]}
      />
      <PageHeader
        title="School Order History"
        subtitle={`${school.name} · ${school.orders} orders since Feb 2022 · all invoices settled · no open balance`}
      >
        <button
          className="btn btn-outline-app"
          onClick={() =>
            exportCsv(
              `statement-${school.code}.csv`,
              ORDERS.map((o) => ({
                order: o.id,
                date: o.date,
                items: o.items,
                units: o.units,
                subtotal: o.subtotal.toFixed(2),
                discount: o.discount.toFixed(2),
                total: o.total.toFixed(2),
                payment: o.payment,
                status: o.status,
              })),
            )
          }
        >
          Statement
        </button>
        <button
          className="btn btn-outline-app"
          onClick={() =>
            exportCsv(
              `orders-${school.code}.csv`,
              ORDERS.map((o) => ({
                order: o.id,
                date: o.date,
                items: o.items,
                units: o.units,
                subtotal: o.subtotal.toFixed(2),
                discount: o.discount.toFixed(2),
                total: o.total.toFixed(2),
                payment: o.payment,
                status: o.status,
              })),
            )
          }
        >
          Export
        </button>
        <Link to="/orders/new" className="btn btn-primary-app">+ New Order</Link>
      </PageHeader>

      <div className="row g-3 mb-3">
        <Tile label="Orders placed" value={school.orders} />
        <Tile label="Units purchased" value={units.toLocaleString()} teal />
        <Tile label="Lifetime spend" value={money(school.spend)} teal />
        <Tile label="Average order" value={money(school.spend / school.orders)} />
      </div>

      <div className="app-card">
        <div className="card-head d-flex justify-content-between align-items-center">
          <h3 className="card-heading">Order History</h3>
        </div>
        <div className="table-responsive">
          <table className="table table-app">
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Date</th>
                <th scope="col">Items</th>
                <th scope="col">Units</th>
                <th scope="col">Subtotal</th>
                <th scope="col">Discount</th>
                <th scope="col">Total</th>
                <th scope="col">Payment</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o) => (
                <tr key={o.id}>
                  <td className="sku">{o.id}</td>
                  <td>{o.date}</td>
                  <td>{o.items}</td>
                  <td>{o.units}</td>
                  <td>{money(o.subtotal)}</td>
                  <td className="text-warning">{money(o.discount)}</td>
                  <td className="fw-bold">{money(o.total)}</td>
                  <td><span className="badge-status badge-instock">{o.payment}</span></td>
                  <td><span className="badge-status badge-instock">{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-toolbar">
          <strong>
            {ORDERS.length} of {school.orders} shown · {units.toLocaleString()} units · {money(total)}
          </strong>
          <span className="small-note">
            Remaining {school.orders - ORDERS.length} orders total {money(school.spend - total)} · lifetime spend {money(school.spend)}
          </span>
        </div>
      </div>
    </>
  );
}

function Tile({ label, value, teal }) {
  const cls = teal ? 'kpi-card kpi-teal' : 'kpi-card';
  return (
    <div className="col-md-3">
      <div className={cls}>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
      </div>
    </div>
  );
}