import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { printPage } from '../../lib/print.js';

/**
 * OrderProcessing — replaces orders/processing.html (PPT slide 40).
 * 5-step fulfilment timeline (Confirmed → Processing → Packed →
 * Dispatched → Delivered) + Pick List + Dispatch Details side card.
 */
const PICK = [
  { sku: 'BK-0142', name: 'ABC Beginner Book', bin: 'A-01-03', qty: 80, picked: 80 },
  { sku: 'CB-0104', name: 'Handwriting Copybook', bin: 'C-04-02', qty: 60, picked: 60 },
  { sku: 'GC-0057', name: 'Memory Matching Cards', bin: 'E-03-04', qty: 40, picked: 40 },
];

export default function OrderProcessing() {
  const { order } = useParams();
  const o = localStorageStore.getOrders().find((x) => x.order === order);
  const toast = useToast();

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

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Orders', to: '/orders' },
          { label: o.order, to: `/orders/${o.order}` },
          { label: 'Processing' },
        ]}
      />
      <PageHeader
        title="Order Processing"
        subtitle={
          <>
            <span className="badge-status badge-low me-2">Packed</span>
            <StatusBadge status={o.payment} />
            <br />
            {o.order} · {o.school} · {PICK.length} lines · 180 units · $486.00
          </>
        }
      >
        <button className="btn btn-outline-app" onClick={() => printPage({ title: `Pick List - ${o.order}` })}>
          Print Pick List
        </button>
        <button className="btn btn-primary-app" onClick={() => toast(`${o.order} marked as Dispatched.`)}>Mark as Dispatched</button>
      </PageHeader>

      <div className="app-card">
        <div className="card-head d-flex justify-content-between align-items-center">
          <h3 className="card-heading">Fulfilment Progress</h3>
        </div>
        <div className="card-body-app">
          <div className="text-end text-primary fw-bold">3 of 5 complete</div>
          <div className="fulfilment-line">
            <Step done active label="Confirmed" when="7 Jan, 09:12" who="Grace Doe" />
            <Step done label="Processing" when="7 Jan, 09:40" who="Sarah Weah" />
            <Step done active label="Packed" when="7 Jan, 11:05" who="Sarah Weah" />
            <Step label="Dispatched" when="pending" who="awaiting van" />
            <Step label="Delivered" when="pending" who="ETA 8 Jan" />
          </div>
        </div>
      </div>

      <div className="content-grid mt-3">
        <div className="app-card">
          <div className="card-head d-flex justify-content-between align-items-center">
            <h3 className="card-heading">Pick List</h3>
            <strong className="text-primary">WH-01 Central</strong>
          </div>
          <div className="table-responsive">
            <table className="table table-app">
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">Product</th>
                  <th scope="col">SKU</th>
                  <th scope="col">Bin</th>
                  <th scope="col" className="text-end">Qty</th>
                  <th scope="col" className="text-end">Picked</th>
                </tr>
              </thead>
              <tbody>
                {PICK.map((p) => (
                  <tr key={p.sku}>
                    <td className="text-success">✓</td>
                    <td>{p.name}</td>
                    <td className="sku">{p.sku}</td>
                    <td>{p.bin}</td>
                    <td className="numeric">{p.qty}</td>
                    <td className="numeric text-success fw-bold">{p.picked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-body-app">
            <div className="success-callout">
              All 180 units picked and packed into 3 cartons — ready for dispatch.
            </div>
            <div className="small-note mt-3">
              Picked by Sarah Weah · checked by Peter Sirleaf
              <br />
              Stock was deducted from WH-01 when the order moved to Processing.
            </div>
          </div>
        </div>

        <aside>
          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Dispatch Details</h3>
            </div>
            <div className="card-body-app">
              <div className="kv-row"><span>Warehouse</span><strong>WH-01 Central</strong></div>
              <div className="kv-row"><span>Picker</span><strong>Sarah Weah</strong></div>
              <div className="kv-row"><span>Packer</span><strong>Sarah Weah</strong></div>
              <div className="kv-row"><span>Cartons</span><strong>3</strong></div>
              <div className="kv-row"><span>Total weight</span><strong>28.4 kg</strong></div>
              <div className="kv-row"><span>Delivery route</span><strong>Monrovia Central</strong></div>
              <div className="kv-row"><span>Delivery officer</span><strong>Peter Sirleaf</strong></div>
              <div className="kv-row"><span>Vehicle</span><strong>Van LR-2208</strong></div>
              <hr />
              <div className="section-kicker">Next Action</div>
              <p className="small-note">Load onto Van LR-2208 and mark as dispatched. The school is notified by SMS automatically.</p>
              <button className="btn btn-primary-app w-100" onClick={() => toast(`${o.order} marked as Dispatched.`)}>Mark as Dispatched</button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function Step({ done, active, label, when, who }) {
  const cls = done ? `fulfil-step done${active ? ' active' : ''}` : 'fulfil-step';
  return (
    <div className={cls}>
      <span>{done ? '✓' : ''}</span>
      <strong>{label}</strong>
      <small>{when}<br />{who}</small>
    </div>
  );
}