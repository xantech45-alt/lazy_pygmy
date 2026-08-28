import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { useRolePermissions } from '../../data-access/useRolePermissions.js';
import { exportCsv, money } from '../../lib/format.js';
import { printPage } from '../../lib/print.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * OrderDetail — replaces orders/detail.html (PPT slide 39).
 *
 * Master-prompt §1.7: destructive action is "Cancel order" (not a hard
 * delete). Status-gated — only Draft / Pending / Confirmed / Processing /
 * Packed orders can be cancelled. Delivered / Dispatched / Invoiced orders
 * block the action (real-world order lifecycle).
 */
const CANCELLABLE_STATUSES = new Set(['Draft', 'Pending', 'Confirmed', 'Processing', 'Packed']);

const LINES = [
  { sku: 'BK-0142', name: 'ABC Beginner Book', qty: 110, price: 3.5 },
  { sku: 'CB-0104', name: 'Handwriting Copybook', qty: 110, price: 1.6 },
  { sku: 'BK-0148', name: 'My First Mathematics Book', qty: 70, price: 4.0 },
  { sku: 'GC-0057', name: 'Memory Matching Cards', qty: 70, price: 3.4 },
  { sku: 'BK-0151', name: 'Early Reading Level 1', qty: 40, price: 3.75 },
  { sku: 'PZ-0088', name: 'Animal Puzzle', qty: 20, price: 5.75 },
];

export default function OrderDetail() {
  const { order } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [, , can] = useRolePermissions();
  const activeRole = localStorageStore.get('activeRole', 'Administrator');
  const o = localStorageStore.getOrders().find((x) => x.order === order);

  if (!o) {
    return (
      <>
        <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Orders', to: '/orders' }, { label: 'Not found' }]} />
        <PageHeader title="Order not found" subtitle={order}>
          <Link to="/orders" className="btn btn-outline-app">Back</Link>
        </PageHeader>
      </>
    );
  }

  const subtotal = LINES.reduce((a, b) => a + b.qty * b.price, 0);
  const totalUnits = LINES.reduce((a, b) => a + b.qty, 0);
  const roleCanCancel = can(activeRole, 'Manage');
  const canCancel = CANCELLABLE_STATUSES.has(o.status) && roleCanCancel;

  const onCancel = () => {
    const updated = localStorageStore.getOrders().map((x) =>
      x.order === o.order ? { ...x, status: 'Cancelled' } : x
    );
    localStorageStore.saveOrders(updated);
    toast(`${o.order} cancelled.`);
    navigate('/orders');
  };

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Orders', to: '/orders' }, { label: o.order }]} />
      <PageHeader
        title={`Order ${o.order}`}
        subtitle={
          <>
            <StatusBadge status={o.status} /> <StatusBadge status={o.payment} />
            <br />
            {o.school} · placed {o.date} · delivered {o.date} · {o.officer}
          </>
        }
      >
        <button
          className="btn btn-danger-app"
          disabled={!canCancel}
          title={
            canCancel
              ? 'Cancel this order'
              : !roleCanCancel
              ? `Your role "${activeRole}" does not have the Manage permission required to cancel orders.`
              : `Cannot cancel: status is "${o.status}"`
          }
          onClick={() => setConfirming(true)}
        >
          Cancel Order
        </button>
        <button className="btn btn-outline-app" onClick={() => printPage({ title: `Order ${o.order}` })}>
          Print
        </button>
        <button
          className="btn btn-outline-app"
          disabled
          aria-disabled="true"
          title="Duplicate requires the order draft flow; not implemented in this prototype"
        >
          Duplicate
        </button>
        <button
          className="btn btn-primary-app"
          onClick={() =>
            exportCsv(
              `INV-${o.order}.csv`,
              LINES.map((l) => ({
                order: o.order,
                sku: l.sku,
                name: l.name,
                qty: l.qty,
                unit_price: l.price.toFixed(2),
                line_total: (l.qty * l.price).toFixed(2),
              })),
            )
          }
        >
          Download Invoice
        </button>
      </PageHeader>

      <div className="content-grid">
        <div className="d-grid gap-3">
          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Order Lines</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-app">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">SKU</th>
                    <th scope="col" className="text-end">Qty</th>
                    <th scope="col" className="text-end">Unit Price</th>
                    <th scope="col" className="text-end">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {LINES.map((l) => (
                    <tr key={l.sku}>
                      <td>{l.name}</td>
                      <td className="sku">{l.sku}</td>
                      <td className="numeric">{l.qty}</td>
                      <td className="numeric">{money(l.price)}</td>
                      <td className="numeric fw-bold">{money(l.qty * l.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-toolbar">
              <strong>{LINES.length} lines · {totalUnits.toLocaleString()} units · {money(subtotal)}</strong>
              <span>Fulfilled from WH-01 Central Warehouse</span>
            </div>
          </div>

          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Payment</h3>
            </div>
            <div className="card-body-app">
              <div className="payment-grid">
                <div>
                  <div className="profile-preview">
                    <span className="success-check">✓</span>
                    <div>
                      <strong className="fs-5">Paid in full</strong>
                      <div className="small-note">Settled on delivery, {o.date}</div>
                    </div>
                  </div>
                  <div className="small-note mt-3">
                    Subtotal {money(1344)} · discount −{money(60)}
                    <br />
                    Tax $0.00 · delivery $0.00 (free over $1,000)
                  </div>
                </div>
                <div>
                  <div className="kv-row"><span>Amount received</span><strong className="text-success">{money(1284)}</strong></div>
                  <div className="kv-row"><span>Method</span><strong>Bank transfer</strong></div>
                  <div className="kv-row"><span>Reference</span><strong>PMT-2026-0071</strong></div>
                  <div className="kv-row"><span>Recorded by</span><strong>Grace Kollie</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="d-grid gap-3">
          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Customer</h3>
            </div>
            <div className="card-body-app">
              <div className="profile-preview">
                <span className="profile-avatar">ST</span>
                <div>
                  <strong>{o.school}</strong>
                  <div className="small-note">SCH-052 · 640 pupils</div>
                </div>
              </div>
              <hr />
              <div className="kv-row"><span>Contact</span><strong>Sister Mary Toe</strong></div>
              <div className="kv-row"><span>Address</span><strong>Randall St, Monrovia</strong></div>
              <div className="kv-row"><span>Terms</span><strong>Net 30</strong></div>
            </div>
          </div>

          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Fulfilment</h3>
            </div>
            <div className="card-body-app">
              <div className="kv-row"><span>Warehouse</span><strong>WH-01 Central</strong></div>
              <div className="kv-row"><span>Picked & packed</span><strong>6 Jan, 08:40</strong></div>
              <div className="kv-row"><span>Delivered</span><strong>6 Jan, 14:12</strong></div>
              <div className="kv-row"><span>Officer</span><strong>Peter Sirleaf</strong></div>
            </div>
          </div>

          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Documents</h3>
            </div>
            <div className="card-body-app">
              <Doc name={`INV-${o.order}.pdf`} size="84 KB" />
              <Doc name={`DN-${o.order}.pdf`} size="62 KB" />
              <Doc name={`POD-${o.order.slice(-4)}.jpg`} size="310 KB" />
            </div>
          </div>
        </aside>
      </div>

      <DeleteConfirmModal
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={onCancel}
        title="Cancel this order?"
        subtitle={`${o.order} · ${o.school}`}
        consequences={[
          `${totalUnits.toLocaleString()} units across ${LINES.length} lines will not be delivered.`,
          `${money(subtotal)} order value will be removed from revenue totals.`,
          'The order status will move to Cancelled and cannot be re-opened from here.',
        ]}
        acknowledge="I understand this order will be cancelled and cannot be re-opened."
        confirmLabel="Cancel order"
      />
    </>
  );
}

function Doc({ name, size }) {
  return (
    <button type="button" className="doc-link">
      <i className="bi bi-download" />
      <span>
        <strong>{name}</strong>
        <small>{size}</small>
      </span>
    </button>
  );
}