import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { money } from '../../lib/format.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * TransferDetail — replaces warehouses/transfer-detail.html (PPT slide 24).
 * 4-step lifecycle timeline (Requested → Approved → In Transit → Received),
 * 4 transfer lines with variance + status, summary card (reference/dates/value).
 */
const TRANSFER = {
  id: 'TRF-2026-0042',
  from: 'WH-01 Central Warehouse',
  to: 'WH-02 Paynesville',
  unitsSent: 620,
  unitsReceived: 616,
  status: 'Received',
  lifecycle: [
    { step: 'Requested', date: '3 Jan 2026, 08:12', by: 'Sarah Weah · Storekeeper' },
    { step: 'Approved', date: '3 Jan 2026, 10:40', by: 'Grace Kollie · Inventory Mgr' },
    { step: 'In Transit', date: '4 Jan 2026, 07:05', by: 'Truck LR-4412 · own fleet' },
    { step: 'Received', date: '5 Jan 2026, 11:28', by: 'Peter Sirleaf · WH-02' },
  ],
  lines: [
    { product: 'ABC Beginner Book', sku: 'BK-0142', sent: 200, recv: 200, variance: 0, status: 'Complete' },
    { product: 'Handwriting Copybook', sku: 'CB-0104', sent: 180, recv: 180, variance: 0, status: 'Complete' },
    { product: 'Memory Matching Cards', sku: 'GC-0057', sent: 140, recv: 136, variance: -4, status: 'Short received' },
    { product: 'Numbers Puzzle', sku: 'PZ-0091', sent: 100, recv: 100, variance: 0, status: 'Complete' },
  ],
};

export default function TransferDetail() {
  const { id } = useParams();
  const toast = useToast();
  const transfer = id === TRANSFER.id ? TRANSFER : { ...TRANSFER, id };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Warehouses', to: '/warehouses' },
          { label: 'Transfers', to: '/warehouses' },
          { label: transfer.id },
        ]}
      />
      <PageHeader
        title={
          <>
            Transfer {transfer.id} <span className="badge-status badge-instock ms-2">{transfer.status}</span>
          </>
        }
        subtitle={`${transfer.from} → ${transfer.to} · ${transfer.unitsSent} units sent · ${transfer.unitsReceived} received`}
      >
        <button className="btn btn-outline-app" onClick={() => toast('Print dialog (simulated).')}>Print</button>
        <button className="btn btn-outline-app" onClick={() => toast('Duplicate (simulated).')}>Duplicate</button>
        <button className="btn btn-primary-app" onClick={() => toast('GRN download (simulated).')}>Download GRN</button>
      </PageHeader>

      <div className="app-card mb-3">
        <div className="card-head">
          <h5>Transfer Lifecycle</h5>
          <div className="small-note">All steps complete</div>
        </div>
        <div className="card-body-app">
          <div className="timeline">
            {transfer.lifecycle.map((s, i) => (
              <div key={i} className="timeline-step">
                <div className="timeline-dot"><i className="bi bi-check"></i></div>
                <strong>{s.step}</strong>
                <div className="small-note">{s.date}<br />{s.by}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-xl-8">
          <div className="app-card overflow-hidden">
            <div className="card-head">
              <h5>Transfer Lines</h5>
              <div className="small-note">{transfer.lines.length} products</div>
            </div>
            <div className="table-responsive">
              <table className="table table-app">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">SKU</th>
                    <th scope="col" className="text-end">Sent</th>
                    <th scope="col" className="text-end">Received</th>
                    <th scope="col" className="text-end">Variance</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transfer.lines.map((l) => (
                    <tr key={l.sku}>
                      <td>{l.product}</td>
                      <td className="sku">{l.sku}</td>
                      <td className="numeric">{l.sent}</td>
                      <td className="numeric">{l.recv}</td>
                      <td className={`numeric ${l.variance < 0 ? 'text-danger' : ''}`}>{l.variance}</td>
                      <td><StatusBadge status={l.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-light small-note">
              4 units of Memory Matching Cards arrived water-damaged. Logged at WH-02 as ADJ-2026-0021 and excluded from sellable stock.
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="app-card">
            <div className="card-head">
              <h5>Transfer Details</h5>
            </div>
            <div className="card-body-app">
              <Row label="Reference" value={transfer.id} />
              <Row label="Raised" value="3 Jan 2026" />
              <Row label="Completed" value="5 Jan 2026" />
              <Row label="Transit time" value="2 days" />
              <Row label="Distance" value="18 km" />
              <Row label="Value moved" value={money(1704)} />
            </div>
          </div>
        </div>
      </div>
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
