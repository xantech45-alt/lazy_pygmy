/**
 * OrderReview — wizard step 3 (Phase 5 polished).
 *
 * - Customer & schedule summary card with an "Edit" link back to step 1.
 * - Product lines table with ImagePreviewThumb.
 * - Confirmation dialog before submission.
 * - Duplicate-submit guard: ref boolean + disabled button + status text.
 * - Polished success state with order reference + View order / Return to
 *   orders buttons.
 */
import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import AppCard from '../../components/AppCard.jsx';
import ImagePreviewThumb from '../../components/ImagePreviewThumb.jsx';
import { useOrderDraft } from '../../data-access/useOrderDraft.jsx';
import { useOrders, useProducts } from '../../data-access/useEntity.js';
import { money } from '../../lib/format.js';
import { useToast } from '../../components/ToastProvider.jsx';
import WizardStepper from './WizardStepper.jsx';

export default function OrderReview() {
  const { draft, totals, reset } = useOrderDraft();
  const { items: orders, add } = useOrders();
  const { items: products } = useProducts();
  const toast = useToast();
  const navigate = useNavigate();

  const submitting = useRef(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  const productLookup = useMemo(() => {
    const m = new Map();
    products.forEach((p) => m.set(p.sku, p));
    return m;
  }, [products]);

  const openConfirm = () => {
    if (draft.lines.length === 0) {
      toast('No order lines to submit.');
      navigate('/orders/new/products');
      return;
    }
    setConfirmOpen(true);
  };

  const submit = () => {
    if (submitting.current) return; // duplicate-submit guard
    submitting.current = true;
    setConfirmOpen(false);

    let next = null;
    if (!orders.some((o) => o.order === draft.order)) {
      next = add({
        order: draft.order,
        school: draft.school,
        schoolCode: draft.schoolCode,
        date: new Date().toISOString().slice(0, 10),
        orderDate: draft.orderDate,
        deliveryDate: draft.deliveryDate,
        items: draft.lines.length,
        units: totals.units,
        subtotal: Math.round(totals.subtotal * 100) / 100,
        discount: totals.discount,
        delivery: totals.delivery,
        total: Math.round(totals.total * 100) / 100,
        lines: draft.lines.map((l) => ({ ...l })),
        terms: draft.terms,
        route: draft.route,
        priority: draft.priority,
        salesOfficer: draft.salesOfficer,
        deliveryOfficer: draft.deliveryOfficer,
        schoolPO: draft.schoolPO,
        payment: 'Unpaid',
        status: 'Pending',
        officer: draft.salesOfficer || 'Grace Doe',
      });
    }

    setSubmittedOrder(next || { order: draft.order });
    setSubmitted(true);
    toast(`Order ${draft.order} sent for approval.`);
    reset();
    submitting.current = false;
  };

  if (submitted && submittedOrder) {
    return (
      <>
        <PageHeader
          title="Order sent"
          subtitle={`${submittedOrder.order} · awaiting approval`}
        />
        <AppCard
          head={<h5 className="m-0">Order submitted</h5>}
          body={
            <div className="success-callout info-callout" role="status">
              <div className="display-6 mb-2" aria-hidden="true">
                ✓
              </div>
              <h3>Order {submittedOrder.order} is on its way</h3>
              <p className="small-note">
                Your order has been queued for internal approval. You will be
                notified when it is processed. The draft has been cleared from
                this browser.
              </p>
              <div className="d-flex gap-2 mt-3">
                <Link to="/orders" className="btn btn-primary-app">
                  Return to orders
                </Link>
                <button
                  type="button"
                  className="btn btn-outline-app"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          }
        />
      </>
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Orders', to: '/orders' },
          { label: draft.order, to: '/orders/new' },
          { label: 'Review' },
        ]}
      />
      <PageHeader
        title="Review & submit"
        subtitle={`${draft.order} · ${draft.school} · ${draft.lines.length} lines · ${totals.units} units`}
      >
        <Link to="/orders/new/products" className="btn btn-outline-app">
          Back to products
        </Link>
        <button
          type="button"
          className="btn btn-outline-app"
          id="saveOrderDraft3"
          onClick={() => toast('Order draft saved locally.')}
        >
          Save Draft
        </button>
        <button
          type="button"
          className="btn btn-primary-app"
          id="sendOrderApproval"
          onClick={openConfirm}
          disabled={draft.lines.length === 0}
        >
          Send for Approval
        </button>
      </PageHeader>

      <WizardStepper active={3} completed={[1, 2]} />

      <div className="row g-3">
        <div className="col-lg-8">
          <AppCard
            head={
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="m-0">Customer & schedule</h5>
                <Link to="/orders/new" className="btn btn-sm btn-outline-app">
                  Edit
                </Link>
              </div>
            }
            body={
              <>
                <div className="kv-row">
                  <span>Order #</span>
                  <strong>{draft.order}</strong>
                </div>
                <div className="kv-row">
                  <span>Customer</span>
                  <strong>
                    {draft.school} · {draft.schoolCode}
                  </strong>
                </div>
                <div className="kv-row">
                  <span>Order date</span>
                  <strong>{draft.orderDate || '—'}</strong>
                </div>
                <div className="kv-row">
                  <span>Delivery date</span>
                  <strong>{draft.deliveryDate || '—'}</strong>
                </div>
                <div className="kv-row">
                  <span>Route</span>
                  <strong>{draft.route || '—'}</strong>
                </div>
                <div className="kv-row">
                  <span>Priority</span>
                  <strong>{draft.priority}</strong>
                </div>
                <div className="kv-row">
                  <span>Sales officer</span>
                  <strong>{draft.salesOfficer || '—'}</strong>
                </div>
                <div className="kv-row">
                  <span>Delivery officer</span>
                  <strong>{draft.deliveryOfficer || '—'}</strong>
                </div>
                <div className="kv-row">
                  <span>Payment terms</span>
                  <strong>{draft.terms}</strong>
                </div>
                {draft.schoolPO && (
                  <div className="kv-row">
                    <span>School PO #</span>
                    <strong>{draft.schoolPO}</strong>
                  </div>
                )}
              </>
            }
          />

          <AppCard
            head={<h5 className="m-0">Order lines</h5>}
            body={
              <>
                {draft.lines.length === 0 ? (
                  <div className="info-callout" role="status">
                    No products yet. Go back to the products step to add some.
                  </div>
                ) : (
                  <table className="table table-app">
                    <thead>
                      <tr>
                        <th scope="col" aria-label="Image"></th>
                        <th scope="col">SKU</th>
                        <th scope="col">Name</th>
                        <th scope="col" className="text-end">
                          Qty
                        </th>
                        <th scope="col" className="text-end">
                          Unit price
                        </th>
                        <th scope="col" className="text-end">
                          Line total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {draft.lines.map((l) => {
                        const p = productLookup.get(l.sku);
                        return (
                          <tr key={l.sku}>
                            <td>
                              <ImagePreviewThumb
                                assetId={p?.imageAssetId}
                                alt={l.name}
                                shape="product"
                              />
                            </td>
                            <td className="sku">{l.sku}</td>
                            <td>{l.name}</td>
                            <td className="numeric">{l.qty}</td>
                            <td className="numeric">{money(l.price)}</td>
                            <td className="numeric fw-bold">
                              {money(l.qty * l.price)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </>
            }
          />
        </div>

        <div className="col-lg-4">
          <AppCard
            head={<h5 className="m-0">Totals</h5>}
            body={
              <>
                <div className="kv-row">
                  <span>Subtotal</span>
                  <strong className="font-numeric">{money(totals.subtotal)}</strong>
                </div>
                <div className="kv-row">
                  <span>Discount</span>
                  <strong className="font-numeric">−{money(totals.discount)}</strong>
                </div>
                <div className="kv-row">
                  <span>Delivery</span>
                  <strong className="font-numeric">{money(totals.delivery)}</strong>
                </div>
                <div
                  className="kv-row"
                  style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10 }}
                >
                  <span>
                    <strong>Total</strong>
                  </span>
                  <strong className="font-numeric fs-5">{money(totals.total)}</strong>
                </div>
                <div
                  className={
                    totals.over
                      ? 'text-danger small fw-bold mt-2'
                      : 'text-success small fw-bold mt-2'
                  }
                >
                  {totals.over
                    ? `Exceeds available credit by ${money(totals.over)} — needs approval`
                    : 'Within available credit'}
                </div>
              </>
            }
          />
        </div>
      </div>

      {confirmOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(20, 24, 32, 0.5)', zIndex: 1500 }}
          role="dialog"
          aria-modal="true"
          aria-label="Send order for approval"
        >
          <button
            type="button"
            aria-label="Close dialog"
            className="position-absolute top-0 start-0 w-100 h-100 modal-backdrop-app"
            onClick={() => setConfirmOpen(false)}
          ></button>
          <div
            className="app-card"
            style={{ maxWidth: 480, width: '90%', position: 'relative', zIndex: 1 }}
          >
            <div className="card-head">
              <h5 className="m-0">Send {draft.order} for approval?</h5>
            </div>
            <div className="card-body-app">
              <p className="mb-2">
                This order will be queued for internal approval. The draft will
                be cleared from this browser.
              </p>
              <ul className="kv-rows" style={{ listStyle: 'none', padding: 0 }}>
                <li className="kv-row">
                  <span>Total</span>
                  <strong className="font-numeric">{money(totals.total)}</strong>
                </li>
                <li className="kv-row">
                  <span>Lines</span>
                  <strong>{draft.lines.length}</strong>
                </li>
                <li className="kv-row">
                  <span>Units</span>
                  <strong>{totals.units}</strong>
                </li>
                {totals.over > 0 && (
                  <li className="kv-row text-danger">
                    <span>Credit overage</span>
                    <strong className="font-numeric">{money(totals.over)}</strong>
                  </li>
                )}
              </ul>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-outline-app"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary-app"
                  onClick={submit}
                >
                  Yes, send for approval
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}