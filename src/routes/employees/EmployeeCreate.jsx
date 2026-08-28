import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * EmployeeCreate — replaces employees/create.html (PPT slide 44).
 * Personal / Role & Placement / Account sections + Photo upload + Role
 * Preview side cards. Audit fix: removed fake defaultValues across the
 * entire form, added missing id/name/htmlFor matches on every
 * label/input/select, replaced the inline "required" red-text pattern
 * with a proper <span class="required"> indicator.
 */
export default function EmployeeCreate() {
  const toast = useToast();

  const onSave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.classList.add('was-validated');
      return;
    }
    toast('Employee added. Sign-in invitation sent.');
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Employees', to: '/employees' },
          { label: 'Add employee' },
        ]}
      />
      <PageHeader
        title="Add Employee"
        subtitle="A sign-in invitation is emailed once the account is created."
      >
        <Link to="/employees" className="btn btn-outline-app">Cancel</Link>
        <button form="employeeForm" className="btn btn-primary-app" type="submit">Create Employee</button>
      </PageHeader>

      <form id="employeeForm" className="needs-validation" noValidate onSubmit={onSave}>
        <div className="two-column-layout">
          <div className="app-card">
            <div className="card-head"><h3 className="card-heading">Employee Details</h3></div>
            <div className="card-body-app">
              <div className="form-section border-top-0 pt-0">
                <div className="section-label">PERSONAL</div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label required" htmlFor="employeeNumber">Employee number</label>
                    <input id="employeeNumber" name="employeeNumber" className="form-control" placeholder="EMP-020" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required" htmlFor="employeeName">Full name</label>
                    <input id="employeeName" name="employeeName" className="form-control" placeholder="Fatu Kollie" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="gender">Gender</label>
                    <select id="gender" name="gender" className="form-select" defaultValue="">
                      <option value="" disabled>Select gender…</option>
                      <option>Female</option>
                      <option>Male</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="dateOfBirth">Date of birth</label>
                    <input id="dateOfBirth" name="dateOfBirth" type="date" className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required" htmlFor="employeePhone">Phone</label>
                    <input id="employeePhone" name="employeePhone" className="form-control" placeholder="+231 77 903 448" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required" htmlFor="employeeEmail">Email</label>
                    <input id="employeeEmail" name="employeeEmail" type="email" className="form-control" placeholder="fatu.kollie@lazypygmy.lr" />
                  </div>
                </div>
              </div>
              <div className="form-section">
                <div className="section-label">ROLE & PLACEMENT</div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label required" htmlFor="position">Position</label>
                    <input id="position" name="position" className="form-control" placeholder="Storekeeper" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required" htmlFor="department">Department</label>
                    <select id="department" name="department" className="form-select" defaultValue="">
                      <option value="" disabled>Select department…</option>
                      <option>Warehousing</option>
                      <option>Logistics</option>
                      <option>Sales</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required" htmlFor="assignedLocation">Assigned location</label>
                    <select id="assignedLocation" name="assignedLocation" className="form-select" defaultValue="">
                      <option value="" disabled>Select location…</option>
                      <option>WH-02 Paynesville</option>
                      <option>WH-01 Central</option>
                      <option>Head Office</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required" htmlFor="systemRole">System role</label>
                    <select id="systemRole" name="systemRole" className="form-select" defaultValue="">
                      <option value="" disabled>Select role…</option>
                      <option>Storekeeper</option>
                      <option>Delivery Officer</option>
                      <option>Sales Officer</option>
                      <option>Warehouse Manager</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-section">
                <div className="section-label">ACCOUNT</div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label required" htmlFor="employmentDate">Employment date</label>
                    <input id="employmentDate" name="employmentDate" type="date" className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="accountStatus">Account status</label>
                    <select id="accountStatus" name="accountStatus" className="form-select" defaultValue="">
                      <option value="" disabled>Select status…</option>
                      <option>Pending activation</option>
                      <option>Active</option>
                      <option>Suspended</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required" htmlFor="username">Username</label>
                    <input id="username" name="username" className="form-control" placeholder="fatu.kollie" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="temporaryPassword">Temporary password</label>
                    <input id="temporaryPassword" name="temporaryPassword" className="form-control" placeholder="Auto-generated" disabled title="A temporary password is auto-generated and emailed to the employee on submit" />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <strong>Send sign-in invitation by email</strong>
                    <div className="helper-text">The employee sets their own password on first sign-in.</div>
                  </div>
                  <div className="form-check form-switch">
                    <input id="sendInvitation" name="sendInvitation" className="form-check-input" type="checkbox" aria-label="Send sign-in invitation" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="right-stack">
            <div className="app-card">
              <div className="card-head"><h3 className="card-heading">Photo</h3></div>
              <div className="card-body-app">
                <div className="upload-zone">
                  <div className="profile-avatar xl">FK</div>
                  <div>
                    <strong>Drag a photo or browse</strong>
                    <div className="helper-text">Square JPG or PNG, min 400 × 400 px</div>
                  </div>
                  <button type="button" className="btn btn-outline-app">Browse files</button>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <span className="helper-text">No file selected</span>
                </div>
                <div className="helper-text mt-2">Initials are used until a photo is uploaded.</div>
              </div>
            </div>
            <div className="app-card">
              <div className="card-head"><h3 className="card-heading">Role Preview</h3></div>
              <div className="card-body-app">
                <div className="d-flex justify-content-between">
                  <div>
                    <strong>Storekeeper</strong>
                    <div className="helper-text">Picking, packing and stock counts</div>
                  </div>
                  <span className="badge-status badge-info">3 of 15</span>
                </div>
                <hr />
                <div className="helper-text">Change the role above to see its permissions.</div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
