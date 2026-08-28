import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { number } from '../../lib/format.js';

/**
 * InventoryLowStock — replaces inventory/low-stock.html (PPT slide 16).
 * Live product list filtered to "Low Stock" + "Out of Stock", grouped by supplier
 * in the right-rail "Suggested reorder" panel.
 */
export default function InventoryLowStock() {
  const products = localStorageStore.getProducts();
  const low = products.filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock');

  const bySupplier = low.reduce((acc, p) => {
    const key = p.supplier || 'Unknown';
    if (!acc[key]) acc[key] = { name: key, products: 0, units: 0, value: 0 };
    acc[key].products += 1;
    acc[key].units += Math.max(0, p.reorder * 2 - p.qty);
    acc[key].value += Math.max(0, p.reorder * 2 - p.qty) * p.cost;
    return acc;
  }, {});
  const supplierRows = Object.values(bySupplier).sort((a, b) => b.value - a.value);
  const totalEstimate = supplierRows.reduce((a, b) => a + b.value, 0);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Inventory', to: '/inventory' }, { label: 'Low stock' }]} />
      <PageHeader
        title="Low Stock Alerts"
        subtitle={`${low.length} products need attention · ${low.filter((p) => p.status === 'Out of Stock').length} out of stock · ${low.filter((p) => p.status === 'Low Stock').length} below reorder level · checked hourly`}
      >
        <button
          className="btn btn-outline-app"
          disabled
          aria-disabled="true"
          title="Reorder rules configuration is not available in this prototype"
        >
          Reorder rules
        </button>
        <Link to="/purchase-orders/new" className="btn btn-primary-app">
          + Generate Purchase Orders
        </Link>
      </PageHeader>

      <div className="alert alert-danger border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <strong>{low.filter((p) => p.status === 'Out of Stock').length} products are out of stock</strong>
          <div>3 of them appear on open school orders — 620 units cannot be fulfilled today.</div>
        </div>
        <div>
          <Link to="/orders" className="btn btn-sm btn-outline-danger">
            View blocked orders
          </Link>
          <Link to="/purchase-orders/new" className="btn btn-sm btn-danger ms-2">
            Create POs for all
          </Link>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-xl-9">
          <div className="app-card overflow-hidden">
            <div className="card-head d-flex justify-content-between">
              <h5>Products Below Reorder Level</h5>
              <span className="small-note">Sorted by urgency</span>
            </div>
            <div className="table-responsive">
              <table className="table table-app">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">SKU</th>
                    <th scope="col" className="text-end">Current</th>
                    <th scope="col" className="text-end">Reorder</th>
                    <th scope="col" className="text-end">Suggested</th>
                    <th scope="col">Supplier</th>
                    <th scope="col">Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  {low.map((p) => {
                    const suggested = Math.max(p.reorder * 2, p.qty + p.reorder);
                    const days = p.qty === 0 ? 'now' : `${Math.max(1, Math.round((p.qty / p.reorder) * 10))} d`;
                    const danger = p.qty === 0;
                    return (
                      <tr key={p.sku}>
                        <td>
                          <Link to={`/products/${p.sku}`}>{p.name}</Link>
                        </td>
                        <td className="sku">{p.sku}</td>
                        <td className="numeric">{p.qty}</td>
                        <td className="numeric">{number(p.reorder)}</td>
                        <td className="numeric fw-bold">{number(suggested)}</td>
                        <td>{p.supplier}</td>
                        <td className={`fw-bold ${danger ? 'text-danger' : 'text-warning'}`}>{days}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-xl-3">
          <div className="app-card">
            <div className="card-head">
              <h5>Suggested Reorder</h5>
              <div className="small-note">Grouped by supplier</div>
            </div>
            <div className="card-body-app">
              {supplierRows.map((s) => (
                <div key={s.name} className="py-3 border-bottom">
                  <strong>{s.name}</strong>
                  <div className="small-note">
                    · {s.products} {s.products === 1 ? 'product' : 'products'} · {number(s.units)} units
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <strong>${s.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                    <Link className="btn btn-sm btn-outline-app" to={`/purchase-orders/new?supplier=${encodeURIComponent(s.name)}`}>
                      Create PO
                    </Link>
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-between pt-3">
                <span>Total estimate</span>
                <strong>${totalEstimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
