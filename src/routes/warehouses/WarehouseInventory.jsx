import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Pagination from '../../components/Pagination.jsx';
import usePagination from '../../hooks/usePagination.js';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { money, number } from '../../lib/format.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * WarehouseInventory — replaces warehouses/inventory.html (PPT slide 22).
 * KPI tiles + paginated stock-at-this-warehouse table.
 *
 * Audit fix: bin-location column was computed with Math.random() inside
 * render (line 101 originally), so the same SKU showed a different bin on
 * every re-render — a real data-integrity bug for a picker walking the
 * floor. Now bin assignments are memoised per SKU so they're stable.
 */
function deterministicBin(sku, category) {
  // Simple deterministic hash of the SKU → 1..9 bin number
  let h = 0;
  for (let i = 0; i < sku.length; i++) h = (h * 31 + sku.charCodeAt(i)) >>> 0;
  const aisle = String.fromCharCode(65 + (h % 6)); // A..F
  const section = ((h >> 4) % 9) + 1;
  const shelf = ((h >> 8) % 6) + 1;
  return `${aisle}-${section}-${shelf}`;
}

export default function WarehouseInventory() {
  const { code } = useParams();
  const toast = useToast();
  const warehouse = localStorageStore.getWarehouses().find((w) => w.code === code);
  const products = localStorageStore.getProducts().filter((p) => p.warehouse.startsWith(code || ''));
  const { page, pageSize, setPage, setPageSize, paged, total } = usePagination(products);

  // Memoise bin assignments for the visible product set so the same SKU
  // always shows the same bin across re-renders / pagination changes.
  const bins = useMemo(() => {
    const m = new Map();
    products.forEach((p) => m.set(p.sku, deterministicBin(p.sku, p.category)));
    return m;
  }, [products]);

  if (!warehouse) {
    return (
      <>
        <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Warehouses', to: '/warehouses' }, { label: 'Not found' }]} />
        <PageHeader title="Warehouse not found" subtitle={code}>
          <Link to="/warehouses" className="btn btn-outline-app">Back</Link>
        </PageHeader>
      </>
    );
  }

  const onHand = products.reduce((a, b) => a + b.qty, 0);
  const stockValue = products.reduce((a, b) => a + b.qty * b.cost, 0);
  const below = products.filter((p) => p.qty < p.reorder).length;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Warehouses', to: '/warehouses' },
          { label: warehouse.code, to: `/warehouses/${warehouse.code}` },
          { label: 'Inventory' },
        ]}
      />
      <PageHeader
        title="Warehouse Inventory"
        subtitle={`${warehouse.code} ${warehouse.name} · ${warehouse.location} · bin locations shown`}
      >
        <button className="btn btn-outline-app" onClick={() => toast('Exported inventory (simulated).')}>Export</button>
        <button className="btn btn-outline-app">Cycle Count</button>
        <Link to="/inventory/adjustment" className="btn btn-primary-app">
          + Stock Adjustment
        </Link>
      </PageHeader>

      <ul className="nav tabs-app mb-3">
        <li><Link className="nav-link" to={`/warehouses/${warehouse.code}`}>Overview</Link></li>
        <li><span className="nav-link active">Inventory</span></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Movements</span></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Transfers</span></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Performance</span></li>
      </ul>

      <div className="row g-3 mb-3">
        <KpiTile label="Products held" value={number(products.length)} />
        <KpiTile label="Units on hand" value={number(onHand)} />
        <KpiTile label="Stock value" value={money(stockValue)} />
        <KpiTile label="Below reorder" value={number(below)} note="of 18 network-wide" />
      </div>

      <div className="app-card overflow-hidden">
        <div className="card-head d-flex justify-content-between">
          <h5>Stock at this Warehouse</h5>
          <select className="form-select form-select-sm" style={{ width: 'auto' }}>
            <option>Filter by category</option>
          </select>
        </div>
        <div className="table-responsive">
          <table className="table table-app">
            <thead>
              <tr>
                <th scope="col">SKU</th>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col">Bin</th>
                <th scope="col" className="text-end">On Hand</th>
                <th scope="col" className="text-end">Reserved</th>
                <th scope="col" className="text-end">Available</th>
                <th scope="col" className="text-end">Value</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p) => (
                <tr key={p.sku}>
                  <td className="sku">
                    <Link to={`/products/${p.sku}`}>{p.sku}</Link>
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{bins.get(p.sku) ?? '—'}</td>
                  <td className="numeric">{number(p.qty)}</td>
                  <td className="numeric">{number(p.reserved || 0)}</td>
                  <td className="numeric">{number(p.qty - (p.reserved || 0))}</td>
                  <td className="numeric">{money(p.qty * p.cost)}</td>
                  <td><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-body-app">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(n) => { setPageSize(n); setPage(0); }}
          />
        </div>
      </div>
    </>
  );
}

function KpiTile({ label, value, note }) {
  return (
    <div className="col-md-3">
      <div className="kpi-card">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {note && <div className="small-note">{note}</div>}
      </div>
    </div>
  );
}
