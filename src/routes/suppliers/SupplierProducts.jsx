import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { money } from '../../lib/format.js';

/**
 * SupplierProducts — replaces suppliers/products.html (PPT slide 28).
 * Tabs (Overview / Products / POs / Performance / Documents), KPI summary
 * (products / monthly spend / on-time) + filtered products table.
 */
export default function SupplierProducts() {
  const { code } = useParams();
  const supplier = localStorageStore.getSuppliers().find((s) => s.code === code);
  const products = localStorageStore.getProducts().filter((p) => p.supplier === supplier?.name);

  if (!supplier) {
    return (
      <>
        <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Suppliers', to: '/suppliers' }, { label: 'Not found' }]} />
        <PageHeader title="Supplier not found" subtitle={code}>
          <Link to="/suppliers" className="btn btn-outline-app">Back</Link>
        </PageHeader>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Suppliers', to: '/suppliers' },
          { label: supplier.code, to: `/suppliers/${supplier.code}` },
          { label: 'Products' },
        ]}
      />
      <PageHeader title="Supplier Products" subtitle={`${supplier.name} · ${supplier.code} · ${products.length} products supplied`}>
        <Link to={`/suppliers/${supplier.code}`} className="btn btn-outline-app">Back</Link>
        <Link to="/purchase-orders/new" className="btn btn-primary-app">+ New PO</Link>
      </PageHeader>

      <ul className="nav tabs-app mb-3">
        <li><Link className="nav-link" to={`/suppliers/${supplier.code}`}>Overview</Link></li>
        <li><span className="nav-link active">Products</span></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Purchase Orders</span></li>
        <li><Link className="nav-link" to={`/suppliers/${supplier.code}/performance`}>Performance</Link></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Documents</span></li>
      </ul>

      <div className="row g-3 mb-3">
        <Tile label="Products supplied" value={products.length || supplier.products} />
        <Tile label="Monthly spend" value={money(Math.round((supplier.purchases || 0) / 12))} />
        <Tile label="On-time delivery" value="91%" success />
      </div>

      <div className="app-card overflow-hidden">
        <div className="card-head">
          <h5>Products supplied by {supplier.name}</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-app">
            <thead>
              <tr>
                <th scope="col">SKU</th>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col" className="text-end">Cost</th>
                <th scope="col" className="text-end">On hand</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.sku}>
                  <td className="sku"><Link to={`/products/${p.sku}`}>{p.sku}</Link></td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td className="numeric">{money(p.cost)}</td>
                  <td className="numeric">{p.qty.toLocaleString()}</td>
                  <td><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Tile({ label, value, success }) {
  return (
    <div className="col-md-4">
      <div className="kpi-card">
        <div className="kpi-label">{label}</div>
        <div className={`kpi-value ${success ? 'text-success' : ''}`}>{value}</div>
      </div>
    </div>
  );
}
