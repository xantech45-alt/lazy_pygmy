import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * ProductHistory — replaces products/history.html (PPT slide 14).
 * KPI ribbon (opening, stock-in, stock-out, closing) + movements table
 * showing recent SALE / PURCHASE / TRANSFER / ADJUSTMENT entries for this SKU.
 */
const SAMPLE = [
  { tx: 'ORD-2026-0086', date: '7 Jan 2026', type: 'Sale', movement: 'WH-01 → Nimba Community School', qty: -316, balance: 1240, who: 'Grace Doe', ref: 'Order' },
  { tx: 'ORD-2026-0084', date: '6 Jan 2026', type: 'Sale', movement: 'WH-01 → St. Teresa Primary', qty: -120, balance: 1556, who: 'Grace Doe', ref: 'Order' },
  { tx: 'PO-2026-0117', date: '5 Jan 2026', type: 'Purchase', movement: 'Kakata Paper Mills → WH-01', qty: 400, balance: 1676, who: 'James Kollie', ref: 'Purchase order' },
  { tx: 'ADJ-2026-0019', date: '4 Jan 2026', type: 'Adjustment', movement: 'WH-01 · damaged in storage', qty: -8, balance: 1276, who: 'Moses Kollie', ref: 'Adjustment' },
  { tx: 'TRF-2026-0042', date: '3 Jan 2026', type: 'Transfer', movement: 'WH-01 → WH-02 Paynesville', qty: -200, balance: 1284, who: 'Sarah Weah', ref: 'Transfer' },
];

export default function ProductHistory() {
  const { sku } = useParams();
  const product = localStorageStore.getProducts().find((p) => p.sku === sku);
  const toast = useToast();

  if (!product) {
    return (
      <>
        <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Products', to: '/products' }, { label: 'Not found' }]} />
        <PageHeader title="Product not found" subtitle={sku}>
          <Link to="/products" className="btn btn-outline-app">
            Back
          </Link>
        </PageHeader>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Products', to: '/products' },
          { label: product.name, to: `/products/${sku}` },
          { label: 'Inventory history' },
        ]}
      />
      <PageHeader
        title="Inventory History"
        subtitle={`${product.sku} · ${product.name} · 27 Dec 2025 – 7 Jan 2026 · ${SAMPLE.length} movements`}
      >
        <button className="btn btn-outline-app">Last 90 days</button>
        <button className="btn btn-outline-app" onClick={() => toast('CSV export (simulated).')}>
          Export CSV
        </button>
      </PageHeader>

      <ul className="nav tabs-app mb-3">
        <li>
          <Link className="nav-link" to={`/products/${sku}`}>
            Overview
          </Link>
        </li>
        <li>
          <span className="nav-link active">Inventory History</span>
        </li>
        <li>
          <span className="nav-link" aria-disabled="true" title="Coming soon">Sales</span>
        </li>
        <li>
          <span className="nav-link" aria-disabled="true" title="Coming soon">Purchase Orders</span>
        </li>
      </ul>

      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <KpiTile label="Opening balance" value="980" note="27 Dec 2025" />
        </div>
        <div className="col-md-3">
          <KpiTile label="Total stock in" value="+1,224" note="2 purchases · 1 return" />
        </div>
        <div className="col-md-3">
          <KpiTile label="Total stock out" value="−964" note="4 sales · 1 transfer · 1 adjustment" />
        </div>
        <div className="col-md-3">
          <KpiTile label="Closing balance" value={product.qty.toLocaleString()} note="7 Jan 2026" />
        </div>
      </div>

      <div className="app-card overflow-hidden">
        <div className="card-head d-flex justify-content-between">
          <h5>Stock Movements</h5>
          <button className="btn btn-sm btn-outline-app">Filter by type</button>
        </div>
        <div className="table-responsive">
          <table className="table table-app">
            <thead>
              <tr>
                <th scope="col">Transaction</th>
                <th scope="col">Date</th>
                <th scope="col">Type</th>
                <th scope="col">Movement</th>
                <th scope="col" className="text-end">Qty</th>
                <th scope="col" className="text-end">Balance</th>
                <th scope="col">Employee</th>
                <th scope="col">Reference</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE.map((m, i) => (
                <tr key={i}>
                  <td className="sku">{m.tx}</td>
                  <td>{m.date}</td>
                  <td>{m.type}</td>
                  <td>{m.movement}</td>
                  <td className={`numeric ${m.qty < 0 ? 'text-danger' : 'text-success'}`}>
                    {m.qty > 0 ? '+' : ''}
                    {m.qty}
                  </td>
                  <td className="numeric">{m.balance.toLocaleString()}</td>
                  <td>{m.who}</td>
                  <td>{m.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-toolbar">
          <span className="small-note">9 movements · net change +260 units · balances reconcile to the inventory ledger</span>
        </div>
      </div>
    </>
  );
}

function KpiTile({ label, value, note }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="small-note">{note}</div>
    </div>
  );
}
