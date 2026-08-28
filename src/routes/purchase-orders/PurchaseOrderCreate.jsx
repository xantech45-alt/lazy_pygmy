import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ProductPicker from '../../components/ProductPicker.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { reorderSuggestions } from '../../data-access/reportSelectors.js';
import { money, number } from '../../lib/format.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * PurchaseOrderCreate — replaces purchase-orders/create.html (PPT slide 48).
 * Pre-fills 3 lines from low-stock suggestion (AC-0031 / AC-0037 / GC-0061).
 * Live line totals + summary card + Save Draft / Send for Approval.
 */
const SEED_LINES = [
  { sku: 'AC-0031', name: 'English Alphabet Flashcards', qty: 0, order: 400, cost: 1.8, current: 0 },
  { sku: 'AC-0037', name: 'Phonics Learning Cards', qty: 0, order: 260, cost: 1.8, current: 68 },
  { sku: 'GC-0061', name: 'Number Learning Cards', qty: 0, order: 240, cost: 1.8, current: 58 },
];

export default function PurchaseOrderCreate() {
  const [lines, setLines] = useState(SEED_LINES);
  const [pickerOpen, setPickerOpen] = useState(false);
  const toast = useToast();

  const totals = useMemo(() => {
    const units = lines.reduce((a, b) => a + (Number(b.order) || 0), 0);
    const value = lines.reduce((a, b) => a + (Number(b.order) || 0) * (b.cost || 0), 0);
    return { units, value };
  }, [lines]);

  const update = (idx, key, val) => {
    setLines((cur) => cur.map((l, i) => (i === idx ? { ...l, [key]: Number(val) } : l)));
  };

  const onSaveDraft = () => toast('PO draft saved.');
  const onSend = () => toast(`PO-2026-0120 sent for approval (${money(totals.value)}).`);

  const onLoadReorderSuggestion = () => {
    const { rows } = reorderSuggestions();
    if (!rows.length) {
      toast('No products are below their reorder level right now.');
      return;
    }
    setLines((cur) => {
      const merged = [...cur];
      rows.forEach((r) => {
        const i = merged.findIndex((l) => l.sku === r.sku);
        const line = {
          sku: r.sku,
          name: r.name,
          qty: r.qty,
          order: r.order,
          cost: r.cost,
          current: r.qty,
        };
        if (i >= 0) merged[i] = { ...merged[i], ...line };
        else merged.push(line);
      });
      return merged;
    });
    toast(`Loaded ${rows.length} reorder suggestion${rows.length === 1 ? '' : 's'} into the draft.`);
  };

  const onPickProduct = (product) => {
    const sku = product.sku;
    setLines((cur) => {
      const i = cur.findIndex((l) => l.sku === sku);
      const line = {
        sku,
        name: product.name,
        qty: Number(product.qty ?? product.onHand ?? 0),
        order: 100,
        cost: Number(product.cost ?? 1.8),
        current: Number(product.qty ?? product.onHand ?? 0),
      };
      if (i >= 0) return cur.map((l, idx) => (idx === i ? { ...l, ...line } : l));
      return [...cur, line];
    });
    setPickerOpen(false);
    toast(`Added ${product.name} to the PO draft.`);
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Purchase Orders', to: '/purchase-orders' },
          { label: 'New' },
        ]}
      />
      <PageHeader
        title="Create Purchase Order"
        subtitle="PO-2026-0120 · draft · raised from the low-stock reorder suggestion"
      >
        <Link to="/purchase-orders" className="btn btn-outline-app">Cancel</Link>
        <button className="btn btn-outline-app" onClick={onSaveDraft}>Save Draft</button>
        <button className="btn btn-primary-app" onClick={onSend}>Send for Approval</button>
      </PageHeader>

      <div className="app-card mb-3">
        <div className="card-head"><h3 className="card-heading">Supplier & Delivery</h3></div>
        <div className="card-body-app">
          <div className="route-cards">
            <div className="route-card">
              <span className="profile-avatar">MP</span>
              <div>
                <strong>Monrovia Print Works</strong>
                <div className="helper-text">SUP-003 · Net 15 · rating 4.8 · lead time 9 days</div>
              </div>
            </div>
            <div className="route-arrow"><i className="bi bi-arrow-right" /></div>
            <div className="route-card">
              <div>
                <div className="section-label">DELIVER TO</div>
                <strong>WH-01 Central Warehouse Monrovia</strong>
                <div className="helper-text">Expected 16 Jan 2026 · 3,060 units of free capacity</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="order-builder po-builder">
        <div className="app-card">
          <div className="card-head d-flex justify-content-between">
            <h3 className="card-heading">Order Lines</h3>
            <button
              type="button"
              id="addPOProduct"
              className="btn btn-link p-0"
              onClick={() => setPickerOpen(true)}
            >
              + Add product
            </button>
          </div>
          <div className="card-body-app pb-0">
            <div className="d-flex gap-2 align-items-center">
              <input className="form-control" placeholder="Search products from this supplier…" />
              <button className="btn btn-outline-app" onClick={onLoadReorderSuggestion}>
                Load reorder suggestion
              </button>
              <span className="ms-auto helper-text">
                {lines.length} lines · <strong>{number(totals.units)}</strong> units
              </span>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-app">
              <thead>
                <tr>
                  <th scope="col">PRODUCT</th>
                  <th scope="col">SKU</th>
                  <th scope="col" className="text-end">CURRENT</th>
                  <th scope="col">ORDER QTY</th>
                  <th scope="col" className="text-end">UNIT COST</th>
                  <th scope="col" className="text-end">LINE TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={l.sku}>
                    <td><strong>{l.name}</strong></td>
                    <td className="text-primary">{l.sku}</td>
                    <td className={`text-end fw-bold ${l.current === 0 ? 'text-danger' : ''}`} style={l.current > 0 && l.current < 100 ? { color: 'var(--color-warning)' } : {}}>
                      {l.current}
                    </td>
                    <td>
                      <input
                        id={`po-qty-${l.sku}`}
                        name={`poQty-${l.sku}`}
                        className="form-control receiving-input po-qty"
                        type="number"
                        min="0"
                        value={l.order}
                        onChange={(e) => update(i, 'order', e.target.value)}
                        data-cost={l.cost}
                      />
                    </td>
                    <td className="text-end">{money(l.cost)}</td>
                    <td className="text-end fw-bold po-line">{money(l.order * l.cost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="col" colSpan="3">{lines.length} lines</th>
                  <th scope="col" className="text-end">{number(totals.units)}</th>
                  <th scope="col" />
                  <th scope="col" className="text-end">{money(totals.value)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="card-body-app">
            <div className="warning-callout">
              English Alphabet Flashcards is out of stock — 3 school orders are waiting on this line.
            </div>
            <div className="helper-text mt-3">
              Quantities were pre-filled from the low-stock suggestion and can be edited before approval.
            </div>
          </div>
        </div>

        <div className="app-card align-self-start">
          <div className="card-head"><h3 className="card-heading">Summary</h3></div>
          <div className="card-body-app">
            <div className="d-flex justify-content-between mb-3">
              <span className="badge-status badge-draft">Draft</span>
              <span>PO-2026-0120</span>
            </div>
            <label className="form-label" htmlFor="expectedDelivery">Expected delivery</label>
            <input id="expectedDelivery" name="expectedDelivery" type="date" className="form-control mb-3" />
            <label className="form-label" htmlFor="paymentTerms">Payment terms</label>
            <select id="paymentTerms" name="paymentTerms" className="form-select mb-3" defaultValue="">
              <option value="" disabled>Select terms…</option>
              <option>Net 15</option>
            </select>
            <label className="form-label" htmlFor="raisedBy">Raised by</label>
            <select id="raisedBy" name="raisedBy" className="form-select mb-3" defaultValue="">
              <option value="" disabled>Select officer…</option>
              <option>James Kollie</option>
            </select>
            <hr />
            <div className="kv-row"><span>Goods value</span><strong>{money(totals.value)}</strong></div>
            <div className="kv-row"><span>Tax (exempt)</span><strong>$0.00</strong></div>
            <div className="kv-row"><span>Freight</span><strong>$0.00</strong></div>
            <hr />
            <div className="kv-row"><strong>Total</strong><strong className="fs-4">{money(totals.value)}</strong></div>
            <div className="helper-text" style={{ color: 'var(--color-warning)' }}>
              Approval needed above $1,000
            </div>
          </div>
        </div>
      </div>

      <ProductPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={onPickProduct}
        title="Add product to PO"
        excludeSkus={lines.map((l) => l.sku)}
      />
    </>
  );
}