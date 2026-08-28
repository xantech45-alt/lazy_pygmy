import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { useToast } from '../../components/ToastProvider.jsx';
import { money } from '../../lib/format.js';
import { localStorageStore } from '../../data-access/localStorageStore.js';

/**
 * InventoryAdjustment — replaces inventory/adjustment.html (PPT slide 17).
 * Adjustment form: select product/warehouse, reason, dates, system vs counted
 * difference, value impact preview, approval timeline.
 *
 * Audit fix: previously the submit button only fired a toast — it never
 * persisted anything. The flow now opens a ConfirmDialog (review-gate) and
 * on confirm writes a new entry to the `adjustments` store, plus updates
 * the affected product's qty so the ledger reflects the new count.
 */
export default function InventoryAdjustment() {
  const products = localStorageStore.getProducts();
  const toast = useToast();
  const product = products.find((p) => p.sku === 'PZ-0088') || products[0];
  const systemQty = product?.qty || 0;
  const unitCost = product?.cost || 0;

  const [counted, setCounted] = useState(74);
  const [reason, setReason] = useState('Damaged');
  const [warehouse, setWarehouse] = useState('WH-01 Central Warehouse');
  const [reference, setReference] = useState('Cycle count CC-2026-003');
  const [notes, setNotes] = useState('12 puzzles water-damaged during the 4 Jan roof leak in Bay 3. Photographed and set aside for write-off.');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const difference = systemQty - counted;
  const valueImpact = -difference * unitCost;

  const submit = () => {
    if (counted === '' || counted < 0) {
      toast('Counted quantity must be ≥ 0.');
      return;
    }
    setConfirmOpen(true);
  };

  const confirm = () => {
    const id = `ADJ-2026-${String(200 + localStorageStore.getAdjustments().length).padStart(4, '0')}`;
    const record = {
      id,
      productSku: product?.sku,
      productName: product?.name,
      warehouse,
      reason,
      reference,
      notes,
      systemQty,
      countedQty: counted,
      difference,
      valueImpact,
      status: 'Pending Approval',
      submittedAt: new Date().toISOString(),
    };
    const list = localStorageStore.getAdjustments();
    localStorageStore.saveAdjustments([record, ...list]);
    if (product) {
      const updated = localStorageStore.getProducts().map((p) =>
        p.sku === product.sku ? { ...p, qty: counted } : p
      );
      localStorageStore.saveProducts(updated);
    }
    setConfirmOpen(false);
    toast(`${id} submitted for approval.`);
  };

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Inventory', to: '/inventory' }, { label: 'Stock adjustment' }]} />
      <PageHeader
        title="New Stock Adjustment"
        subtitle="ADJ-2026-0020 · draft · started 7 Jan 2026, 09:48 by Moses Kollie"
      >
        <Link to="/inventory" className="btn btn-outline-app">
          Cancel
        </Link>
        <button className="btn btn-outline-app" onClick={() => toast('Adjustment draft saved.')}>
          Save Draft
        </button>
        <button className="btn btn-primary-app" onClick={submit}>
          Submit for Approval
        </button>
      </PageHeader>

      <div className="content-grid">
        <div className="app-card">
          <div className="card-head">
            <h5>Adjustment Details</h5>
          </div>
          <div className="card-body-app">
            <div className="section-kicker mb-2">What is being adjusted</div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label required" htmlFor="adjProduct">Product</label>
                <select id="adjProduct" name="product" className="form-select" defaultValue={product ? product.sku : ''}>
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} · {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label required" htmlFor="adjWarehouse">Warehouse</label>
                <select id="adjWarehouse" name="warehouse" className="form-select" value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
                  <option>WH-01 Central Warehouse</option>
                  <option>WH-02 Paynesville</option>
                  <option>WH-03 Gbarnga</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label required" htmlFor="adjReason">Reason</label>
                <select id="adjReason" name="reason" className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                  <option>Damaged</option>
                  <option>Expired</option>
                  <option>Cycle count</option>
                  <option>Found</option>
                  <option>Lost</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label required" htmlFor="adjDate">Adjustment date</label>
                <input id="adjDate" name="date" className="form-control" defaultValue="7 Jan 2026" />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="adjReference">Reference</label>
                <input id="adjReference" name="reference" className="form-control" value={reference} onChange={(e) => setReference(e.target.value)} />
              </div>
            </div>
            <div className="form-section mt-3">
              <div className="section-kicker mb-2">Quantities</div>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-label">System quantity</div>
                  <input id="systemQty" className="form-control" defaultValue={`${systemQty} pcs`} disabled title="System quantity is read from the inventory ledger and cannot be edited here" />
                  <div className="helper-text">Read from the inventory ledger</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="countedQty">Counted quantity</label>
                  <input
                    id="countedQty"
                    type="number"
                    min="0"
                    className="form-control"
                    value={counted}
                    onChange={(e) => setCounted(Number(e.target.value))}
                  />
                  <div className="helper-text">Physical count entered by storekeeper</div>
                </div>
                <div className="col-md-6">
                  <div className="form-label">Difference</div>
                  <div className="fs-4 fw-bold text-danger">
                    {difference > 0 ? '−' : difference < 0 ? '+' : ''}
                    {Math.abs(difference)} pcs
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-label">Value impact</div>
                  <div className={`fs-4 fw-bold ${valueImpact < 0 ? 'text-danger' : 'text-success'}`}>
                    {valueImpact < 0 ? '−' : '+'}
                    {money(Math.abs(valueImpact))}
                  </div>
                </div>
              </div>
            </div>
            <div className="form-section mt-3">
              <div className="section-kicker mb-2">Evidence</div>
              <label className="form-label" htmlFor="adjNotes">Notes</label>
              <textarea id="adjNotes" name="notes" className="form-control mb-3" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
              <div className="small-note">
                <i className="bi bi-paperclip"></i>
                count-sheet-CC-2026-003.pdf · 84 KB
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="app-card mb-3">
            <div className="card-head">
              <h5>Impact Preview</h5>
            </div>
            <div className="card-body-app">
              <Row label="System" value={systemQty} />
              <Row label="Counted" value={counted} />
              <hr />
              <Row label="Difference" value={`${difference > 0 ? '−' : difference < 0 ? '+' : ''}${Math.abs(difference)} pcs`} danger />
              <Row label="Unit cost" value={money(unitCost)} />
              <Row
                label="Value written off"
                value={`${valueImpact < 0 ? '−' : '+'}${money(Math.abs(valueImpact))}`}
                danger={valueImpact < 0}
              />
            </div>
          </div>
          <div className="app-card">
            <div className="card-head">
              <h5>Approval</h5>
            </div>
            <div className="card-body-app">
              <div className="timeline">
                <Step n={1} label="Draft" active />
                <Step n={2} label="Submitted" />
                <Step n={3} label="Approved" />
                <Step n={4} label="Posted" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirm}
        title="Submit stock adjustment"
        summary={`Post ${difference > 0 ? 'a shortage write-off' : 'a surplus adjustment'} of ${Math.abs(difference)} units of ${product?.name || 'product'} at ${warehouse}, valued at ${money(Math.abs(valueImpact))} at ${unitCost}/unit cost.`}
        consequences={[
          'Product qty on hand is updated to the counted value.',
          'A pending approval row is added to the Adjustments ledger.',
          'Finance will see the value impact on the next daily close.',
          'The change cannot be undone without a counter-adjustment.',
        ]}
        confirmLabel="Submit for approval"
      />
    </>
  );
}

function Row({ label, value, danger }) {
  return (
    <div className="d-flex justify-content-between">
      <span>{label}</span>
      <strong className={danger ? 'text-danger' : ''}>{value}</strong>
    </div>
  );
}

function Step({ n, label, active }) {
  return (
    <div className="timeline-step">
      <div className="timeline-dot" style={active ? undefined : { background: 'var(--color-border-strong)' }}>
        {n}
      </div>
      <strong>{label}</strong>
    </div>
  );
}
