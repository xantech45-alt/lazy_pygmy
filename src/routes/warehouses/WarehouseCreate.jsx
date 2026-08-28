import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { useWarehouses } from '../../data-access/useEntity.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * WarehouseCreate — replaces warehouses/create.html (PPT slide 20).
 * Multi-section form (Identity / Location / Management / Capacity & Scope) with
 * left side warehouse details + right side (Location card, Network Impact).
 * Audit fix: removed fake defaultValues on inputs/selects and added the
 * missing id/name/htmlFor matches on every label.
 */
export default function WarehouseCreate() {
  const { add } = useWarehouses();
  const toast = useToast();

  const onSave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.classList.add('was-validated');
      return;
    }
    const form = e.currentTarget;
    add({
      code: form.warehouseCode.value || `WH-0${Math.floor(Math.random() * 9) + 1}`,
      name: form.warehouseName.value,
      location: `${form.warehouseCity.value}, ${form.warehouseCounty.value}`,
      manager: 'Assign later',
      units: 0,
      capacity: Number(form.warehouseCapacity.value),
      value: 0,
      status: 'Inactive',
    });
    toast('Warehouse saved.');
    form.reset();
  };

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Warehouses', to: '/warehouses' }, { label: 'Add warehouse' }]} />
      <PageHeader
        title="Add Warehouse"
        subtitle="New locations are inactive until a manager is assigned and capacity is confirmed."
      >
        <Link to="/warehouses" className="btn btn-outline-app">
          Cancel
        </Link>
        <button form="warehouseForm" className="btn btn-primary-app" type="submit">
          Save Warehouse
        </button>
      </PageHeader>

      <form id="warehouseForm" noValidate onSubmit={onSave}>
        <div className="content-grid">
          <div className="app-card">
            <div className="card-head">
              <h5>Warehouse Details</h5>
            </div>
            <div className="card-body-app">
              <div className="section-kicker">Identity</div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="warehouseCode">Warehouse code</label>
                  <input id="warehouseCode" name="warehouseCode" className="form-control" placeholder="WH-04" />
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="warehouseName">Warehouse name</label>
                  <input id="warehouseName" name="warehouseName" className="form-control" placeholder="Kakata Satellite Store" />
                </div>
              </div>
              <div className="section-kicker">Location</div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="warehouseCity">City / town</label>
                  <input id="warehouseCity" name="warehouseCity" className="form-control" placeholder="Kakata" />
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="warehouseCounty">County</label>
                  <input id="warehouseCounty" name="warehouseCounty" className="form-control" placeholder="Margibi" />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="streetAddress">Street address</label>
                  <input id="streetAddress" name="streetAddress" className="form-control" placeholder="Plot 14, Monrovia–Kakata Highway, opposite Booker Washington Institute" />
                </div>
              </div>
              <div className="section-kicker">Management</div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="warehouseManager">Warehouse manager</label>
                  <select id="warehouseManager" name="warehouseManager" className="form-select" defaultValue="">
                    <option value="" disabled>Assign later</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="contactPhone">Contact phone</label>
                  <input id="contactPhone" name="contactPhone" className="form-control" placeholder="+231 77 402 118" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="contactEmail">Contact email</label>
                  <input id="contactEmail" name="contactEmail" type="email" className="form-control" placeholder="kakata@lazypygmy.lr" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="openingDate">Opening date</label>
                  <input id="openingDate" name="openingDate" type="date" className="form-control" />
                </div>
              </div>
              <div className="section-kicker">Capacity & Scope</div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="warehouseCapacity">Storage capacity</label>
                  <input id="warehouseCapacity" name="warehouseCapacity" type="number" className="form-control" placeholder="6000" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="warehouseStatus">Status</label>
                  <select id="warehouseStatus" name="warehouseStatus" className="form-select" defaultValue="">
                    <option value="" disabled>Select status…</option>
                    <option>Inactive</option>
                    <option>Operational</option>
                  </select>
                </div>
                <div className="col-12">
                  <fieldset>
                    <legend className="form-label">Categories stored</legend>
                    <div className="d-flex flex-wrap gap-2">
                      {['Books', 'Puzzles', 'Copybooks'].map((c) => (
                        <span key={c} className="badge-status badge-info">{c}</span>
                      ))}
                      {['Alphabet Cards', 'Game Cards'].map((c) => (
                        <span key={c} className="badge-status badge-draft">{c}</span>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="app-card mb-3">
              <div className="card-head">
                <h5>Location</h5>
              </div>
              <div className="card-body-app">
                <div className="upload-zone">
                  <div>
                    <i className="bi bi-geo-alt fs-1"></i>
                    <div className="fw-bold">Kakata, Margibi County</div>
                    <div className="small-note">6.5203° N, 10.3536° W · 48 km from WH-01</div>
                  </div>
                </div>
                <div className="toolbar mt-3">
                  <button type="button" className="btn btn-outline-app">Drop pin</button>
                  <button type="button" className="btn btn-outline-app">Verify address</button>
                </div>
              </div>
            </div>
            <div className="app-card">
              <div className="card-head">
                <h5>Network Impact</h5>
              </div>
              <div className="card-body-app">
                <div className="d-flex justify-content-between">
                  <span>Total capacity after saving</span>
                  <strong>32,000</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Network utilisation</span>
                  <strong>58%</strong>
                </div>
                <div className="small-note mt-3">
                  Adding 6,000 units of capacity brings the network from 71% to 58%.
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
