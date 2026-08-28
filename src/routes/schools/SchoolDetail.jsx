import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { exportCsv, money } from '../../lib/format.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * SchoolDetail — replaces schools/detail.html (PPT slide 33).
 * Master-prompt §1.7: includes a destructive Delete action. Schools with
 * outstanding balances cannot be deleted without first settling — the
 * button is disabled when school.outstanding > 0 (real-world lifecycle).
 */
const RECENT_ORDERS = [
  { id: 'ORD-2026-0084', date: '6 Jan 2026', units: 420, total: 1284, status: 'Delivered', paid: true },
  { id: 'ORD-2025-0071', date: '12 Dec 2025', units: 260, total: 742, status: 'Delivered', paid: true },
  { id: 'ORD-2025-0058', date: '18 Nov 2025', units: 210, total: 620, status: 'Delivered', paid: true },
  { id: 'ORD-2025-0044', date: '9 Oct 2025', units: 180, total: 524, status: 'Delivered', paid: true },
  { id: 'ORD-2025-0031', date: '15 Sep 2025', units: 120, total: 310, status: 'Delivered', paid: true },
];

const TOP_PRODUCTS = [
  { name: 'ABC Beginner Book', units: 420, pct: 100 },
  { name: 'Handwriting Copybook', units: 380, pct: 90, color: 'bg-info' },
  { name: 'Memory Matching Cards', units: 210, pct: 50, color: 'bg-info' },
];

export default function SchoolDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
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

  const initials = school.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const avgOrder = school.orders ? school.spend / school.orders : 0;
  const canDelete = school.outstanding === 0;

  const onDelete = () => {
    localStorageStore.saveSchools(localStorageStore.getSchools().filter((s) => s.code !== code));
    toast(`${school.code} deleted from local store.`);
    navigate('/schools');
  };

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Schools', to: '/schools' }, { label: school.code }]} />
      <PageHeader
        title={school.name}
        subtitle={
          <>
            <span className="badge-status badge-info me-2">{school.code}</span>
            <span className={`badge-status ${school.status === 'Active' ? 'badge-instock' : 'badge-draft'}`}>{school.status}</span>
            <br />
            {school.type} · {school.category} · {school.county} County · {school.pupils.toLocaleString()} pupils · customer since Feb 2022
          </>
        }
      >
        <button
          className="btn btn-danger-app"
          disabled={!canDelete}
          title={canDelete ? 'Delete this school' : 'Cannot delete: outstanding balance must be settled first'}
          onClick={() => setConfirming(true)}
        >
          Delete
        </button>
        <button className="btn btn-outline-app">Edit</button>
        <button
          className="btn btn-outline-app"
          onClick={() =>
            exportCsv(
              `statement-${school.code}.csv`,
              RECENT_ORDERS.map((o) => ({
                order: o.id,
                date: o.date,
                units: o.units,
                total: o.total.toFixed(2),
                status: o.status,
                paid: o.paid ? 'Yes' : 'No',
              })),
            )
          }
        >
          Statement
        </button>
        <Link to="/orders/new" className="btn btn-primary-app">+ New Order</Link>
      </PageHeader>

      <ul className="nav tabs-app mb-3">
        <li><span className="nav-link active">Overview</span></li>
        <li><Link className="nav-link" to={`/schools/${school.code}/orders`}>Orders</Link></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Invoices</span></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Contacts</span></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Notes</span></li>
      </ul>

      <div className="content-grid">
        <div className="d-grid gap-3">
          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Contact & Profile</h3>
            </div>
            <div className="card-body-app">
              <div className="profile-grid">
                <div>
                  <div className="profile-preview">
                    <span className="profile-avatar">{initials}</span>
                    <div>
                      <strong className="fs-5">{school.contact}</strong>
                      <div>Head Teacher · primary contact</div>
                      <div className="small-note">+231 77 340 918 · office@{school.code.toLowerCase()}.lr</div>
                    </div>
                  </div>
                  <hr />
                  <div className="kv-row"><span>School type</span><strong>{school.type} · {school.category}</strong></div>
                  <div className="kv-row"><span>Pupils enrolled</span><strong>{school.pupils.toLocaleString()}</strong></div>
                  <div className="kv-row"><span>Customer since</span><strong>Feb 2022</strong></div>
                </div>
                <div>
                  <div className="kv-row"><span>District</span><strong>{school.county === 'Montserrado' ? 'Greater Monrovia' : school.county}</strong></div>
                  <div className="kv-row"><span>County</span><strong>{school.county}</strong></div>
                  <div className="kv-row"><span>Address</span><strong>Randall Street, Monrovia</strong></div>
                  <div className="kv-row"><span>Payment terms</span><strong>Net 30</strong></div>
                  <div className="kv-row"><span>Credit limit</span><strong>$2,500.00</strong></div>
                  <div className="kv-row"><span>Delivery route</span><strong>Monrovia Central</strong></div>
                </div>
              </div>
            </div>
          </div>

          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Recent Orders</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-app">
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Date</th>
                    <th scope="col">Units</th>
                    <th scope="col">Value</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map((o) => (
                    <tr key={o.id}>
                      <td className="sku">
                        <Link to={`/orders/${o.id}`}>{o.id}</Link>
                      </td>
                      <td>{o.date}</td>
                      <td>{o.units}</td>
                      <td className="fw-bold">{money(o.total)}</td>
                      <td>
                        <span className="badge-status badge-instock">{o.status}</span>
                        {o.paid && <span className="text-success fw-bold ms-2">Paid</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-toolbar">
              <span>5 of {school.orders} orders shown · {money(3480)} in the last 5 orders</span>
              <Link to={`/schools/${school.code}/orders`}>View all {school.orders}</Link>
            </div>
          </div>
        </div>

        <aside className="d-grid gap-3 align-content-start">
          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Account Summary</h3>
            </div>
            <div className="card-body-app">
              <div className="kpi-label">Lifetime spend</div>
              <div className="kpi-value fs-3">{money(school.spend)}</div>
              <hr />
              <div className="kv-row">
                <span>Outstanding</span>
                <strong className={school.outstanding > 0 ? 'text-danger' : 'text-success'}>
                  {money(school.outstanding)}
                </strong>
              </div>
              <div className="kv-row"><span>Orders placed</span><strong>{school.orders}</strong></div>
              <div className="kv-row"><span>Average order</span><strong>{money(avgOrder)}</strong></div>
              <div className="small-note mt-2">Last order 6 Jan 2026 · settled on delivery</div>
            </div>
          </div>

          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Top Products</h3>
            </div>
            <div className="card-body-app">
              {TOP_PRODUCTS.map((p) => (
                <div key={p.name} className="mb-3">
                  <div className="progress-label">
                    <span>{p.name}</span>
                    <strong>{p.units} u</strong>
                  </div>
                  <div className="progress app-progress">
                    <div className={`progress-bar ${p.color || ''}`} style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Delivery</h3>
            </div>
            <div className="card-body-app">
              <div className="kv-row"><span>Route</span><strong>Monrovia Central</strong></div>
              <div className="kv-row"><span>Usual officer</span><strong>Peter Sirleaf</strong></div>
              <div className="kv-row"><span>Average lead</span><strong>2 days</strong></div>
            </div>
          </div>
        </aside>
      </div>

      <DeleteConfirmModal
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={onDelete}
        title="Delete this school?"
        subtitle={`${school.code} · ${school.name}`}
        consequences={[
          `${school.orders} historical orders will lose their school reference.`,
          `${money(school.spend)} in lifetime spend history will no longer be attributable.`,
          'Set the status to Inactive instead to keep history.',
        ]}
        acknowledge="I understand this school and its order history will be removed."
        confirmLabel="Delete school"
      />
    </>
  );
}