/**
 * OrderProducts — wizard step 2 (Phase 5 polished).
 *
 * - Catalogue cards render product images via ImagePreviewThumb when an
 *   asset id is present in the product record, otherwise a placeholder.
 * - Qty controls enforce positive integers.
 * - Empty-order guard on "Continue → Review" with an inline error + toast.
 * - Live totals panel including credit warning.
 */
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import AppCard from '../../components/AppCard.jsx';
import QtyControl from '../../components/QtyControl.jsx';
import ImagePreviewThumb from '../../components/ImagePreviewThumb.jsx';
import { useOrderDraft } from '../../data-access/useOrderDraft.jsx';
import { useProducts } from '../../data-access/useEntity.js';
import { money } from '../../lib/format.js';
import { useToast } from '../../components/ToastProvider.jsx';
import WizardStepper from './WizardStepper.jsx';

export default function OrderProducts() {
  const { draft, totals, addLine, removeLine, changeQty } = useOrderDraft();
  const { items: products } = useProducts();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [emptyWarn, setEmptyWarn] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products]
  );

  const filteredCatalogue = useMemo(() => {
    const term = q.toLowerCase();
    return products.filter(
      (p) =>
        (!term || (p.name + p.sku).toLowerCase().includes(term)) &&
        (!cat || p.category === cat)
    );
  }, [products, q, cat]);

  const continueToReview = () => {
    if (draft.lines.length === 0) {
      setEmptyWarn(true);
      toast('Add at least one product before continuing.');
      return;
    }
    setEmptyWarn(false);
    navigate('/orders/new/review');
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Orders', to: '/orders' },
          { label: draft.order, to: '/orders/new' },
          { label: 'Products' },
        ]}
      />
      <PageHeader
        title="Add Products"
        subtitle={`${draft.order} · ${draft.school} · delivery ${draft.deliveryDate || 'TBC'}`}
      >
        <Link to="/orders/new" className="btn btn-outline-app">
          Back
        </Link>
        <button
          type="button"
          className="btn btn-outline-app"
          id="saveOrderDraft2"
          onClick={() => toast('Order draft saved locally.')}
        >
          Save Draft
        </button>
        <button
          type="button"
          className="btn btn-primary-app"
          id="continueReview"
          onClick={continueToReview}
        >
          Continue → Review
        </button>
      </PageHeader>

      <WizardStepper active={2} completed={[1]} />

      <div className="row g-3">
        <div className="col-lg-8">
          <AppCard
            head={
              <div className="d-flex justify-content-between">
                <h5 className="m-0">Order lines</h5>
                <span id="orderLineCount" className="small-note">
                  {draft.lines.length} lines · {totals.units} units
                </span>
              </div>
            }
            body={
              <div id="orderLines">
                {draft.lines.length === 0 && (
                  <div className="info-callout" role="status">
                    No products yet. Pick from the catalogue on the right.
                  </div>
                )}
                {draft.lines.map((l, i) => (
                  <div className="order-line" key={l.sku}>
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>{l.name}</strong>
                        <div className="small-note">
                          {l.sku} · {money(l.price)} each
                        </div>
                      </div>
                      <button
                        type="button"
                        className="row-menu"
                        aria-label={`Remove ${l.name}`}
                        onClick={() => removeLine(i)}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <QtyControl
                        value={l.qty}
                        onChange={(n) => changeQty(i, Math.max(1, Math.floor(Number(n) || 1)))}
                        ariaLabel={l.name}
                      />
                      <strong className="font-numeric">{money(l.qty * l.price)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            }
          />

          <AppCard
            head={<h5 className="m-0">Catalogue</h5>}
            body={
              <>
                <div className="d-flex gap-2 mb-2">
                  <input
                    id="catalogSearch"
                    className="form-control"
                    placeholder="Search catalogue…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <div id="catalogFilters" className="status-filter-row mb-3">
                  <button
                    type="button"
                    className={`btn btn-sm ${cat === '' ? 'btn-primary-app' : 'btn-outline-app'}`}
                    onClick={() => setCat('')}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      type="button"
                      key={c}
                      className={`btn btn-sm ${cat === c ? 'btn-primary-app' : 'btn-outline-app'}`}
                      onClick={() => setCat(c)}
                      data-cat={c}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {filteredCatalogue.length === 0 && (
                  <div className="info-callout" role="status">
                    No products match those filters.
                  </div>
                )}
                {filteredCatalogue.map((p) => {
                  const exists = draft.lines.some((l) => l.sku === p.sku);
                  return (
                    <div key={p.sku} className="catalog-item">
                      <ImagePreviewThumb
                        assetId={p.imageAssetId}
                        alt={p.name}
                        shape="product"
                      />
                      <div className="flex-grow-1">
                        <strong>{p.name}</strong>
                        <div className="small-note">
                          {p.sku} · {money(p.price)}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`btn btn-sm ${exists ? 'btn-success disabled' : 'btn-primary-app'}`}
                        disabled={exists}
                        onClick={() =>
                          addLine({ sku: p.sku, name: p.name, price: p.price, qty: 1 })
                        }
                        aria-label={`Add ${p.name}`}
                      >
                        {exists ? '✓ Added' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </>
            }
          />
        </div>

        <div className="col-lg-4">
          <AppCard
            head={<h5 className="m-0">Order summary</h5>}
            body={
              <>
                <div className="kv-row">
                  <span>Subtotal</span>
                  <strong className="font-numeric" id="orderSubtotal">
                    {money(totals.subtotal)}
                  </strong>
                </div>
                <div className="kv-row">
                  <span>Discount</span>
                  <strong className="font-numeric" id="orderDiscount">
                    −{money(totals.discount)}
                  </strong>
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
                  <strong className="font-numeric fs-5" id="orderTotal">
                    {money(totals.total)}
                  </strong>
                </div>
                <div
                  className={
                    totals.over
                      ? 'text-danger small fw-bold mt-2'
                      : 'text-success small fw-bold mt-2'
                  }
                  id="creditWarning"
                >
                  {totals.over
                    ? `Exceeds available credit by ${money(totals.over)} — needs approval`
                    : 'Within available credit'}
                </div>
                {emptyWarn && (
                  <div className="invalid-feedback-app mt-2" role="alert">
                    Add at least one product before continuing to review.
                  </div>
                )}
              </>
            }
          />
        </div>
      </div>
    </>
  );
}