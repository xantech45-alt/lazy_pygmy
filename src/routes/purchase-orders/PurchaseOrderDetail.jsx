import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { money, number } from '../../lib/format.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { brand } from '../../lib/brand.js';

/**
 * PurchaseOrderDetail — net-new per master-prompt §1.7.
 *
 * The static prototype ships no purchase-orders/detail.html file and the
 * shipped list page links only one hardcoded row (PO-2026-0117) anywhere.
 * This component is built after the same visual pattern as
 * SupplierDetail / SchoolDetail / EmployeeDetail (page-header + tabs +
 * toolbar with Edit / Receive / Delete) using the data already in
 * LP_DATA / LPStore, not invented scope.
 *
 * Delete is status-gated: only Draft / Pending Approval / Approved are
 * deletable; Partially Received / Received / Cancelled block the action
 * (real-world PO lifecycle — partial receipts have created real stock
 * movements that should not be silently wiped).
 */
const LINES = [
  { sku: 'AC-0031', name: 'Activity Cubes (Set of 6)', qty: 24, unitCost: 9.5, received: 24 },
  { sku: 'AC-0037', name: 'Alphabet Tracing Boards', qty: 36, unitCost: 6.2, received: 18 },
  { sku: 'GC-0061', name: 'Geometric Counters (120 pcs)', qty: 12, unitCost: 14.0, received: 0 },
];

const DELETABLE_STATUSES = new Set(['Draft', 'Pending Approval', 'Approved']);

const tabList = [
  { key: 'overview', label: 'Overview' },
  { key: 'lines', label: 'Lines' },
  { key: 'receiving', label: 'Receiving' },
  { key: 'documents', label: 'Documents' },
];

export default function PurchaseOrderDetail() {
  const { po } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const order = localStorageStore.getPurchaseOrders().find((p) => p.po === po);

  if (!order) {
    return (
      <>
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/dashboard' },
            { label: 'Purchase Orders', to: '/purchase-orders' },
            { label: 'Not found' },
          ]}
        />
        <PageHeader title="Purchase order not found" subtitle={po}>
          <Link to="/purchase-orders" className="btn btn-outline-app">Back</Link>
        </PageHeader>
      </>
    );
  }

  const subtotal = LINES.reduce((a, b) => a + b.qty * b.unitCost, 0);
  const totalQty = LINES.reduce((a, b) => a + b.qty, 0);
  const receivedQty = LINES.reduce((a, b) => a + b.received, 0);
  const outstandingQty = totalQty - receivedQty;
  const pctReceived = totalQty === 0 ? 0 : Math.round((receivedQty / totalQty) * 100);
  const canDelete = DELETABLE_STATUSES.has(order.status);

  const onDelete = () => {
    if (!understood) return;
    toast(`Purchase order ${order.po} removed.`);
    navigate('/purchase-orders');
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Purchase Orders', to: '/purchase-orders' },
          { label: order.po },
        ]}
      />
      <PageHeader
        title={
          <>
            {order.po}
            <span className="badge-status badge-info ms-2">{order.supplier}</span>
            <StatusBadge status={order.status} />
          </>
        }
        subtitle={`Raised ${order.raised} · expected ${order.expected} · ${number(totalQty)} units · ${money(subtotal)} committed`}
      >
        <Link to={`/purchase-orders/${order.po}/receive`} className="btn btn-outline-app">
          Receive
        </Link>
        <button className="btn btn-outline-app" disabled title="Edit not implemented in this prototype">
          Edit
        </button>
        <button
          className="btn btn-danger-app"
          disabled={!canDelete}
          title={canDelete ? 'Delete this purchase order' : `Cannot delete: status is "${order.status}"`}
          onClick={() => setConfirming(true)}
        >
          Delete
        </button>
      </PageHeader>

      <ul className="nav tabs-app mb-3">
        {tabList.map((t, i) => (
          <li key={t.key}>
            <span className={`nav-link ${i === 0 ? 'active' : ''}`}>{t.label}</span>
          </li>
        ))}
      </ul>

      <div className="two-column-layout">
        <div className="d-grid gap-3">
          <div className="app-card">
            <div className="card-head d-flex justify-content-between">
              <h3 className="card-heading">Order Lines</h3>
              <span className="small-note">{LINES.length} lines</span>
            </div>
            <div className="table-responsive">
              <table className="table table-app mb-0">
                <thead>
                  <tr>
                    <th scope="col">SKU</th>
                    <th scope="col">Product</th>
                    <th scope="col" className="text-end">Ordered</th>
                    <th scope="col" className="text-end">Received</th>
                    <th scope="col" className="text-end">Outstanding</th>
                    <th scope="col" className="text-end">Unit Cost</th>
                    <th scope="col" className="text-end">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {LINES.map((l) => (
                    <tr key={l.sku}>
                      <td className="sku">
                        <Link to={`/products/${l.sku}`}>{l.sku}</Link>
                      </td>
                      <td>{l.name}</td>
                      <td className="numeric">{l.qty}</td>
                      <td className="numeric">{l.received}</td>
                      <td className="numeric">{Math.max(0, l.qty - l.received)}</td>
                      <td className="numeric">{money(l.unitCost)}</td>
                      <td className="numeric fw-bold">{money(l.qty * l.unitCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-body-app">
              <div className="kv-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <div className="kv-row"><span>Freight</span><strong>{money(85)}</strong></div>
              <div className="kv-row"><span>Total committed</span><strong className="text-primary">{money(subtotal + 85)}</strong></div>
            </div>
          </div>

          <div className="app-card">
            <div className="card-head">
              <h3 className="card-heading">Receiving Progress</h3>
            </div>
            <div className="card-body-app">
              <div className="d-flex justify-content-between mb-1">
                <strong>{receivedQty} of {number(totalQty)} units received</strong>
                <strong>{pctReceived}%</strong>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-bar" style={{ width: `${pctReceived}%`, background: brand.success }}></div>
              </div>
              <div className="helper-text mt-2">
                {outstandingQty === 0
                  ? 'All units received. Status will move to Received on next sync.'
                  : `${number(outstandingQty)} units outstanding across ${LINES.filter((l) => l.received < l.qty).length} lines.`}
              </div>
            </div>
          </div>
        </div>

        <div className="right-stack">
          <div className="app-card">
            <div className="card-head">
              <h3 className="card-heading">Supplier</h3>
            </div>
            <div className="card-body-app">
              <div className="kv-row"><span>Supplier</span><strong><Link to={`/suppliers/${encodeURIComponent(order.supplier)}`}>{order.supplier}</Link></strong></div>
              <div className="kv-row"><span>Terms</span><strong>Net 30</strong></div>
              <div className="kv-row"><span>Currency</span><strong>USD</strong></div>
              <div className="kv-row"><span>Contact</span><strong>+231 88 002 113</strong></div>
            </div>
          </div>
          <div className="app-card">
            <div className="card-head">
              <h3 className="card-heading">Lifecycle</h3>
            </div>
            <div className="card-body-app">
              <LifecycleRow label="Raised" when={order.raised} done />
              <LifecycleRow label="Approved" when="8 Jan" done={['Approved', 'Partially Received', 'Received', 'Cancelled'].includes(order.status)} />
              <LifecycleRow label="Partially received" when="—" done={['Partially Received', 'Received'].includes(order.status)} />
              <LifecycleRow label="Fully received" when={order.status === 'Received' ? 'Expected ' + order.expected : '—'} done={order.status === 'Received'} />
              <LifecycleRow label="Closed" when="—" done={order.status === 'Cancelled'} strike={order.status === 'Cancelled'} />
            </div>
          </div>
        </div>
      </div>

      {confirming && (
        <>
          <button
            type="button"
            className="modal-backdrop-app"
            aria-label="Close dialog"
            onClick={() => setConfirming(false)}
          />
          <div className="modal-app" role="dialog" aria-modal="true" aria-labelledby="deletePOHeading">
            <div className="modal-app-dialog">
              <div className="modal-app-head">
                <h5 id="deletePOHeading" className="mb-0">Delete purchase order?</h5>
                <button className="btn-close-app" aria-label="Close" onClick={() => setConfirming(false)}>×</button>
              </div>
              <div className="modal-app-body">
                <p>
                  <strong>{order.po}</strong> from <strong>{order.supplier}</strong> ({number(totalQty)} units, {money(subtotal + 85)}) will be removed.
                </p>
                <p className="text-danger small">
                  No units have been received against this order yet, so there are no stock movements to unwind.
                </p>
                <label className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={understood}
                    onChange={(e) => setUnderstood(e.target.checked)}
                  />
                  <span className="form-check-label">I understand this cannot be undone.</span>
                </label>
              </div>
              <div className="modal-app-foot">
                <button className="btn btn-outline-app" onClick={() => setConfirming(false)}>Cancel</button>
                <button
                  className="btn btn-danger-app"
                  disabled={!understood}
                  onClick={onDelete}
                >
                  Delete purchase order
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function LifecycleRow({ label, when, done, strike }) {
  return (
    <div className="kv-row" style={{ opacity: done ? 1 : 0.4 }}>
      <span>
        <i className={`bi ${done ? 'bi-check-circle-fill text-success' : 'bi-circle'}`} aria-hidden="true"></i>{' '}
        {label}
      </span>
      <strong style={strike ? { textDecoration: 'line-through' } : undefined}>{when}</strong>
    </div>
  );
}