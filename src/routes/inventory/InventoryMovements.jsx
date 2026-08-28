import { useMemo, useState } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Pagination from '../../components/Pagination.jsx';
import { useToast } from '../../components/ToastProvider.jsx';
import usePagination from '../../hooks/usePagination.js';

/**
 * InventoryMovements — replaces inventory/movements.html (PPT slide 18).
 * Filter chips (All types / Sale / Purchase / Transfer / Adjustment / Return /
 * Damaged), movements table (5 sample rows), shared pagination control.
 */
const SAMPLE = [
  { id: 'TRX-2026-1284', date: '7 Jan', product: 'ABC Beginner Book', src: 'WH-01 Central', dst: 'Nimba Community School', qty: -316, type: 'Sale', who: 'Grace Doe', ref: 'ORD-0086' },
  { id: 'TRX-2026-1283', date: '7 Jan', product: 'Handwriting Copybook', src: 'WH-01 Central', dst: 'St. Teresa Primary', qty: -180, type: 'Sale', who: 'Grace Doe', ref: 'ORD-0085' },
  { id: 'TRX-2026-1280', date: '5 Jan', product: 'ABC Beginner Book', src: 'Kakata Paper Mills', dst: 'WH-01 Central', qty: 400, type: 'Purchase', who: 'James Kollie', ref: 'PO-0117' },
  { id: 'TRX-2026-1278', date: '4 Jan', product: 'Animal Puzzle', src: 'WH-01 Central', dst: 'Write-off', qty: -12, type: 'Damaged', who: 'Moses Kollie', ref: 'ADJ-0019' },
  { id: 'TRX-2026-1277', date: '3 Jan', product: 'ABC Beginner Book', src: 'WH-01 Central', dst: 'WH-02 Paynesville', qty: -200, type: 'Transfer', who: 'Sarah Weah', ref: 'TRF-0042' },
];
const TYPES = ['All types', 'Sale', 'Purchase', 'Transfer', 'Adjustment', 'Return', 'Damaged'];

const sign = (n) => (n > 0 ? '+' : n < 0 ? '−' : '');

function formatUnits(n) {
  return `${sign(n)}${Math.abs(n).toLocaleString('en-US')}`;
}

export default function InventoryMovements() {
  const toast = useToast();
  const [filter, setFilter] = useState('All types');

  const filtered = useMemo(
    () => (filter === 'All types' ? SAMPLE : SAMPLE.filter((r) => r.type === filter)),
    [filter],
  );
  const totals = useMemo(() => {
    let stockIn = 0;
    let stockOut = 0;
    for (const r of filtered) {
      if (r.qty > 0) stockIn += r.qty;
      else stockOut += Math.abs(r.qty);
    }
    return { stockIn, stockOut, net: stockIn - stockOut };
  }, [filtered]);
  const { page, pageSize, setPage, setPageSize, paged, total } = usePagination(filtered);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Inventory', to: '/inventory' }, { label: 'Stock movements' }]} />
      <PageHeader
        title="Stock Movement History"
        subtitle={`${total} movements shown · stock in ${formatUnits(totals.stockIn)} · stock out ${formatUnits(-totals.stockOut)} · net ${formatUnits(totals.net)} units`}
      >
        <button className="btn btn-outline-app">Date range</button>
        <button className="btn btn-outline-app" onClick={() => toast('CSV export (simulated).')}>
          Export CSV
        </button>
      </PageHeader>

      <div className="toolbar mb-3">
        {TYPES.map((t) => (
          <button key={t} className={`btn btn-sm ${filter === t ? 'btn-primary-app' : 'btn-outline-app'}`} onClick={() => setFilter(t)}>
            {t}
          </button>
        ))}
        <button className="btn btn-sm btn-outline-app">More filters</button>
      </div>

      <div className="app-card overflow-hidden">
        <div className="card-head d-flex justify-content-between">
          <h5>All Movements</h5>
          <span className="small-note">Newest first</span>
        </div>
        <div className="table-responsive">
          <table className="table table-app">
            <thead>
              <tr>
                <th scope="col">Transaction</th>
                <th scope="col">Date</th>
                <th scope="col">Product</th>
                <th scope="col">Source</th>
                <th scope="col">Destination</th>
                <th scope="col" className="text-end">Qty</th>
                <th scope="col">Type</th>
                <th scope="col">Employee</th>
                <th scope="col">Reference</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-4">
                    No movements match this filter.
                  </td>
                </tr>
              ) : (
                paged.map((m) => (
                  <tr key={m.id}>
                    <td className="sku">{m.id}</td>
                    <td>{m.date}</td>
                    <td>{m.product}</td>
                    <td>{m.src}</td>
                    <td>{m.dst}</td>
                    <td className={`numeric ${m.qty < 0 ? 'text-danger' : 'text-success'}`}>
                      {m.qty > 0 ? '+' : '−'}
                      {Math.abs(m.qty)}
                    </td>
                    <td>{m.type}</td>
                    <td>{m.who}</td>
                    <td>{m.ref}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="table-toolbar">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>
    </>
  );
}
