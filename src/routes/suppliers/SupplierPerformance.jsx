import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';

/**
 * SupplierPerformance — replaces suppliers/performance.html (PPT slide 29).
 * KPI tiles (rating, on-time, lead time, claims) + small commentary paragraph.
 */
export default function SupplierPerformance() {
  const { code } = useParams();
  const supplier = localStorageStore.getSuppliers().find((s) => s.code === code);

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
          { label: 'Performance' },
        ]}
      />
      <PageHeader
        title="Supplier Performance"
        subtitle={`${supplier.name} · ${supplier.code} · last 12 months`}
      >
        <Link to={`/suppliers/${supplier.code}`} className="btn btn-outline-app">Back</Link>
      </PageHeader>

      <ul className="nav tabs-app mb-3">
        <li><Link className="nav-link" to={`/suppliers/${supplier.code}`}>Overview</Link></li>
        <li><Link className="nav-link" to={`/suppliers/${supplier.code}/products`}>Products</Link></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Purchase Orders</span></li>
        <li><span className="nav-link active">Performance</span></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Documents</span></li>
      </ul>

      <div className="row g-3 mb-3">
        <Tile label="Overall rating" value={`${supplier.rating} / 5`} />
        <Tile label="On-time delivery" value="91%" success />
        <Tile label="Average lead time" value="12 days" />
        <Tile label="Quality claims" value="0.4%" warning />
      </div>

      <div className="app-card">
        <div className="card-head">
          <h5>Commentary</h5>
        </div>
        <div className="card-body-app">
          <p className="mb-2">
            {supplier.name} consistently meets delivery dates and product quality on the Books and Puzzles lines.
            Lead time was 14 days for the 800-unit rush re-order in October 2025; standard orders complete in 12 days.
          </p>
          <p className="mb-0 text-muted-app small-note">
            Compliance valid through Jun 2026. Two minor quality incidents in 24 months (one spoiled shrink-wrap; one mis-printed cover) resolved with replacement at no cost.
          </p>
        </div>
      </div>
    </>
  );
}

function Tile({ label, value, success, warning }) {
  return (
    <div className="col-md-3">
      <div className="kpi-card">
        <div className="kpi-label">{label}</div>
        <div className={`kpi-value ${success ? 'text-success' : warning ? 'text-warning' : ''}`}>{value}</div>
      </div>
    </div>
  );
}
