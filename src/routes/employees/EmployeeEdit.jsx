import { Link, useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import ImageImportField from '../../components/ImageImportField.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * EmployeeEdit — replaces employees/edit.html (PPT slide 46).
 * Pre-fills from store; tracks modified state on field change; shows
 * unsaved-banner when count > 0; Permission Impact side card.
 */
export default function EmployeeEdit() {
  const { number } = useParams();
  const employee = localStorageStore.getEmployees().find((e) => e.number === number);
  const [position, setPosition] = useState(employee?.role || '');
  const [status, setStatus] = useState(employee?.status === 'Active' ? 'Active' : 'Suspended');
  const [role, setRole] = useState(employee?.role || '');
  const [photoAssetId, setPhotoAssetId] = useState(employee?.photoAssetId || null);
  const toast = useToast();

  const modified = useMemo(() => {
    if (!employee) return 0;
    let count = 0;
    if (position !== employee.role) count++;
    if (role !== employee.role) count++;
    if (status !== employee.status) count++;
    if ((photoAssetId || null) !== (employee.photoAssetId || null)) count++;
    return count;
  }, [employee, position, role, status, photoAssetId]);

  const onSave = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!employee) return;
    if (!position.trim() || !role.trim()) {
      toast('Position and system role are required.');
      return;
    }
    const updated = {
      ...employee,
      role,
      position,
      status,
      photoAssetId: photoAssetId || null,
    };
    const all = localStorageStore.getEmployees().map((emp) =>
      emp.number === employee.number ? updated : emp
    );
    localStorageStore.saveEmployees(all);
    toast(`Employee ${employee.number} saved.`);
  };

  if (!employee) {
    return (
      <>
        <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Employees', to: '/employees' }, { label: 'Not found' }]} />
        <PageHeader title="Employee not found" subtitle={number}>
          <Link to="/employees" className="btn btn-outline-app">Back</Link>
        </PageHeader>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Employees', to: '/employees' },
          { label: employee.number, to: `/employees/${employee.number}` },
          { label: 'Edit' },
        ]}
      />
      <PageHeader
        title={
          <>
            Edit Employee <StatusBadge status={employee.status} />
          </>
        }
        subtitle={`${employee.number} · ${employee.name} · last saved 12 Dec 2025, 16:20 by Grace Kollie`}
      >
        <Link to="/employees" className="btn btn-outline-app">Cancel</Link>
        <button
          type="submit"
          form="editEmployeeForm"
          className="btn btn-primary-app"
          disabled={modified === 0}
        >
          Save Changes
        </button>
      </PageHeader>

      {modified > 0 && (
        <div className="unsaved-banner d-flex align-items-center justify-content-between mb-3">
          <strong>! &nbsp; Unsaved changes — {modified} fields modified</strong>
          <span>Role and status changes take effect at next sign-in</span>
          <div>
            <button className="btn btn-sm btn-link text-danger" onClick={() => { setPosition(employee.role); setRole(employee.role); setStatus(employee.status); setPhotoAssetId(employee.photoAssetId || null); }}>Discard</button>
            <button
              type="button"
              className="btn btn-sm"
              style={{ background: 'var(--color-warning)', color: '#fff' }}
              disabled
              aria-disabled="true"
              title="Diff review is not available in this prototype"
            >
              Review diff
            </button>
          </div>
        </div>
      )}

      <form id="editEmployeeForm" onSubmit={onSave} noValidate>
        <div className="two-column-layout">
          <div className="app-card">
            <div className="card-head"><h3 className="card-heading">Employee Details</h3></div>
            <div className="card-body-app">
              <div className="form-section border-top-0 pt-0">
                <div className="section-label">PERSONAL</div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="empNumber">Employee number</label>
                    <input id="empNumber" name="empNumber" className="form-control" defaultValue={employee.number} disabled title="Employee number is the permanent identifier and cannot be changed" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="empName">Full name</label>
                    <input id="empName" name="empName" className="form-control" defaultValue={employee.name} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="empGender">Gender</label>
                    <select id="empGender" name="empGender" className="form-select"><option>Male</option><option>Female</option></select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="empDob">Date of birth</label>
                    <input id="empDob" name="empDob" type="date" className="form-control" defaultValue="1994-05-03" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="empPhone">Phone</label>
                    <input id="empPhone" name="empPhone" className="form-control" defaultValue={employee.phone} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="empEmail">Email</label>
                    <input id="empEmail" name="empEmail" type="email" className="form-control" defaultValue={`${employee.name.split(' ')[0].toLowerCase()}.${employee.name.split(' ')[1].toLowerCase()}@lazypygmy.lr`} />
                  </div>
                </div>
              </div>
              <div className="form-section">
                <div className="section-label">ROLE & PLACEMENT</div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="empPosition">
                      Position {position !== employee.role && <span className="modified-note">● modified</span>}
                    </label>
                    <input id="empPosition" name="empPosition" className={`form-control ${position !== employee.role ? 'modified-field' : ''}`} value={position} onChange={(e) => setPosition(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="empDept">Department</label>
                    <select id="empDept" name="empDept" className="form-select" defaultValue={employee.department}>
                      <option>{employee.department}</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="empLocation">Assigned location</label>
                    <select id="empLocation" name="empLocation" className="form-select" defaultValue={employee.location}>
                      <option>{employee.location}</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="empSystemRole">
                      System role {role !== employee.role && <span className="modified-note">● modified</span>}
                    </label>
                    <select id="empSystemRole" name="empSystemRole" className={`form-select ${role !== employee.role ? 'modified-field' : ''}`} value={role} onChange={(e) => setRole(e.target.value)}>
                      <option>Storekeeper</option>
                      <option>Delivery Officer</option>
                      <option>Sales Officer</option>
                      <option>Warehouse Manager</option>
                      <option>Inventory Manager</option>
                    </select>
                    {role !== employee.role && <div className="helper-text">Previously {employee.role}</div>}
                  </div>
                </div>
              </div>
              <div className="form-section">
                <div className="section-label">ACCOUNT</div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="empEmployed">Employment date</label>
                    <input id="empEmployed" name="empEmployed" type="date" className="form-control" defaultValue="2024-02-05" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="empStatus">
                      Account status {status !== employee.status && <span className="modified-note">● modified</span>}
                    </label>
                    <select id="empStatus" name="empStatus" className={`form-select ${status !== employee.status ? 'modified-field' : ''}`} value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option>Active</option>
                      <option>Suspended</option>
                    </select>
                    {status !== employee.status && <div className="helper-text">Previously {employee.status}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="empUsername">Username</label>
                    <input id="empUsername" name="empUsername" className="form-control" defaultValue={`${employee.name.split(' ')[0].toLowerCase()}.${employee.name.split(' ')[1].toLowerCase()}`} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="empLastSignIn">Last sign-in</label>
                    <input id="empLastSignIn" name="empLastSignIn" className="form-control" defaultValue="11 Dec 2025" disabled title="Last sign-in is read-only; it is updated automatically on each sign-in" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="right-stack">
            <div className="app-card">
              <div className="card-head"><h3 className="card-heading">Photo</h3></div>
              <div className="card-body-app">
                {/* Avatar, caption ("No photo uploaded" / "Photo set
                 * (preview in browser)"), and the ImageImportField all
                 * sit flush-left so the photo card matches the rest of
                 * the form's left rhythm. The avatar was previously
                 * centred under a `text-center` card body, which made
                 * the caption look stranded when paired with the rest
                 * of the left-aligned form labels. */}
                <span className="profile-avatar xl amber">
                  {employee.name.split(' ').map((n) => n[0]).join('')}
                </span>
                <h6 className="mt-3">{photoAssetId ? 'Photo set (preview in browser)' : 'No photo uploaded'}</h6>
                <ImageImportField
                  kind="profile"
                  currentAssetId={photoAssetId}
                  onCommit={(id) => setPhotoAssetId(id)}
                  onRemove={() => setPhotoAssetId(null)}
                  label="Employee photo"
                  helpText="PNG, JPEG, or WebP · up to 2 MB · stored in this browser."
                  shape="square"
                  ownerId={`employee:${employee.number}`}
                />
              </div>
            </div>
            <div className="app-card">
              <div className="card-head"><h3 className="card-heading">Permission Impact</h3></div>
              <div className="card-body-app">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>{employee.role}</span>
                  <i className="bi bi-caret-right-fill" />
                  <strong>{role}</strong>
                </div>
                <div className="text-success small fw-bold">GAINS</div>
                <div className="permission yes">+ Manage schools</div>
                <div className="text-danger small fw-bold mt-2">LOSES</div>
                <div className="permission">− Adjust inventory</div>
                <div className="warning-callout mt-3">
                  {employee.name.split(' ')[0]} keeps 3 of 15 permissions. Open stock counts assigned to them must be reassigned.
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}