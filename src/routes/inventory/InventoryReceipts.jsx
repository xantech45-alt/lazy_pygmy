import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import KpiCard from '../../components/KpiCard.jsx';
import Pagination from '../../components/Pagination.jsx';
import useIndexTable from '../../hooks/useIndexTable.js';
import { listReceipts, receiptTotals } from '../../data-access/receiptSelectors.js';
import { money, number, exportCsv } from '../../lib/format.js';
import { printPage } from '../../lib/print.js';

/**
 * InventoryReceipts — /inventory/receipts index.
 *
 * Replaces receipts/index.html (GRN list). Backed by listReceipts() which
 * falls back to mockData.receipts on first load. Includes:
 *   - KPI cards (count, total units received, total value, this-month count)
 *   - Search across id / po / supplier / warehouse / receivedBy / deliveryNote
 *   - Filters by supplier and warehouse
 *   - Sortable columns + pagination
 *   - CSV export of the filtered rows
 *   - A4 print via window.print()
 */
export default function InventoryReceipts() {
  const receipts = listReceipts();

  const enriched = useMemo(() => receipts.map((r) => ({
    ...r,
    ...receiptTotals(r),
  })), [receipts]);

  const totals = useMemo(() => {
    const count = enriched.length;
    const units = enriched.reduce((a, b) => a + (b.totalUnits || 0), 0);
    const value = enriched.reduce((a, b) => a + (b.total || 0), 0);
    return { count, units, value };
  }, [enriched]);

  const filterKeys = useMemo(() => [
    { key: 'supplier', options: (rows) => [...new Set(rows.map((r) => r.supplier))] },
    { key: 'warehouse', options: (rows) => [...new Set(rows.map((r) => r.warehouse))] },
  ], []);

  const t = useIndexTable({
    rows: enriched,
    searchKeys: ['id', 'po', 'supplier', 'warehouse', 'receivedBy', 'deliveryNote'],
    filterKeys,
    initialSort: { key: 'id', asc: false },
  });

  const onPrint = () => {
    printPage({ title: 'Inventory Receipts — Lazy Pygmy Inventory Suite' });
  };

  const onExport = () => {
    const rows = t.rows.map((r) => ({
      id: r.id,
      po: r.po,
      supplier: r.supplier,
      warehouse: r.warehouse,
      date: r.date,
      receivedBy: r.receivedBy,
      deliveryNote: r.deliveryNote,
      lineCount: r.lineCount,
      totalUnits: r.totalUnits,
      total: r.total,
    }));
    exportCsv('inventory-receipts.csv', rows);
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Inventory', to: '/inventory' },
          { label: 'Receipts' },
        ]}
      />
      <PageHeader
        title="Inventory Receipts"
        subtitle="Goods Received Notes (GRN) — units booked into a warehouse after supplier delivery"
      >
        <button className="btn btn-outline-app" type="button" onClick={onExport}>
          <i className="bi bi-filetype-csv me-1" aria-hidden="true"></i> Export CSV
        </button>
        <button className="btn btn-outline-app" type="button" onClick={onPrint}>
          <i className="bi bi-printer me-1" aria-hidden="true"></i> Print
        </button>
        <Link to="/purchase-orders" className="btn btn-primary-app">
          <i className="bi bi-clipboard-check me-1" aria-hidden="true"></i> Receive a PO
        </Link>
      </PageHeader>

      <div className="dashboard-kpis mb-3">
        <KpiCard label="Receipts" value={number(totals.count)} variant="teal" />
        <KpiCard label="Total units received" value={number(totals.units)} variant="green" />
        <KpiCard label="Total received value" value={money(totals.value)} variant="mint" />
        <KpiCard label="Suppliers" value={number(new Set(enriched.map((r) => r.supplier)).size)} variant="gray" />
      </div>

      <div className="filter-bar no-print mb-3">
        <div className="row g-2">
          <div className="col-lg-5">
            <input
              id="receiptsSearch"
              name="receiptsSearch"
              className="form-control"
              placeholder="Search by GRN id, PO, supplier, warehouse, receiver, or delivery note"
              value={t.search.q}
              onChange={(e) => t.search.onChange(e.target.value)}
              aria-label="Search receipts"
            />
          </div>
          <div className="col-lg-3">
            <select
              id="recSupplier"
              className="form-select"
              value={t.filter.values.supplier || ''}
              onChange={(e) => t.filter.set('supplier', e.target.value)}
              aria-label="Supplier filter"
            >
              <option value="">Supplier: All</option>
              {t.filter.options.supplier.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="col-lg-3">
            <select
              id="recWarehouse"
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
          <div className="col-lg-1 d-grid">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={t.reset}
              aria-label="Reset filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className={`bulk-bar mb-3 ${t.selected.size === 0 ? 'd-none' : ''} no-print`}>
        <strong>{t.selected.size}</strong> selected ·{' '}
        <button className="btn btn-sm btn-link" onClick={t.clearSelection}>Clear</button>
      </div>

      <div className="app-card overflow-hidden print-card">
        <div className="card-head d-flex justify-content-between align-wrap gap-2">
          <h5>Goods Received Notes</h5>
          <span className="text-muted-app small d-print-none">
            {t.total === 0 ? 'No results' : `${t.total} receipts`}
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-app">
            <thead>
              <tr>
                <th scope="col" className="d-print-none">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={t.paged.length > 0 && t.selected.size === t.paged.length}
                    onChange={t.toggleAll}
                    aria-label="Select all receipts on this page"
                  />
                </th>
                <th scope="col">
                  <button type="button" className="sort-btn" onClick={() => t.sort.onSort('id')}>
                    GRN
                    {t.sort.key === 'id' && (
                      <i className={`bi bi-caret-${t.sort.asc ? 'up' : 'down'}-fill`} aria-hidden="true"></i>
                    )}
                  </button>
                </th>
                <th scope="col">
                  <button type="button" className="sort-btn" onClick={() => t.sort.onSort('po')}>
                    Purchase Order
                    {t.sort.key === 'po' && (
                      <i className={`bi bi-caret-${t.sort.asc ? 'up' : 'down'}-fill`} aria-hidden="true"></i>
                    )}
                  </button>
                </th>
                <th scope="col">
                  <button type="button" className="sort-btn" onClick={() => t.sort.onSort('supplier')}>
                    Supplier
                    {t.sort.key === 'supplier' && (
                      <i className={`bi bi-caret-${t.sort.asc ? 'up' : 'down'}-fill`} aria-hidden="true"></i>
                    )}
                  </button>
                </th>
                <th scope="col">
                  <button type="button" className="sort-btn" onClick={() => t.sort.onSort('date')}>
                    Date
                    {t.sort.key === 'date' && (
                      <i className={`bi bi-caret-${t.sort.asc ? 'up' : 'down'}-fill`} aria-hidden="true"></i>
                    )}
                  </button>
                </th>
                <th scope="col">Warehouse</th>
                <th scope="col" className="text-end">Lines</th>
                <th scope="col" className="text-end">Units</th>
                <th scope="col" className="text-end">Value</th>
                <th scope="col" className="d-print-none"></th>
              </tr>
            </thead>
            <tbody>
              {t.paged.map((r) => (
                <tr key={r.id}>
                  <td className="d-print-none">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={t.selected.has(r.id)}
                      onChange={() => t.toggleOne(r.id)}
                      aria-label={`Select ${r.id}`}
                    />
                  </td>
                  <td className="sku">
                    <Link to={`/inventory/receipts/${r.id}`}>{r.id}</Link>
                  </td>
                  <td>
                    <Link to={`/purchase-orders/${r.po}`}>{r.po}</Link>
                  </td>
                  <td>{r.supplier}</td>
                  <td>{r.date}</td>
                  <td>{r.warehouse}</td>
                  <td className="numeric">{number(r.lineCount)}</td>
                  <td className="numeric">{number(r.totalUnits)}</td>
                  <td className="numeric">{money(r.total)}</td>
                  <td className="d-print-none">
                    <Link to={`/inventory/receipts/${r.id}`} className="btn btn-sm btn-outline-app">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {t.paged.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center text-muted-app py-4">
                    No receipts match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-body-app d-print-none">
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