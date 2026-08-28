import { Link, useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { money, number } from '../../lib/format.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * PurchaseOrderReceive — replaces purchase-orders/receive.html (PPT slide 50).
 * Live GRN math:
 *   outstanding = max(0, ordered − already − receiving)
 *   row status: complete / short N / receiving
 *
 * Audit fix: previously the Post Receipt button only fired a toast and
 * never recorded the receipt. Now it opens a ConfirmDialog (review-gate
 * for an irreversible value movement) and on confirm writes a new entry
 * to the `receipts` store and bumps the matched product qty in the
 * products store (mirroring the on-page copy that says "received stock
 * is added to WH-01 the moment the receipt is posted").
 */
const SEED_LINES = [
  { sku: 'BK-0142', name: 'ABC Beginner Book', ordered: 400, already: 400, receiving: 0, cost: 2.2 },
  { sku: 'PZ-0091', name: 'Numbers Puzzle', ordered: 340, already: 340, receiving: 0, cost: 3.4 },
  { sku: 'PZ-0088', name: 'Animal Puzzle', ordered: 200, already: 0, receiving: 200, cost: 3.4 },
  { sku: 'BK-0151', name: 'Early Reading Level 1', ordered: 260, already: 0, receiving: 180, cost: 2.2 },
];

export default function PurchaseOrderReceive() {
  const { po } = useParams();
  const [lines, setLines] = useState(SEED_LINES);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const toast = useToast();

  const update = (idx, val) => {
    setLines((cur) => cur.map((l, i) => (i === idx ? { ...l, receiving: Number(val) } : l)));
  };

  const totals = useMemo(() => {
    const receiving = lines.reduce((a, b) => a + b.receiving, 0);
    const outstanding = lines.reduce((a, b) => a + Math.max(0, b.ordered - b.already - b.receiving), 0);
    const valueReceived = lines.reduce((a, b) => a + b.receiving * b.cost, 0);
    const valueOutstanding = lines.reduce((a, b) => {
      const o = Math.max(0, b.ordered - b.already - b.receiving);
      return a + o * b.cost;
    }, 0);
    return { receiving, outstanding, valueReceived, valueOutstanding };
  }, [lines]);

  const shortLines = lines.filter((l) => l.ordered - l.already - l.receiving > 0);

  const openConfirm = () => {
    if (totals.receiving === 0) {
      toast('Enter a receiving quantity before posting.');
      return;
    }
    setConfirmOpen(true);
  };

  const confirm = () => {
    const id = `GRN-2026-${String(44 + localStorageStore.getReceipts().length).padStart(4, '0')}`;
    const record = {
      id,
      poRef: po || 'PO-2026-0117',
      supplier: 'Kakata Paper Mills',
      warehouse: 'WH-01 Central',
      receivedBy: 'Sarah Weah',
      deliveryNote: 'DN-KP-4471',
      lines: lines.map((l) => ({
        sku: l.sku,
        name: l.name,
        ordered: l.ordered,
        already: l.already,
        receiving: l.receiving,
        outstanding: Math.max(0, l.ordered - l.already - l.receiving),
        unitCost: l.cost,
      })),
      totalUnits: totals.receiving,
      totalValue: totals.valueReceived,
      outstanding: totals.outstanding,
      outstandingValue: totals.valueOutstanding,
      status: shortLines.length > 0 ? 'Partially Received' : 'Received',
      postedAt: new Date().toISOString(),
    };
    const list = localStorageStore.getReceipts();
    localStorageStore.saveReceipts([record, ...list]);
    const products = localStorageStore.getProducts();
    const updated = products.map((p) => {
      const ln = lines.find((l) => l.sku === p.sku);
      return ln && ln.receiving > 0 ? { ...p, qty: p.qty + ln.receiving } : p;
    });
    localStorageStore.saveProducts(updated);
    setConfirmOpen(false);
    toast(`${id} posted to WH-01 (${money(totals.valueReceived)}).`);
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Purchase Orders', to: '/purchase-orders' },
          { label: po || 'PO-2026-0117' },
          { label: 'Receive' },
        ]}
      />
      <PageHeader
        title="Receive Inventory"
        subtitle={`${po || 'PO-2026-0117'} · Kakata Paper Mills · second delivery · ${number(SEED_LINES.reduce((a, b) => a + b.already, 0))} of ${number(SEED_LINES.reduce((a, b) => a + b.ordered, 0))} units already received`}
      >
        <Link to="/purchase-orders" className="btn btn-outline-app">Cancel</Link>
        <button className="btn btn-outline-app" onClick={() => toast('Receipt draft saved.')}>Save Draft</button>
        <button className="btn btn-primary-app" onClick={openConfirm}>Post Receipt</button>
      </PageHeader>

      <div className="order-builder receive-grid">
        <div className="app-card">
          <div className="card-head d-flex justify-content-between">
            <h3 className="card-heading">Goods Received</h3>
            <strong className="text-primary">GRN-2026-0044</strong>
          </div>
          <div className="table-responsive">
            <table className="table table-app">
              <thead>
                <tr>
                  <th scope="col">PRODUCT</th>
                  <th scope="col">SKU</th>
                  <th scope="col" className="text-end">ORDERED</th>
                  <th scope="col" className="text-end">ALREADY</th>
                  <th scope="col">RECEIVING</th>
                  <th scope="col" className="text-end">OUTSTANDING</th>
                  <th scope="col">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => {
                  const outstanding = Math.max(0, l.ordered - l.already - l.receiving);
                  const complete = outstanding === 0 && l.receiving === 0 && l.already === l.ordered;
                  const short = outstanding > 0;
                  return (
                    <tr key={l.sku}>
                      <td><strong>{l.name}</strong></td>
                      <td className="text-primary">{l.sku}</td>
                      <td className="text-end">{number(l.ordered)}</td>
                      <td className="text-end">{number(l.already)}</td>
                      <td>
                        <input
                          className="form-control receiving-input"
                          type="number"
                          min="0"
                          max={l.ordered - l.already}
                          value={l.receiving}
                          onChange={(e) => update(i, e.target.value)}
                          disabled={l.already === l.ordered}
                          data-cost={l.cost}
                        />
                      </td>
                      <td className="text-end fw-bold" style={short ? { color: 'var(--color-warning)' } : {}}>
                        {number(outstanding)}
                      </td>
                      <td>
                        {complete ? <span className="badge-status badge-instock">Complete</span>
                          : short ? <span className="badge-status badge-low">Short {number(outstanding)}</span>
                          : <span className="badge-status badge-processing">Receiving</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="col" colSpan="2">{lines.length} lines</th>
                  <th scope="col" className="text-end">{number(SEED_LINES.reduce((a, b) => a + b.ordered, 0))}</th>
                  <th scope="col" className="text-end">{number(SEED_LINES.reduce((a, b) => a + b.already, 0))}</th>
                  <th scope="col" className="text-end">{number(totals.receiving)}</th>
                  <th scope="col" className="text-end">{number(totals.outstanding)}</th>
                  <th scope="col" />
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="card-body-app">
            {shortLines.length > 0 ? (
              <div className="warning-callout">
                {shortLines[0].name} is {number(shortLines[0].ordered - shortLines[0].already - shortLines[0].receiving)} units short. Posting will leave {po || 'PO-2026-0117'} Partially Received and keep the balance on order.
              </div>
            ) : null}
            <div className="section-label mt-4">CONDITION CHECK</div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="check1" />
              <label className="form-check-label" htmlFor="check1">All cartons intact on arrival</label>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="check2" />
              <label className="form-check-label" htmlFor="check2">Quantities counted against delivery note DN-KP-4471</label>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="check3" />
              <label className="form-check-label" htmlFor="check3">Batch numbers recorded</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="damageReported" />
              <label className="form-check-label" htmlFor="damageReported">Damage reported</label>
            </div>
            <div className="helper-text mt-3">
              Received stock is added to WH-01 the moment the receipt is posted in this frontend simulation.
            </div>
          </div>
        </div>

        <div className="app-card align-self-start">
          <div className="card-head"><h3 className="card-heading">Receipt Details</h3></div>
          <div className="card-body-app">
            <label className="form-label" htmlFor="grnNumber">GRN number</label>
            <input id="grnNumber" name="grnNumber" className="form-control mb-3" defaultValue="GRN-2026-0044" disabled title="Goods Received Note number is generated automatically and cannot be edited" />
            <label className="form-label" htmlFor="receiptDate">Receipt date</label>
            <input id="receiptDate" name="receiptDate" type="date" className="form-control mb-3" defaultValue="2026-01-07" />
            <label className="form-label" htmlFor="receivingWarehouse">Warehouse</label>
            <select id="receivingWarehouse" name="receivingWarehouse" className="form-select mb-3" defaultValue="WH-01 Central">
              <option>WH-01 Central</option>
            </select>
            <label className="form-label" htmlFor="receivedBy">Received by</label>
            <select id="receivedBy" name="receivedBy" className="form-select mb-3" defaultValue="Sarah Weah">
              <option>Sarah Weah</option>
            </select>
            <label className="form-label" htmlFor="supplierNoteRef">Supplier note ref</label>
            <input id="supplierNoteRef" name="supplierNoteRef" className="form-control mb-3" defaultValue="DN-KP-4471" />
            <hr />
            <div className="kv-row"><span>Units received now</span><strong>{number(totals.receiving)}</strong></div>
            <div className="kv-row"><span>Value received</span><strong>{money(totals.valueReceived)}</strong></div>
            <div className="kv-row"><span>Still on order</span><strong>{number(totals.outstanding)}</strong></div>
            <div className="kv-row"><span>Value outstanding</span><strong>{money(totals.valueOutstanding)}</strong></div>
            <hr />
            <div className="kv-row">
              <span>PO status</span>
              <span className="badge-status badge-low">Partially Received</span>
            </div>
            <div className="helper-text mb-3">Becomes Received once the final {number(totals.outstanding)} units arrive.</div>
            <button className="btn btn-primary-app w-100" onClick={openConfirm}>Post Receipt</button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirm}
        title="Post goods received note"
        summary={`Post ${number(totals.receiving)} units (${money(totals.valueReceived)} value) to WH-01 against ${po || 'PO-2026-0117'}.`}
        consequences={[
          'Product qty on hand is increased for the listed SKUs.',
          'A new GRN row is added to the Receipts ledger.',
          shortLines.length > 0
            ? `PO remains Partially Received (${number(totals.outstanding)} units, ${money(totals.valueOutstanding)} still on order).`
            : 'PO moves to Received once all units are in.',
          'Direction: Kakata Paper Mills → WH-01 Central, delivery note DN-KP-4471.',
        ]}
        confirmLabel="Post receipt"
      />
    </>
  );
}