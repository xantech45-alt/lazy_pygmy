import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useToast } from '../../components/ToastProvider.jsx';
import { printPage } from '../../lib/print.js';

/**
 * OrderDeliveries — replaces orders/deliveries.html (PPT slide 41).
 * 4 KPI tiles + today's deliveries table + Proof of Delivery and
 * Route Progress side cards.
 */
const ROUTES = [
  { name: 'Monrovia Central', pct: 80 },
  { name: 'Coastal', pct: 60 },
  { name: 'Bong Loop', pct: 40 },
  { name: 'Western', pct: 30 },
];

const DELIVERIES = [
  { order: 'ORD-2026-0084', school: 'St. Teresa Primary', route: 'Monrovia Central', officer: 'Peter Sirleaf', eta: '14:12', status: 'Delivered' },
  { order: 'ORD-2026-0079', school: 'Buchanan Junior High', route: 'Coastal', officer: 'James Kollie', eta: '09:05', status: 'Delivered' },
  { order: 'ORD-2026-0078', school: 'Sinje Public Elementary', route: 'Western', officer: 'Peter Sirleaf', eta: '10:30', status: 'Delivered' },
  { order: 'ORD-2026-0083', school: 'Bong Mission Kinder.', route: 'Bong Loop', officer: 'Peter Sirleaf', eta: '11:20', status: 'In Transit' },
  { order: 'ORD-2026-0080', school: 'Zwedru Model School', route: 'Southeast', officer: 'James Kollie', eta: '16:40', status: 'In Transit' },
  { order: 'ORD-2026-0085', school: 'St. Teresa Primary', route: 'Monrovia Central', officer: 'Peter Sirleaf', eta: '8 Jan', status: 'Pending' },
  { order: 'ORD-2026-0087', school: 'Nimba Community', route: 'Nimba Corridor', officer: 'Peter Sirleaf', eta: '15 Jan', status: 'Pending' },
];

export default function OrderDeliveries() {
  const toast = useToast();

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Orders', to: '/orders' }, { label: 'Deliveries' }]} />
      <PageHeader
        title="Delivery Management"
        subtitle="7 January 2026 · 3 active routes · 12 deliveries scheduled · 2 officers on the road"
      >
        <button className="btn btn-outline-app" onClick={() => printPage({ title: 'Manifest - 7 January 2026' })}>
          Print Manifest
        </button>
        <button className="btn btn-primary-app" onClick={() => toast('Route planner opened.')}>+ Plan Route</button>
      </PageHeader>

      <div className="row g-3 mb-3">
        <Tile label="Deliveries today" value="12" note="across 3 routes" />
        <Tile label="Completed" value="8" note="67% of today" green />
        <Tile label="In transit" value="2" note="ETA before 17:00" amber />
        <Tile label="Pending" value="2" note="scheduled 8–15 Jan" gray />
      </div>

      <div className="content-grid">
        <div>
          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Today&apos;s Deliveries</h3>
              <button type="button" className="btn btn-link p-0" onClick={() => printPage({ title: 'Manifest - 7 January 2026' })}>
                Manifest
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-app">
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">School</th>
                    <th scope="col">Route</th>
                    <th scope="col">Officer</th>
                    <th scope="col">ETA</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {DELIVERIES.map((d) => (
                    <tr key={d.order}>
                      <td className="sku">
                        <Link to={`/orders/${d.order}`}>{d.order}</Link>
                      </td>
                      <td>{d.school}</td>
                      <td>{d.route}</td>
                      <td>{d.officer}</td>
                      <td>{d.eta}</td>
                      <td><StatusBadge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-toolbar">8 delivered · 2 in transit · 2 pending</div>
          </div>
          <div className="info-callout mt-3">
            Every delivery needs a signature or photo before the order can be marked Delivered.
          </div>
        </div>

        <aside className="d-grid gap-3">
          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Proof of Delivery</h3>
            </div>
            <div className="card-body-app">
              <div className="small-note mb-3">ORD-2026-0084 · 6 Jan, 14:12</div>
              <div className="pod-grid">
                <div><i className="bi bi-vector-pen" /><span>Signature</span></div>
                <div><i className="bi bi-camera" /><span>Photo</span></div>
              </div>
              <hr />
              <div className="kv-row"><span>Received by</span><strong>Sister Mary Toe</strong></div>
              <div className="kv-row"><span>Officer</span><strong>Peter Sirleaf</strong></div>
              <div className="kv-row"><span>GPS</span><strong>6.3106° N, 10.8047° W</strong></div>
            </div>
          </div>

          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Route Progress</h3>
            </div>
            <div className="card-body-app">
              {ROUTES.map((r) => (
                <div key={r.name} className="mb-3">
                  <div className="progress-label">
                    <span>{r.name}</span>
                    <strong>{r.pct}%</strong>
                  </div>
                  <div className="progress app-progress">
                    <div className="progress-bar" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function Tile({ label, value, note, green, amber, gray }) {
  const cls = green ? 'kpi-card kpi-green' : amber ? 'kpi-card kpi-amber' : gray ? 'kpi-card kpi-gray' : 'kpi-card';
  return (
    <div className="col-md-3">
      <div className={cls}>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        <div className="kpi-note">{note}</div>
      </div>
    </div>
  );
}