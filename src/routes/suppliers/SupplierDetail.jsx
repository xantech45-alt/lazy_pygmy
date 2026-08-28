import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { exportCsv, money } from '../../lib/format.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * SupplierDetail — replaces suppliers/detail.html (PPT slide 27).
 * Tabs + Contact & Terms card, Recent POs list, Financials + Supplier Rating.
 * Master-prompt §1.7: includes a destructive Delete action using the shared
 * <DeleteConfirmModal>.
 */
export default function SupplierDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const supplier = localStorageStore.getSuppliers().find((s) => s.code === code);

  if (!supplier) {
    return (
      <>
        <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Suppliers', to: '/suppliers' }, { label: 'Not found' }]} />
        <PageHeader title="Supplier not found" subtitle={code}>
          <Link to="/suppliers" className="btn btn-outline-app">Back</Link>
        </PageHeader>
      </>
    );
  }

  const initials = supplier.contact?.split(' ').map((n) => n[0]).join('') || '?';

  const onDelete = () => {
    localStorageStore.saveSuppliers(localStorageStore.getSuppliers().filter((s) => s.code !== code));
    toast(`${supplier.code} deleted from local store.`);
    navigate('/suppliers');
  };

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Suppliers', to: '/suppliers' }, { label: supplier.code }]} />
      <PageHeader
        title={
          <>
            {supplier.name} <span className={`badge-status ${supplier.status === 'Active' ? 'badge-active' : ''} ms-2`}>{supplier.status}</span>
          </>
        }
        subtitle={`${supplier.code} · ${supplier.location} · supplier since March 2021 · ${supplier.products} products · ${supplier.terms}`}
      >
        <button className="btn btn-danger-app" onClick={() => setConfirming(true)}>Delete</button>
        <button className="btn btn-outline-app">Edit</button>
        <button
          className="btn btn-outline-app"
          onClick={() =>
            exportCsv(
              `statement-${supplier.code}.csv`,
              [
                { po: 'PO-2026-0117', date: '5 Jan 2026', units: 1200, value: '3180.00', status: 'Partially Received' },
                { po: 'PO-2025-0109', date: '27 Dec 2025', units: 800, value: '1680.00', status: 'Received' },
              ],
            )
          }
        >
          Statement
        </button>
        <Link to="/purchase-orders/new" className="btn btn-primary-app">
          + New Purchase Order
        </Link>
      </PageHeader>

      <ul className="nav tabs-app mb-3">
        <li><span className="nav-link active">Overview</span></li>
        <li><Link className="nav-link" to={`/suppliers/${supplier.code}/products`}>Products</Link></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Purchase Orders</span></li>
        <li><Link className="nav-link" to={`/suppliers/${supplier.code}/performance`}>Performance</Link></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Documents</span></li>
      </ul>

      <div className="row g-3">
        <div className="col-xl-8">
          <div className="app-card mb-3">
            <div className="card-head">
              <h5>Contact & Terms</h5>
            </div>
            <div className="card-body-app">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex gap-3">
                    <div className="avatar">{initials}</div>
                    <div>
                      <strong>{supplier.contact}</strong>
                      <div className="small-note">Sales Director · primary contact</div>
                      <div>+231 77 204 866 · james@kakatapaper.lr</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <Pair label="Registered name" value={`${supplier.name} Ltd`} />
                  <Pair label="Payment terms" value={supplier.terms} />
                  <Pair label="Average lead time" value="12 days" />
                  <Pair label="Minimum order" value="$400.00" />
                </div>
              </div>
            </div>
          </div>

          <div className="app-card">
            <div className="card-head d-flex justify-content-between">
              <h5>Recent Purchase Orders</h5>
              <Link to="/purchase-orders">View all</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-app">
                <thead>
                  <tr>
                    <th scope="col">PO Number</th>
                    <th scope="col">Date</th>
                    <th scope="col" className="text-end">Units</th>
                    <th scope="col" className="text-end">Value</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="sku">PO-2026-0117</td>
                    <td>5 Jan 2026</td>
                    <td className="numeric">1,200</td>
                    <td className="numeric">$3,180</td>
                    <td><StatusBadge status="Partially Received" /></td>
                  </tr>
                  <tr>
                    <td className="sku">PO-2025-0109</td>
                    <td>27 Dec 2025</td>
                    <td className="numeric">800</td>
                    <td className="numeric">$1,680</td>
                    <td><StatusBadge status="Received" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="app-card mb-3">
            <div className="card-head">
              <h5>Financials</h5>
            </div>
            <div className="card-body-app">
              <div className="small-note">Total purchases (12 months)</div>
              <div className="kpi-value">{money(supplier.purchases)}</div>
              <hr />
              <Pair label="Outstanding" value={money(supplier.outstanding || 0)} />
              <Pair label="Average order" value="$1,316" />
              <Pair label="Next payment due" value="4 Feb 2026" />
            </div>
          </div>
          <div className="app-card">
            <div className="card-head">
              <h5>Supplier Rating</h5>
            </div>
            <div className="card-body-app">
              <div className="supplier-rating">{supplier.rating} / 5.0</div>
              <span className="badge-status badge-active">Preferred</span>
              <hr />
              <Pair label="Delivery reliability" value="94%" />
              <Pair label="On-time rate" value="91%" />
              <Pair label="Quality claims-free" value="97%" />
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={onDelete}
        title="Delete this supplier?"
        subtitle={`${supplier.code} · ${supplier.name}`}
        consequences={[
          `${supplier.products} products in the catalogue will be unlinked from this supplier.`,
          `${supplier.purchases ? money(supplier.purchases) : '$0'} in historical purchases will lose their supplier reference.`,
          'Set the status to Inactive instead to keep history.',
        ]}
        acknowledge="I understand this will unlink this supplier's products and orders."
        confirmLabel="Delete supplier"
      />
    </>
  );
}

function Pair({ label, value }) {
  return (
    <div className="d-flex justify-content-between">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
