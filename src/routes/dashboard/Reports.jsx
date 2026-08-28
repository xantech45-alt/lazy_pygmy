import { useMemo, useState } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import AppCard from '../../components/AppCard.jsx';
import { money, exportCsv } from '../../lib/format.js';
import { printPage } from '../../lib/print.js';
import {
  inventoryValuation,
  stockHealth,
  ordersSummary,
  purchasingReceiving,
  supplierPerformance,
  schoolActivity,
  ALL_REPORTS,
} from '../../data-access/reportSelectors.js';
import { statusClass } from '../../lib/status.js';

/**
 * Reports — data-backed report center.
 *
 * Six reports, all derived from localStorageStore via the pure selectors:
 *   1. Inventory Valuation
 *   2. Stock Health
 *   3. Orders Summary
 *   4. Purchasing / Receiving
 *   5. Supplier Performance
 *   6. School Activity
 *
 * Each report supports search, optional category/status filters, CSV export
 * and an A4 print button. The page is one composable screen, not six routes.
 */
export default function Reports() {
  const [activeId, setActiveId] = useState(ALL_REPORTS[0].id);
  const active = ALL_REPORTS.find((r) => r.id === activeId) || ALL_REPORTS[0];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Reports' }]} />
      <PageHeader title="Reports" subtitle="Lazy Pygmy Inventory Suite">
        <button
          className="btn btn-outline-app no-print"
          onClick={() => printPage({ title: `${active.label} — Lazy Pygmy` })}
        >
          <i className="bi bi-printer me-1"></i>Print
        </button>
      </PageHeader>

      <div className="row g-3">
        <div className="col-xl-3 no-print">
          <AppCard>
            <div className="card-head">
              <h5>Reports</h5>
              <div className="small-note">{ALL_REPORTS.length} available</div>
            </div>
            <div className="list-group list-group-flush">
              {ALL_REPORTS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                    r.id === activeId ? 'active' : ''
                  }`}
                  onClick={() => setActiveId(r.id)}
                  aria-current={r.id === activeId ? 'true' : 'false'}
                >
                  <span>{r.label}</span>
                  <i className="bi bi-chevron-right small"></i>
                </button>
              ))}
            </div>
          </AppCard>
        </div>

        <div className="col-xl-9">
          {activeId === 'inventory-valuation' && <InventoryValuationReport />}
          {activeId === 'stock-health' && <StockHealthReport />}
          {activeId === 'orders-summary' && <OrdersSummaryReport />}
          {activeId === 'purchasing-receiving' && <PurchasingReceivingReport />}
          {activeId === 'supplier-performance' && <SupplierPerformanceReport />}
          {activeId === 'school-activity' && <SchoolActivityReport />}
        </div>
      </div>
    </>
  );
}

function ReportToolbar({ search, onSearch, onReset, onCsv, csvName, children }) {
  return (
    <div className="d-flex flex-wrap gap-2 align-items-center no-print mb-3">
      <div className="position-relative flex-grow-1" style={{ minWidth: 220 }}>
        <i
          className="bi bi-search position-absolute"
          style={{ left: 10, top: 9, color: 'var(--color-text-faint)' }}
        ></i>
        <input
          type="search"
          className="form-control ps-5"
          placeholder="Search…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search this report"
        />
      </div>
      {children}
      <button type="button" className="btn btn-outline-app" onClick={onReset}>
        Reset
      </button>
      <button type="button" className="btn btn-outline-app" onClick={onCsv} disabled={!csvName}>
        <i className="bi bi-filetype-csv me-1"></i>Export CSV
      </button>
    </div>
  );
}

function ReportSummary({ items }) {
  return (
    <div className="row g-3 mb-3">
      {items.map((it) => (
        <div key={it.label} className="col-md-3 col-sm-6">
          <AppCard>
            <div className="small-note">{it.label}</div>
            <div className="fs-4 fw-bold font-numeric">{it.value}</div>
            {it.note && <div className="small text-muted-app">{it.note}</div>}
          </AppCard>
        </div>
      ))}
    </div>
  );
}

function filterRows(rows, term, predicate) {
  const t = term.trim().toLowerCase();
  if (!t) return rows;
  return rows.filter((r) => predicate(r, t));
}

function InventoryValuationReport() {
  const data = useMemo(() => inventoryValuation(), []);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(
    () => Array.from(new Set(data.rows.map((r) => r.category))).sort(),
    [data]
  );
  const filtered = useMemo(() => {
    const cat = category === 'all' ? null : category;
    return filterRows(data.rows, search, (r, t) => {
      if (cat && r.category !== cat) return false;
      return (
        r.sku.toLowerCase().includes(t) ||
        r.name.toLowerCase().includes(t) ||
        r.category.toLowerCase().includes(t)
      );
    });
  }, [data, search, category]);

  const filteredValue = filtered.reduce((acc, r) => acc + r.value, 0);

  return (
    <AppCard>
      <div className="card-head">
        <h5>Inventory Valuation</h5>
        <div className="small-note">By SKU, valued at unit cost</div>
      </div>
      <ReportSummary
        items={[
          { label: 'Total value', value: money(data.totalValue) },
          { label: 'Units on hand', value: data.totalUnits.toLocaleString() },
          { label: 'Low stock SKUs', value: data.lowStock },
          { label: 'Out of stock', value: data.outOfStock },
        ]}
      />
      <ReportToolbar
        search={search}
        onSearch={setSearch}
        onReset={() => {
          setSearch('');
          setCategory('all');
        }}
        onCsv={() =>
          exportCsv(
            `inventory-valuation-${new Date().toISOString().slice(0, 10)}.csv`,
            filtered
          )
        }
        csvName="inventory-valuation"
      >
        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </ReportToolbar>
      <div className="table-responsive">
        <table className="table table-app">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th className="text-end">On hand</th>
              <th className="text-end">Unit cost</th>
              <th className="text-end">Value</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.sku}>
                <td className="font-numeric">{r.sku}</td>
                <td>{r.name}</td>
                <td>{r.category}</td>
                <td className="text-end font-numeric">{r.onHand.toLocaleString()}</td>
                <td className="text-end font-numeric">{money(r.cost)}</td>
                <td className="text-end font-numeric">{money(r.value)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted-app py-4">
                  No rows match the current filters.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={3} className="text-end">Filtered total</th>
              <th className="text-end font-numeric">
                {filtered.reduce((acc, r) => acc + r.onHand, 0).toLocaleString()}
              </th>
              <th></th>
              <th className="text-end font-numeric">{money(filteredValue)}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </AppCard>
  );
}

function StockHealthReport() {
  const data = useMemo(() => stockHealth(), []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const statuses = Object.keys(data.byStatus);
  const filtered = useMemo(() => {
    return filterRows(data.rows, search, (r, t) => {
      if (status !== 'all' && r.status !== status) return false;
      return (
        r.sku.toLowerCase().includes(t) ||
        r.name.toLowerCase().includes(t) ||
        r.status.toLowerCase().includes(t)
      );
    });
  }, [data, search, status]);

  return (
    <AppCard>
      <div className="card-head">
        <h5>Stock Health</h5>
        <div className="small-note">In stock / Low stock / Out of stock</div>
      </div>
      <ReportSummary
        items={statuses.map((s) => ({
          label: s,
          value: data.byStatus[s] || 0,
        }))}
      />
      <ReportToolbar
        search={search}
        onSearch={setSearch}
        onReset={() => {
          setSearch('');
          setStatus('all');
        }}
        onCsv={() =>
          exportCsv(
            `stock-health-${new Date().toISOString().slice(0, 10)}.csv`,
            filtered
          )
        }
        csvName="stock-health"
      >
        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by stock status"
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </ReportToolbar>
      <div className="table-responsive">
        <table className="table table-app">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th className="text-end">On hand</th>
              <th className="text-end">Reorder</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.sku}>
                <td className="font-numeric">{r.sku}</td>
                <td>{r.name}</td>
                <td>{r.category}</td>
                <td className="text-end font-numeric">{r.onHand.toLocaleString()}</td>
                <td className="text-end font-numeric">{r.reorder.toLocaleString()}</td>
                <td>
                  <span className={`badge-status ${statusClass(r.status)}`}>{r.status}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted-app py-4">
                  No rows match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppCard>
  );
}

function OrdersSummaryReport() {
  const data = useMemo(() => ordersSummary(), []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const statuses = Object.keys(data.byStatus);
  const filtered = useMemo(() => {
    return filterRows(data.rows, search, (r, t) => {
      if (status !== 'all' && r.status !== status) return false;
      return (
        r.order.toLowerCase().includes(t) ||
        r.school.toLowerCase().includes(t) ||
        (r.county || '').toLowerCase().includes(t)
      );
    });
  }, [data, search, status]);

  return (
    <AppCard>
      <div className="card-head">
        <h5>Orders Summary</h5>
        <div className="small-note">All school orders, by status</div>
      </div>
      <ReportSummary
        items={[
          { label: 'Orders', value: data.count },
          { label: 'Revenue', value: money(data.total) },
          ...(statuses.slice(0, 2).map((s) => ({ label: s, value: data.byStatus[s] || 0 }))),
        ]}
      />
      <ReportToolbar
        search={search}
        onSearch={setSearch}
        onReset={() => {
          setSearch('');
          setStatus('all');
        }}
        onCsv={() =>
          exportCsv(
            `orders-summary-${new Date().toISOString().slice(0, 10)}.csv`,
            filtered
          )
        }
        csvName="orders-summary"
      >
        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by order status"
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </ReportToolbar>
      <div className="table-responsive">
        <table className="table table-app">
          <thead>
            <tr>
              <th>Order</th>
              <th>School</th>
              <th>County</th>
              <th className="text-end">Items</th>
              <th className="text-end">Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.order}>
                <td className="font-numeric">{r.order}</td>
                <td>{r.school}</td>
                <td>{r.county}</td>
                <td className="text-end font-numeric">{r.items.toLocaleString()}</td>
                <td className="text-end font-numeric">{money(r.total)}</td>
                <td>
                  <span className={`badge-status ${statusClass(r.status)}`}>{r.status}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted-app py-4">
                  No rows match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppCard>
  );
}

function PurchasingReceivingReport() {
  const data = useMemo(() => purchasingReceiving(), []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const allStatuses = Array.from(
    new Set([...data.poRows.map((r) => r.status), ...data.receiptRows.map((r) => 'Received')])
  );
  const filteredPOs = useMemo(
    () =>
      filterRows(data.poRows, search, (r, t) => {
        if (status !== 'all' && r.status !== status) return false;
        return r.po.toLowerCase().includes(t) || (r.supplier || '').toLowerCase().includes(t);
      }),
    [data, search, status]
  );
  const filteredReceipts = useMemo(
    () =>
      filterRows(data.receiptRows, search, (r, t) => {
        if (status !== 'all' && status !== 'Received') return false;
        return (
          r.id.toLowerCase().includes(t) ||
          (r.po || '').toLowerCase().includes(t) ||
          (r.supplier || '').toLowerCase().includes(t) ||
          (r.warehouse || '').toLowerCase().includes(t)
        );
      }),
    [data, search, status]
  );

  return (
    <AppCard>
      <div className="card-head">
        <h5>Purchasing / Receiving</h5>
        <div className="small-note">Open purchase orders and posted receipts</div>
      </div>
      <ReportSummary
        items={[
          { label: 'PO total', value: money(data.poTotal) },
          { label: 'Received', value: money(data.receivedTotal) },
          { label: 'POs', value: data.poRows.length },
          { label: 'Receipts', value: data.receiptRows.length },
        ]}
      />
      <ReportToolbar
        search={search}
        onSearch={setSearch}
        onReset={() => {
          setSearch('');
          setStatus('all');
        }}
        onCsv={() =>
          exportCsv(
            `purchasing-receiving-${new Date().toISOString().slice(0, 10)}.csv`,
            status === 'Received' ? filteredReceipts : filteredPOs
          )
        }
        csvName="purchasing-receiving"
      >
        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </ReportToolbar>
      <h6 className="mt-3">Purchase Orders</h6>
      <div className="table-responsive">
        <table className="table table-app">
          <thead>
            <tr>
              <th>PO</th>
              <th>Supplier</th>
              <th>Date</th>
              <th>Expected</th>
              <th className="text-end">Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPOs.map((r) => (
              <tr key={r.po}>
                <td className="font-numeric">{r.po}</td>
                <td>{r.supplier}</td>
                <td>{r.date}</td>
                <td>{r.expected}</td>
                <td className="text-end font-numeric">{money(r.total)}</td>
                <td>
                  <span className={`badge-status ${statusClass(r.status)}`}>{r.status}</span>
                </td>
              </tr>
            ))}
            {filteredPOs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted-app py-4">
                  No purchase orders match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <h6 className="mt-4">Posted Receipts</h6>
      <div className="table-responsive">
        <table className="table table-app">
          <thead>
            <tr>
              <th>Receipt</th>
              <th>PO</th>
              <th>Supplier</th>
              <th>Warehouse</th>
              <th>Date</th>
              <th className="text-end">Lines</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.map((r) => (
              <tr key={r.id}>
                <td className="font-numeric">{r.id}</td>
                <td className="font-numeric">{r.po}</td>
                <td>{r.supplier}</td>
                <td>{r.warehouse}</td>
                <td>{r.date}</td>
                <td className="text-end font-numeric">{r.lineCount}</td>
              </tr>
            ))}
            {filteredReceipts.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted-app py-4">
                  No receipts match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppCard>
  );
}

function SupplierPerformanceReport() {
  const data = useMemo(() => supplierPerformance(), []);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      filterRows(data, search, (r, t) =>
        (r.supplier || '').toLowerCase().includes(t)
      ),
    [data, search]
  );

  return (
    <AppCard>
      <div className="card-head">
        <h5>Supplier Performance</h5>
        <div className="small-note">PO volume and on-time rate by supplier</div>
      </div>
      <ReportToolbar
        search={search}
        onSearch={setSearch}
        onReset={() => setSearch('')}
        onCsv={() =>
          exportCsv(
            `supplier-performance-${new Date().toISOString().slice(0, 10)}.csv`,
            filtered
          )
        }
        csvName="supplier-performance"
      />
      <div className="table-responsive">
        <table className="table table-app">
          <thead>
            <tr>
              <th>Supplier</th>
              <th className="text-end">POs</th>
              <th className="text-end">Total spend</th>
              <th className="text-end">On-time</th>
              <th className="text-end">On-time rate</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.supplier}>
                <td>{r.supplier}</td>
                <td className="text-end font-numeric">{r.pos}</td>
                <td className="text-end font-numeric">{money(r.total)}</td>
                <td className="text-end font-numeric">{r.onTime}</td>
                <td className="text-end font-numeric">
                  {(r.onTimeRate * 100).toFixed(0)}%
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted-app py-4">
                  No suppliers match the current search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppCard>
  );
}

function SchoolActivityReport() {
  const data = useMemo(() => schoolActivity(), []);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      filterRows(data, search, (r, t) =>
        (r.school || '').toLowerCase().includes(t) ||
        (r.county || '').toLowerCase().includes(t)
      ),
    [data, search]
  );

  return (
    <AppCard>
      <div className="card-head">
        <h5>School Activity</h5>
        <div className="small-note">Order volume and revenue by school</div>
      </div>
      <ReportToolbar
        search={search}
        onSearch={setSearch}
        onReset={() => setSearch('')}
        onCsv={() =>
          exportCsv(
            `school-activity-${new Date().toISOString().slice(0, 10)}.csv`,
            filtered
          )
        }
        csvName="school-activity"
      />
      <div className="table-responsive">
        <table className="table table-app">
          <thead>
            <tr>
              <th>School</th>
              <th>County</th>
              <th className="text-end">Orders</th>
              <th className="text-end">Total spend</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.school}>
                <td>{r.school}</td>
                <td>{r.county}</td>
                <td className="text-end font-numeric">{r.orders}</td>
                <td className="text-end font-numeric">{money(r.total)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted-app py-4">
                  No schools match the current search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppCard>
  );
}
