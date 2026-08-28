import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import KpiCard from '../../components/KpiCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import RowActionsMenu from '../../components/RowActionsMenu.jsx';
import Pagination from '../../components/Pagination.jsx';
import useIndexTable from '../../hooks/useIndexTable.js';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { money, number } from '../../lib/format.js';

/**
 * InventoryIndex — replaces inventory/index.html (PPT slide 15).
 * Mirrors the inline script in inventory/index.html: KPIs (total products,
 * units, value, low-stock, out-of-stock) + stock-by-product table sourced from
 * LPStore.getProducts().
 * Audit fix #27: wired through useIndexTable for search + filter + sort +
 * pagination + bulk-select. The previous version had decorative selects
 * that did nothing.
 */
export default function InventoryIndex() {
  const products = localStorageStore.getProducts();
  const totalUnits = products.reduce((a, b) => a + b.qty, 0);
  const totalValue = products.reduce((a, b) => a + b.qty * b.cost, 0);
  const lowCount = products.filter((p) => p.status === 'Low Stock').length;
  const outCount = products.filter((p) => p.status === 'Out of Stock').length;

  const filterKeys = useMemo(() => [
    { key: 'category', options: (rows) => [...new Set(rows.map((p) => p.category))] },
    { key: 'warehouse', options: (rows) => [...new Set(rows.map((p) => p.warehouse))] },
    { key: 'status', options: (rows) => [...new Set(rows.map((p) => p.status))] },
  ], []);

  const t = useIndexTable({
    rows: products,
    idKey: 'sku',
    searchKeys: ['name', 'sku'],
    filterKeys,
    initialSort: { key: 'name', asc: true },
  });

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Inventory' }]} />
      <PageHeader
        title="Inventory Overview"
        subtitle="Live stock position across 3 warehouses · updated 7 Jan 2026, 09:42"
      >
        <Link to="/inventory/adjustment" className="btn btn-outline-app">
          Stock Adjustment
        </Link>
        <Link to="/warehouses/transfers/new" className="btn btn-primary-app">
          + Stock Transfer
        </Link>
      </PageHeader>

      <div className="dashboard-kpis mb-3">
        <KpiCard label="Total products" value={number(products.length)} />
        <KpiCard label="Total units" value={number(totalUnits)} />
        <KpiCard label="Inventory value" value={money(totalValue)} />
        <KpiCard label="Low stock" value={number(lowCount + outCount)} />
        <KpiCard label="Out of stock" value={number(outCount)} />
      </div>

      <div className={`bulk-bar mb-3 ${t.selected.size === 0 ? 'd-none' : ''}`}>
        <strong>{t.selected.size}</strong> selected ·{' '}
        <button className="btn btn-sm btn-link" onClick={t.clearSelection}>Clear</button>
      </div>

      <div className="filter-bar mb-3">
        <div className="row g-2">
          <div className="col-lg-4">
            <input
              id="inventorySearch"
              name="inventorySearch"
              className="form-control"
              placeholder="Search by product name or SKU"
              value={t.search.q}
              onChange={(e) => t.search.onChange(e.target.value)}
              aria-label="Search inventory"
            />
          </div>
          <div className="col-lg-2">
            <select
              id="invCategory"
              className="form-select"
              value={t.filter.values.category || ''}
              onChange={(e) => t.filter.set('category', e.target.value)}
              aria-label="Category filter"
            >
              <option value="">Category: All</option>
              {t.filter.options.category.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="col-lg-2">
            <select
              id="invWarehouse"
              className="form-select"
              value={t.filter.values.warehouse || ''}
              onChange={(e) => t.filter.set('warehouse', e.target.value)}
              aria-label="Warehouse filter"
            >
              <option value="">Warehouse: All</option>
              {t.filter.options.warehouse.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="col-lg-2">
            <select
              id="invStatus"
              className="form-select"
              value={t.filter.values.status || ''}
              onChange={(e) => t.filter.set('status', e.target.value)}
              aria-label="Status filter"
            >
              <option value="">Status: All</option>
              {t.filter.options.status.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="app-card overflow-hidden">
        <div className="card-head d-flex justify-content-between flex-wrap gap-2">
          <h5>Stock by Product</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-app">
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={t.paged.length > 0 && t.selected.size === t.paged.length}
                    onChange={t.toggleAll}
                    aria-label="Select all products on this page"
                  />
                </th>
                <th scope="col">
                  <button type="button" className="sort-btn" onClick={() => t.sort.onSort('sku')}>SKU
                    {t.sort.key === 'sku' && <i className={`bi bi-caret-${t.sort.asc ? 'up' : 'down'}-fill`} aria-hidden="true"></i>}
                  </button>
                </th>
                <th scope="col">
                  <button type="button" className="sort-btn" onClick={() => t.sort.onSort('name')}>Product
                    {t.sort.key === 'name' && <i className={`bi bi-caret-${t.sort.asc ? 'up' : 'down'}-fill`} aria-hidden="true"></i>}
                  </button>
                </th>
                <th scope="col">Warehouse</th>
                <th scope="col" className="text-end">On Hand</th>
                <th scope="col" className="text-end">Reserved</th>
                <th scope="col" className="text-end">Available</th>
                <th scope="col" className="text-end">Reorder</th>
                <th scope="col">Status</th>
                <th scope="col">Last Updated</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {t.paged.map((p) => (
                <tr key={p.sku}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={t.selected.has(p.sku)}
                      onChange={() => t.toggleOne(p.sku)}
                      aria-label={`Select ${p.name}`}
                    />
                  </td>
                  <td className="sku">{p.sku}</td>
                  <td>
                    <Link to={`/products/${p.sku}`}>{p.name}</Link>
                  </td>
                  <td>{p.warehouse}</td>
                  <td className="numeric">{number(p.qty)}</td>
                  <td className="numeric">{number(p.reserved || 0)}</td>
                  <td className="numeric">{number(p.qty - (p.reserved || 0))}</td>
                  <td className="numeric">{number(p.reorder || 0)}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td>{p.updated}</td>
                  <td>
                    <RowActionsMenu
                      viewTo={`/products/${p.sku}`}
                      editTo={`/products/${p.sku}/edit`}
                      label={`Actions for ${p.name}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-body-app">
          <Pagination
            page={t.page}
            pageSize={t.pageSize}
            total={t.total}
            onPageChange={t.setPage}
            onPageSizeChange={t.setPageSize}
          />
        </div>
      </div>
    </>
  );
}
