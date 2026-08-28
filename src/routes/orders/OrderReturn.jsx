import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { money } from '../../lib/format.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * OrderReturn — replaces orders/return.html (PPT slide 42).
 * 5-step return workflow timeline + Returned Items table + Refund
 * Summary + Stock Impact side cards.
 *
 * Audit fix: previously Approve/Reject only fired a toast. Now both
 * actions go through ConfirmDialog (review-gate for an irreversible
 * customer-facing decision) and on confirm write a new entry to the
 * `returnNotes` store. Approve also bumps the product qty for sellable
 * lines (restock) and decrements for damaged lines (write-off).
 */
const RETURNS = [
  { sku: 'PZ-0091', name: 'Numbers Puzzle', ordered: 40, returned: 12, price: 5.4, reason: 'Damaged in transit', condition: 'Damaged' },
  { sku: 'AC-0037', name: 'Phonics Learning Cards', ordered: 80, returned: 20, price: 3.1, reason: 'Wrong item supplied', condition: 'Sellable' },
];

export default function OrderReturn() {
  const { order } = useParams();
  const toast = useToast();
  const [confirm, setConfirm] = useState({ open: false, action: null });

  const sellableUnits = RETURNS.filter((r) => r.condition === 'Sellable').reduce((a, b) => a + b.returned, 0);
  const damagedUnits = RETURNS.filter((r) => r.condition === 'Damaged').reduce((a, b) => a + b.returned, 0);
  const credit = RETURNS.reduce((a, b) => a + b.returned * b.price, 0);

  const ask = (action) => setConfirm({ open: true, action });

  const finalise = () => {
    const action = confirm.action;
    const id = `RTN-2026-${String(12 + localStorageStore.getReturnNotes().length).padStart(4, '0')}`;
    const record = {
      id,
      orderRef: order || 'ORD-2026-0081',
      school: 'Kakata Nursery Academy',
      action,
      lines: RETURNS.map((r) => ({
        sku: r.sku,
        name: r.name,
        returned: r.returned,
        reason: r.reason,
        condition: r.condition,
        lineValue: r.returned * r.price,
      })),
      sellableUnits,
      damagedUnits,
      credit: action === 'approve' ? credit : 0,
      status: action === 'approve' ? 'Approved' : 'Rejected',
      decidedAt: new Date().toISOString(),
    };
    const list = localStorageStore.getReturnNotes();
    localStorageStore.saveReturnNotes([record, ...list]);
    if (action === 'approve') {
      const products = localStorageStore.getProducts();
      const updated = products.map((p) => {
        const ln = RETURNS.find((r) => r.sku === p.sku);
        if (!ln) return p;
        // Sellable units return to stock at WH-01; damaged units are written off.
        const delta = ln.condition === 'Sellable' ? ln.returned : -ln.returned;
        return { ...p, qty: Math.max(0, p.qty + delta) };
      });
      localStorageStore.saveProducts(updated);
    }
    setConfirm({ open: false, action: null });
    toast(
      action === 'approve'
        ? `Return approved. Credit note ${id} raised.`
        : `Return ${id} rejected. Customer notified.`
    );
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Orders', to: '/orders' },
          { label: order || 'ORD-2026-0081', to: `/orders/${order || 'ORD-2026-0081'}` },
          { label: 'Return' },
        ]}
      />
      <PageHeader
        title="Order Return"
        subtitle={
          <>
            <span className="badge-status badge-low">Under Inspection</span>
            <br />
            RTN-2026-0012 · Kakata Nursery Academy · against ORD-2026-0081 delivered 4 Jan 2026
          </>
        }
      >
        <button className="btn btn-danger-app" onClick={() => ask('reject')}>Reject Return</button>
        <button className="btn btn-primary-app" onClick={() => ask('approve')}>Approve Return</button>
      </PageHeader>

      <div className="app-card">
        <div className="card-head d-flex justify-content-between align-items-center">
          <h3 className="card-heading">Return Workflow</h3>
        </div>
        <div className="card-body-app">
          <div className="text-end text-primary fw-bold">Step 2 of 5</div>
          <div className="fulfilment-line return-flow">
            <Step done label="Requested" when="7 Jan, 08:20" who="Patience Weah" />
            <Step done active label="Inspection" when="7 Jan, 10:45" who="Sarah Weah" />
            <Step num="3" label="Approve / Reject" when="pending" who="Grace Kollie" />
            <Step num="4" label="Restock or Write-off" when="pending" who="WH-01" />
            <Step num="5" label="Refund issued" when="pending" who="Finance" />
          </div>
        </div>
      </div>

      <div className="content-grid mt-3">
        <div>
          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Returned Items</h3>
              <strong className="text-primary">2 of 4 lines</strong>
            </div>
            <div className="table-responsive">
              <table className="table table-app">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col" className="text-end">Ordered</th>
                    <th scope="col" className="text-end">Return</th>
                    <th scope="col">Reason</th>
                    <th scope="col">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {RETURNS.map((r) => (
                    <tr key={r.sku}>
                      <td>
                        <strong>{r.name}</strong>
                        <div className="small-note">{r.sku}</div>
                      </td>
                      <td className="numeric">{r.ordered}</td>
                      <td className="numeric fw-bold">{r.returned}</td>
                      <td>{r.reason}</td>
                      <td>
                        <StatusBadge status={r.condition} />
                        <br />
                        {r.condition === 'Damaged' ? (
                          <button className="btn btn-sm btn-danger-app mt-1" onClick={() => toast(`${r.returned} units written off.`)}>Write-off ›</button>
                        ) : (
                          <button className="btn btn-sm btn-outline-success mt-1" onClick={() => toast(`${r.returned} units restocked at WH-01.`)}>Restock ›</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-body-app">
              <div className="warning-callout">
                <strong>Inspection notes — Sarah Weah, 7 Jan 10:45</strong>
                <br />
                12 puzzles crushed in transit; boxes wet on arrival. 20 phonics packs are sealed and resellable.
              </div>
              <p className="small-note mt-3">
                Approving moves {sellableUnits} units back to WH-01 and writes {damagedUnits} units off as damaged stock. A credit note is raised automatically.
              </p>
            </div>
          </div>
        </div>

        <aside className="d-grid gap-3">
          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Refund Summary</h3>
            </div>
            <div className="card-body-app">
              {RETURNS.map((r) => (
                <div key={r.sku} className="kv-row">
                  <span>{r.name} {r.returned} × {money(r.price)}</span>
                  <strong>{money(r.returned * r.price)}</strong>
                </div>
              ))}
              <hr />
              <div className="kv-row"><strong>Credit due</strong><strong className="fs-3 text-danger">{money(credit)}</strong></div>
              <div className="kv-row"><span>Method</span><strong>Credit note</strong></div>
              <div className="kv-row"><span>Applied to</span><strong>ORD-2026-0081</strong></div>
            </div>
          </div>

          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Stock Impact</h3>
            </div>
            <div className="card-body-app">
              <div className="kv-row"><span>Back to WH-01</span><strong className="text-success">+{sellableUnits} units</strong></div>
              <div className="kv-row"><span>Written off</span><strong className="text-danger">−{damagedUnits} units</strong></div>
              <div className="kv-row"><span>Restock value</span><strong>{money(sellableUnits * 1.8)}</strong></div>
              <div className="kv-row"><span>Write-off cost</span><strong className="text-danger">{money(damagedUnits * 3.2)}</strong></div>
              <div className="small-note mt-2">Posted as ADJ-2026-0022 on approval</div>
            </div>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, action: null })}
        onConfirm={finalise}
        title={confirm.action === 'approve' ? 'Approve return' : 'Reject return'}
        summary={
          confirm.action === 'approve'
            ? `Approve RTN-2026-0012 on ${order || 'ORD-2026-0081'}: ${sellableUnits} units restocked, ${damagedUnits} units written off, ${money(credit)} credit note raised.`
            : `Reject RTN-2026-0012 on ${order || 'ORD-2026-0081'}: no stock movement, no credit note issued. The school is notified.`
        }
        consequences={
          confirm.action === 'approve'
            ? [
                'Stock is restocked at WH-01 for sellable lines.',
                'Damaged units are removed from on-hand qty as a write-off.',
                'A credit note is raised against the original order.',
                'The customer is notified and the case closes.',
              ]
            : [
                'No stock movement is recorded.',
                'No credit note is issued.',
                'The school is notified of the rejection and the case closes.',
                'The inspector’s notes are retained in the return record.',
              ]
        }
        confirmLabel={confirm.action === 'approve' ? 'Approve return' : 'Reject return'}
      />
    </>
  );
}

function Step({ done, active, num, label, when, who }) {
  const cls = done ? `fulfil-step done${active ? ' active' : ''}` : 'fulfil-step';
  return (
    <div className={cls}>
      <span>{done ? '✓' : num}</span>
      <strong>{label}</strong>
      <small>{when}<br />{who}</small>
    </div>
  );
}