import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { money, number } from '../../lib/format.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { brand } from '../../lib/brand.js';

/**
 * WarehouseDetail — replaces warehouses/detail.html (PPT slide 21).
 * Master-prompt §1.7: includes a destructive Delete action with a confirm
 * gate. The action is gated to non-active warehouses only — an Active
 * warehouse with stock cannot be deleted without first transferring stock
 * out, so the button is disabled when status === 'Active' (matches the
 * real-world PO lifecycle pattern).
 */
const SAMPLE_MOVEMENTS = [
  { date: '7 Jan', product: 'ABC Beginner Book', qty: -316, type: 'Sale', party: 'Nimba Community', ref: 'ORD-0086' },
  { date: '5 Jan', product: 'ABC Beginner Book', qty: 400, type: 'Purchase', party: 'Kakata Paper Mills', ref: 'PO-0117' },
  { date: '4 Jan', product: 'Animal Puzzle', qty: -12, type: 'Damaged', party: 'Write-off', ref: 'ADJ-0019' },
];

export default function WarehouseDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const warehouse = localStorageStore.getWarehouses().find((w) => w.code === code);

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

  const pct = Math.round((warehouse.units / warehouse.capacity) * 100);
  const available = warehouse.capacity - warehouse.units;
  const canDelete = warehouse.status !== 'Active' || warehouse.units === 0;

  const onDelete = () => {
    localStorageStore.saveWarehouses(localStorageStore.getWarehouses().filter((w) => w.code !== code));
    toast(`${warehouse.code} deleted from local store.`);
    navigate('/warehouses');
  };

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Warehouses', to: '/warehouses' }, { label: warehouse.code }]} />
      <PageHeader
        title={
          <>
            {warehouse.name} <span className="badge-status badge-instock ms-2">{warehouse.status}</span>
          </>
        }
        subtitle={`${warehouse.code} · ${warehouse.location} · opened 4 Feb 2019`}
      >
        <button
          className="btn btn-danger-app"
          disabled={!canDelete}
          title={canDelete ? 'Delete this warehouse' : 'Active warehouse with stock cannot be deleted'}
          onClick={() => setConfirming(true)}
        >
          Delete
        </button>
        <button className="btn btn-outline-app">Edit</button>
        <Link to="/warehouses/transfers/new" className="btn btn-primary-app">
          + New Transfer
        </Link>
      </PageHeader>

      <ul className="nav tabs-app mb-3">
        <li><span className="nav-link active">Overview</span></li>
        <li><Link className="nav-link" to={`/warehouses/${warehouse.code}/inventory`}>Inventory</Link></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Movements</span></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Transfers</span></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Performance</span></li>
      </ul>

      <div className="row g-3">
        <div className="col-xl-8">
          <div className="app-card mb-3">
            <div className="card-head">
              <h5>Capacity Utilisation</h5>
            </div>
            <div className="card-body-app">
              <div className="d-flex justify-content-between align-items-end">
                <div>
                  <div className="kpi-value">{pct}%</div>
                  <div className="small-note">{number(warehouse.units)} of {number(warehouse.capacity)} units</div>
                </div>
                <div className="small-note">Target band 60 – 80% · within range</div>
              </div>
              <div className="progress my-3" style={{ height: 10 }}>
                <div className="progress-bar" style={{ width: `${pct}%`, background: brand.secondary }}></div>
              </div>
              <div className="row g-2">
                <Tile label="Available" value={number(available)} />
                <Tile label="Reserved" value="640" />
                <Tile label="Incoming" value="400" />
              </div>
            </div>
          </div>

          <div className="app-card">
            <div className="card-head d-flex justify-content-between">
              <h5>Recent Movements</h5>
              <button type="button" className="btn btn-link p-0">View all</button>
            </div>
            <div className="table-responsive">
              <table className="table table-app">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Product</th>
                    <th scope="col" className="text-end">Qty</th>
                    <th scope="col">Type</th>
                    <th scope="col">Counterparty</th>
                    <th scope="col">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_MOVEMENTS.map((m, i) => (
                    <tr key={i}>
                      <td>{m.date}</td>
                      <td>{m.product}</td>
                      <td className={`numeric ${m.qty < 0 ? 'text-danger' : 'text-success'}`}>
                        {m.qty > 0 ? '+' : '−'}
                        {Math.abs(m.qty)}
                      </td>
                      <td>{m.type}</td>
                      <td>{m.party}</td>
                      <td>{m.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="app-card mb-3">
            <div className="card-head">
              <h5>Manager & Contact</h5>
            </div>
            <div className="card-body-app">
              <div className="d-flex gap-3">
                <div className="avatar">{warehouse.manager.split(' ').map((n) => n[0]).join('')}</div>
                <div>
                  <strong>{warehouse.manager}</strong>
                  <div className="small-note">Warehouse Manager · EMP-006</div>
                </div>
              </div>
              <hr />
              <div>Phone +231 77 118 204</div>
              <div>Email sarah.weah@lazypygmy.lr</div>
              <div className="small-note mt-2">Storekeepers 3 assigned · on duty today 06:00 – 18:00</div>
            </div>
          </div>
          <div className="app-card">
            <div className="card-head">
              <h5>Stock Value</h5>
            </div>
            <div className="card-body-app">
              <div className="kpi-value">{money(warehouse.value)}</div>
              <div className="small-note">47% of the $42,850 network total</div>
              <hr />
              <strong>Categories Stored</strong>
              <div className="d-flex gap-2 flex-wrap mt-2">
                {['Books', 'Puzzles', 'Copybooks'].map((c) => (
                  <span key={c} className="badge-status badge-info">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={onDelete}
        title="Delete this warehouse?"
        subtitle={`${warehouse.code} · ${warehouse.name}`}
        consequences={[
          `${number(warehouse.units)} units held here will be removed from inventory totals.`,
          `${money(warehouse.value)} of stock value will be written off.`,
          'Set the status to Inactive instead to keep history.',
        ]}
        acknowledge="I understand this warehouse and its stock history will be removed."
        confirmLabel="Delete warehouse"
      />
    </>
  );
}

function Tile({ label, value }) {
  return (
    <div className="col-4">
      <div className="metric-tile">
        <div className="small-note">{label}</div>
        <div className="fs-4 fw-bold">{value}</div>
      </div>
    </div>
  );
}
