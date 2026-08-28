import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import ProductPicker from '../../components/ProductPicker.jsx';
import { useToast } from '../../components/ToastProvider.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { money, number } from '../../lib/format.js';

/**
 * TransferCreate — replaces warehouses/transfer-create.html (PPT slide 23).
 * Two-warehouse transfer form with editable per-product quantities, live
 * over-transfer check (the same `max(0, available - transfer)` that drives
 * the GRN math; here applied to source availability).
 *
 * Audit fix: previously only toasted. Now opens a ConfirmDialog and on
 * confirm writes a new row to the `transfers` store and decrements the
 * source-warehouse stock (the destination is bumped only on approval, but
 * here we simulate the immediate visibility that the underlying record
 * expects).
 */
export default function TransferCreate() {
  const toast = useToast();
  const allProducts = localStorageStore.getProducts();
  const seedProducts = allProducts.slice(0, 4);
  const initial = seedProducts.reduce((acc, p) => ({ ...acc, [p.sku]: Math.min(200, Math.max(40, p.qty - 100)) }), {});
  const [transfers, setTransfers] = useState(initial);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const setTransfer = (sku) => (e) => setTransfers((t) => ({ ...t, [sku]: Math.max(0, Number(e.target.value) || 0) }));

  const rows = useMemo(
    () =>
      Object.keys(transfers).map((sku) => {
        const p = allProducts.find((x) => x.sku === sku);
        if (!p) return null;
        const avail = p.qty - (p.reserved || 0);
        const xfer = transfers[sku] || 0;
        const sourceAfter = avail - xfer;
        const status = sourceAfter < 0
          ? { label: `Short ${Math.abs(sourceAfter)}`, kind: 'danger' }
          : p.qty - xfer < p.reorder
          ? { label: 'Below reorder', kind: 'warning' }
          : { label: 'OK', kind: 'success' };
        return { p, avail, xfer, sourceAfter, status };
      }).filter(Boolean),
    [allProducts, transfers]
  );

  const hasIssue = rows.some((r) => r.status.kind === 'danger');
  const totalUnits = rows.reduce((a, r) => a + r.xfer, 0);
  const totalValue = rows.reduce((a, r) => a + r.xfer * r.p.cost, 0);

  const openConfirm = () => {
    if (hasIssue) {
      toast('Resolve the short line before submitting.');
      return;
    }
    setConfirmOpen(true);
  };

  const confirm = () => {
    const id = `TRF-2026-${String(43 + localStorageStore.getTransfers().length).padStart(4, '0')}`;
    const record = {
      id,
      from: 'WH-01',
      to: 'WH-02',
      lines: rows.map(({ p, xfer }) => ({
        sku: p.sku,
        name: p.name,
        qty: xfer,
        unitCost: p.cost,
        lineValue: xfer * p.cost,
      })),
      totalUnits,
      totalValue,
      status: 'Pending Approval',
      submittedAt: new Date().toISOString(),
    };
    const list = localStorageStore.getTransfers();
    localStorageStore.saveTransfers([record, ...list]);
    const updated = localStorageStore.getProducts().map((p) =>
      transfers[p.sku] ? { ...p, qty: Math.max(0, p.qty - transfers[p.sku]) } : p
    );
    localStorageStore.saveProducts(updated);
    setConfirmOpen(false);
    toast(`${id} submitted for approval.`);
  };

  const onPickTransfer = (product) => {
    const sku = product.sku;
    setTransfers((t) => (t[sku] != null ? t : { ...t, [sku]: 0 }));
    setPickerOpen(false);
    toast(`Added ${product.name} to the transfer draft.`);
  };

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Warehouses', to: '/warehouses' }, { label: 'Stock transfer' }]} />
      <PageHeader
        title="New Stock Transfer"
        subtitle="TRF-2026-0043 · draft · availability is checked live against WH-01 stock"
      >
        <Link to="/warehouses" className="btn btn-outline-app">Cancel</Link>
        <button className="btn btn-outline-app" onClick={() => toast('Transfer draft saved.')}>Save Draft</button>
        <button className="btn btn-primary-app" onClick={openConfirm}>
          Submit for Approval
        </button>
      </PageHeader>

      {hasIssue && <div className="alert alert-warning">Resolve the short line before submitting.</div>}

      <div className="content-grid">
        <div>
          <div className="app-card mb-3">
            <div className="card-head">
              <h5>Transfer Route</h5>
            </div>
            <div className="card-body-app">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="section-kicker">From</div>
                  <h5>WH-01 Central Warehouse Monrovia</h5>
                  <div className="small-note">8,940 units on hand · 75% utilised · Sarah Weah</div>
                </div>
                <div className="col-md-6">
                  <div className="section-kicker">To</div>
                  <h5>WH-02 Paynesville Distribution Center</h5>
                  <div className="small-note">5,720 units on hand · 64% utilised · Peter Sirleaf</div>
                </div>
              </div>
            </div>
          </div>

          <div className="app-card overflow-hidden">
            <div className="card-head d-flex justify-content-between">
              <h5>Products to Transfer</h5>
              <button
                type="button"
                className="btn btn-sm btn-outline-app"
                onClick={() => setPickerOpen(true)}
              >
                + Add product
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-app">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">SKU</th>
                    <th scope="col" className="text-end">Available</th>
                    <th scope="col" style={{ width: 120 }}>Transfer</th>
                    <th scope="col" className="text-end">WH-01 After</th>
                    <th scope="col" className="text-end">WH-02 After</th>
                    <th scope="col">Check</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ p, avail, xfer, sourceAfter, status }) => (
                    <tr key={p.sku}>
                      <td>{p.name}</td>
                      <td className="sku">{p.sku}</td>
                      <td className="numeric">{number(avail)}</td>
                      <td>
                        <input type="number" className="form-control form-control-sm" min="0" value={xfer} onChange={setTransfer(p.sku)} id={`xfer-${p.sku}`} name={`xfer-${p.sku}`} />
                      </td>
                      <td className={`numeric ${sourceAfter < 0 ? 'text-danger' : ''}`}>{sourceAfter}</td>
                      <td className="numeric">{number(xfer)}</td>
                      <td>
                        <span className={`fw-bold text-${status.kind}`}>{status.label}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-toolbar">
              <span className="small-note">Availability is re-checked when the transfer is approved, not when it is drafted.</span>
              <button className="btn btn-sm btn-outline-app" onClick={() => toast('Availability re-checked (simulated).')}>
                Check availability
              </button>
            </div>
          </div>
        </div>
        <div>
          <div className="app-card">
            <div className="card-head">
              <h5>Transfer Summary</h5>
            </div>
            <div className="card-body-app">
              <div className="small-note">Draft</div>
              <h5>TRF-2026-0043</h5>
              <hr />
              <Row label="Expected arrival" value="12 Jan 2026" />
              <Row label="Carrier" value="Own fleet" />
              <Row label="Dispatched by" value="Sarah Weah" />
              <hr />
              <Row label="Products" value={`${rows.length} lines`} />
              <Row label="Units" value={number(totalUnits)} />
              <Row label="Est. value" value={money(totalValue)} />
              <Row label="Distance" value="18 km" />
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirm}
        title="Submit stock transfer"
        summary={`Send ${number(totalUnits)} units (${money(totalValue)} estimated value) from WH-01 to WH-02.`}
        consequences={[
          'Source-warehouse stock is decremented for the listed SKUs.',
          'A pending row is added to the Transfers ledger.',
          'WH-02 stock increases on approval, not immediately.',
          'Tracking against the 18 km Own-fleet route begins once accepted.',
        ]}
        confirmLabel="Submit for approval"
      />

      <ProductPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={onPickTransfer}
        title="Add product to transfer"
        excludeSkus={Object.keys(transfers)}
      />
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="d-flex justify-content-between">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
