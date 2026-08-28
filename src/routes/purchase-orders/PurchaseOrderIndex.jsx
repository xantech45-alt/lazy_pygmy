import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Pagination from '../../components/Pagination.jsx';
import useIndexTable from '../../hooks/useIndexTable.js';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { money, number } from '../../lib/format.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * PurchaseOrderIndex — replaces purchase-orders/index.html (PPT slide 30).
 * Audit fix #27: added search + supplier filter + bulk-select on top of the
 * existing status pills (pills are the established UX for this page).
 */
const STATUS_CHIPS = ['All', 'Draft', 'Pending Approval', 'Approved', 'Partially Received', 'Received', 'Cancelled'];

export default function PurchaseOrderIndex() {
  const all = localStorageStore.getPurchaseOrders();
  const toast = useToast();

  const filterKeys = [
    { key: 'supplier', options: (rows) => [...new Set(rows.map((p) => p.supplier))] },
  ];

  const t = useIndexTable({
    rows: all,
    idKey: 'po',
    searchKeys: ['po', 'supplier'],
    filterKeys,
    initialSort: { key: 'raised', asc: false },
  });

  // Map the status filter to "All" sentinel expected by the chip set
  const status = t.filter.values.status || 'All';
  const setStatus = (s) => t.filter.set('status', s === 'All' ? '' : s);

  const visible = status === 'All' ? t.rows : t.rows.filter((p) => p.status === status);

  // Re-paginate after applying the status filter chip on top
  const { page, pageSize, setPage, setPageSize } = t;

  // Quick KPI reads
  const committed = all.reduce((a, b) => a + (b.value || 0), 0);
  const inTransit = all.filter((p) => p.status === 'Partially Received').reduce((a, b) => a + (b.units - (b.received || 0)), 0);
  const onExport = () => toast(`Export queued (purchase-orders.csv, ${visible.length} rows).`);

  // Slice the visible set for display (useIndexTable gives a single filter
  // pipeline; chip filtering rides on top so we keep its pagination
  // indices aligned by re-slicing manually).
  const start = page * pageSize;
  const paged = visible.slice(start, start + pageSize);
  const total = visible.length;

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Purchase Orders' }]} />
      <PageHeader
        title="Purchase Orders"
        subtitle={`${all.length} purchase orders · ${all.filter((p) => p.status === 'Pending Approval').length} awaiting approval · ${money(committed)} committed to suppliers · ${number(inTransit)} units in transit`}
      >
        <button className="btn btn-outline-app" onClick={onExport}>Export</button>
        <Link to="/purchase-orders/new" className="btn btn-primary-app">+ New Purchase Order</Link>
      </PageHeader>

      <div className={`bulk-bar mb-3 ${t.selected.size === 0 ? 'd-none' : ''}`}>
        <strong>{t.selected.size}</strong> selected ·{' '}
        <button className="btn btn-sm btn-link" onClick={t.clearSelection}>Clear</button>
      </div>

      <div className="filter-bar mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-lg-4">
            <input
              id="poSearch"
              name="poSearch"
              className="form-control"
              placeholder="Search by PO # or supplier"
              value={t.search.q}
              onChange={(e) => t.search.onChange(e.target.value)}
              aria-label="Search purchase orders"
            />
          </div>
          <div className="col-lg-3">
            <select
              id="poSupplier"
              name="poSupplier"
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
          <div className="col-lg-5 d-flex flex-wrap gap-2">
            {STATUS_CHIPS.map((s) => (
              <button
                key={s}
                type="button"
                className={`btn btn-sm ${status === s ? 'btn-primary-app' : 'btn-outline-app'}`}
                onClick={() => { setStatus(s); setPage(0); }}
                aria-pressed={status === s}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="app-card overflow-hidden">
        <div className="card-head d-flex justify-content-between">
          <h5>All Purchase Orders</h5>
          <span className="small-note">Newest first</span>
        </div>
        <div className="table-responsive">
          <table className="table table-app">
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={paged.length > 0 && t.selected.size === paged.length}
                    onChange={t.toggleAll}
                    aria-label="Select all POs on this page"
                  />
                </th>
                <th scope="col">PO Number</th>
                <th scope="col">Supplier</th>
                <th scope="col">Raised</th>
                <th scope="col">Expected</th>
                <th scope="col" className="text-end">Items</th>
                <th scope="col" className="text-end">Units</th>
                <th scope="col" className="text-end">Value</th>
                <th scope="col" className="text-end">Received</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p) => (
                <tr key={p.po}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={t.selected.has(p.po)}
                      onChange={() => t.toggleOne(p.po)}
                      aria-label={`Select ${p.po}`}
                    />
                  </td>
                  <td className="sku">
                    <Link to={`/purchase-orders/${p.po}`}>{p.po}</Link>
                  </td>
                  <td>{p.supplier}</td>
                  <td>{p.raised}</td>
                  <td>{p.expected}</td>
                  <td className="numeric">{p.items}</td>
                  <td className="numeric">{number(p.units)}</td>
                  <td className="numeric">{money(p.value)}</td>
                  <td className="numeric">{number(p.received)}</td>
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
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>
    </>
  );
}
