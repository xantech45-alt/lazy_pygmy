import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import BarChart from '../../components/charts/BarChart.jsx';
import DonutChart from '../../components/charts/DonutChart.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * Analytics — replaces analytics.html (PPT slide 6).
 * Three-up chart grid: warehouse bars, top-products bars, orders-by-status donut
 * + a low-stock action table that links to /inventory/low-stock.
 * Chart datasets verbatim from analytics.html inline script (AUDIT_REPORT §4).
 * Low-stock rows derive live data from localStorage products — same shape as the
 * static HTML's first 3 low-stock rows (Animal Puzzle, English Alphabet
 * Flashcards, Numbers Puzzle).
 */
export default function Analytics() {
  const toast = useToast();
  const products = localStorageStore.getProducts();
  const lowStock = products
    .filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock')
    .slice(0, 3);

  const warehouseUnits = [8940, 5720, 3790];
  const warehouseLabels = ['WH-01 Central', 'WH-02 Paynesville', 'WH-03 Gbarnga'];
  const topValues = [1240, 980, 860, 740, 620];
  const topLabels = ['ABC Beginner Book', 'Handwriting Copybook', 'Animal Puzzle', 'Memory Match', 'Alphabet Cards'];
  const donutValues = [168, 60, 42, 16];
  const donutLabels = ['Delivered', 'Packed / Dispatched', 'Processing', 'Cancelled'];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Analytics overview' },
        ]}
      />
      <PageHeader
        title="Expanded Analytics"
        subtitle="Warehouse performance, product velocity and order pipeline · January 2026"
      >
        <button className="btn btn-outline-app">Last 30 days</button>
        <button className="btn btn-outline-app" onClick={() => toast('Exported analytics snapshot (simulated).')}>
          Export
        </button>
      </PageHeader>

      <div className="analytics-grid mb-3">
        <div className="app-card">
          <div className="card-head">
            <h5>Warehouse Stock Levels</h5>
            <div className="small-note">Units on hand by warehouse</div>
          </div>
          <div className="card-body-app chart-box">
            <BarChart id="whBar" alt="Units on hand by warehouse" values={warehouseUnits} labels={warehouseLabels} />
          </div>
        </div>
        <div className="app-card">
          <div className="card-head">
            <h5>Top Selling Products</h5>
            <div className="small-note">Units sold, January 2026</div>
          </div>
          <div className="card-body-app chart-box">
            <BarChart id="topBar" alt="Top selling products by units sold, January 2026" values={topValues} labels={topLabels} />
          </div>
        </div>
        <div className="app-card">
          <div className="card-head">
            <h5>Orders by Status</h5>
            <div className="small-note">286 orders this month</div>
          </div>
          <div className="card-body-app chart-box">
            <DonutChart id="ordersDonut" alt="Orders this month by status" values={donutValues} labels={donutLabels} />
          </div>
        </div>
      </div>

      <div className="app-card">
        <div className="card-head d-flex justify-content-between">
          <div>
            <h5 className="mb-0">Low Stock — Action Required</h5>
            <div className="small-note">18 products below reorder level · 7 already out of stock</div>
          </div>
          <Link to="/inventory/low-stock">View all 18</Link>
        </div>
        <div className="table-responsive">
          <table className="table table-app">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">SKU</th>
                <th scope="col" className="text-end">Current</th>
                <th scope="col" className="text-end">Reorder</th>
                <th scope="col" className="text-end">Recommended</th>
                <th scope="col">Supplier</th>
                <th scope="col">Days Left</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => {
                const recommended = Math.max(p.reorder * 2, p.qty + p.reorder);
                const days = p.qty === 0 ? 0 : Math.max(1, Math.round((p.qty / p.reorder) * 10));
                const danger = p.qty === 0;
                return (
                  <tr key={p.sku}>
                    <td>{p.name}</td>
                    <td className="sku">{p.sku}</td>
                    <td className={`numeric ${danger ? 'text-danger' : ''}`}>{p.qty}</td>
                    <td className="numeric">{p.reorder}</td>
                    <td className="numeric fw-bold">{recommended}</td>
                    <td>{p.supplier}</td>
                    <td className={`fw-bold ${danger ? 'text-danger' : 'text-warning'}`}>{days} d</td>
                    <td>
                      <Link to={`/purchase-orders/new?supplier=${encodeURIComponent(p.supplier)}`} className="btn btn-sm btn-outline-app">
                        Create PO
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
