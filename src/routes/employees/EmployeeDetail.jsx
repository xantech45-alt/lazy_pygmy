import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * EmployeeDetail — replaces employees/detail.html (PPT slide 45).
 *
 * Master-prompt §1.7: existing "Suspend" verb is preserved as the
 * status-change action; an explicit "Delete employee record" is added
 * alongside it, gated by the Roles matrix's `locked: true` Administrator
 * protection (only Administrators can delete; the only Administrator
 * account is itself un-deletable).
 */
const ACTIVITY = [
  { tag: 'success', text: 'Packed order ORD-2026-0085', sub: '3 lines · 180 units ready for dispatch', when: '7 Jan, 11:05' },
  { tag: 'warning', text: 'Completed cycle count CC-2026-003', sub: '1 variance found — 12 units of Animal Puzzle', when: '7 Jan, 09:52' },
  { tag: '', text: 'Picked order ORD-2026-0085', sub: 'Bins A-01-03, C-04-02, E-03-04', when: '7 Jan, 09:40' },
  { tag: 'teal', text: 'Raised transfer TRF-2026-0042', sub: '620 units from WH-01 to WH-02', when: '3 Jan, 08:12' },
  { tag: 'teal', text: 'Received return RTN-2026-0011', sub: '24 units back into sellable stock', when: '30 Dec, 15:20' },
];

export default function EmployeeDetail() {
  const { number } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const employee = localStorageStore.getEmployees().find((e) => e.number === number);

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

  const initials = employee.name.split(' ').map((n) => n[0]).join('');
  const isAdmin = employee.role === 'Administrator';
  const canDelete = !isAdmin; // matches Roles matrix `locked: true` protection

  const onDelete = () => {
    localStorageStore.saveEmployees(localStorageStore.getEmployees().filter((e) => e.number !== number));
    toast(`${employee.name} removed from the directory.`);
    navigate('/employees');
  };

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Employees', to: '/employees' }, { label: employee.number }]} />
      <PageHeader
        title={
          <>
            {employee.name}
            <span className="badge-status badge-info ms-2">{employee.number}</span>
            <StatusBadge status={employee.status} />
          </>
        }
        subtitle={`${employee.role} · ${employee.department} · ${employee.location} · joined ${employee.employed}`}
      >
        <button
          className="btn btn-danger-app"
          disabled={!canDelete}
          title={canDelete ? 'Permanently delete this employee record' : 'Administrator accounts cannot be deleted'}
          onClick={() => setConfirming(true)}
        >
          Delete
        </button>
        <button className="btn btn-outline-app" onClick={() => toast(`${employee.name} suspended.`)}>Suspend</button>
        <button className="btn btn-outline-app" onClick={() => toast('Demo: a reset link would be emailed to this employee.')}>Reset Password</button>
        <Link to={`/employees/${employee.number}/edit`} className="btn btn-primary-app">Edit Employee</Link>
      </PageHeader>

      <ul className="nav tabs-app mb-3">
        <li><span className="nav-link active">Overview</span></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Activity</span></li>
        <li><Link className="nav-link" to="/employees/roles">Permissions</Link></li>
        <li><span className="nav-link" aria-disabled="true" title="Coming soon">Documents</span></li>
      </ul>

      <div className="two-column-layout">
        <div className="d-grid gap-3">
          <div className="app-card">
            <div className="card-head"><h3 className="card-heading">Profile</h3></div>
            <div className="card-body-app">
              <div className="profile-grid">
                <div>
                  <div className="profile-preview">
                    <span className="profile-avatar lg">{initials}</span>
                    <div>
                      <h4 className="mb-0">{employee.name}</h4>
                      <strong>{employee.role}</strong>
                      <div className="helper-text">
                        {employee.phone}<br />
                        {employee.name.split(' ')[0].toLowerCase()}.{employee.name.split(' ')[1].toLowerCase()}@lazypygmy.lr
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 helper-text">Manages 3 storekeepers at WH-01</div>
                  <div className="helper-text">On duty 06:00 – 18:00, Mon to Sat</div>
                </div>
                <div>
                  <div className="kv-row"><span>Employee number</span><strong>{employee.number}</strong></div>
                  <div className="kv-row"><span>Department</span><strong>{employee.department}</strong></div>
                  <div className="kv-row"><span>Assigned location</span><strong>{employee.location}</strong></div>
                  <div className="kv-row"><span>Employment date</span><strong>{employee.employed}</strong></div>
                  <div className="kv-row"><span>Gender</span><strong>Female</strong></div>
                  <div className="kv-row"><span>Reports to</span><strong>Grace Kollie</strong></div>
                </div>
              </div>
              <div className="helper-text mt-3">
                {employee.name.split(' ')[0]} signs off all stock adjustments and transfers raised at Central Warehouse.
              </div>
            </div>
          </div>

          <div className="app-card">
            <div className="card-head d-flex justify-content-between">
              <h3 className="card-heading">Recent Activity</h3>
              <button type="button" className="btn btn-link p-0">View full log</button>
            </div>
            {ACTIVITY.map((a, i) => (
              <div key={i} className={`activity-compact ${a.tag}`}>
                <span />
                <div>
                  <strong>{a.text}</strong>
                  <div className="helper-text">{a.sub}</div>
                </div>
                <time>{a.when}</time>
              </div>
            ))}
          </div>
        </div>

        <div className="right-stack">
          <div className="app-card">
            <div className="card-head"><h3 className="card-heading">Role & Access</h3></div>
            <div className="card-body-app">
              <div className="d-flex justify-content-between">
                <div>
                  <strong>{employee.role}</strong>
                  <div className="helper-text">Site operations at {employee.location}</div>
                </div>
                <span className="badge-status badge-info">6 of 15</span>
              </div>
              <hr />
              <div className="kv-row"><span>Last sign-in</span><strong>Today, 06:12</strong></div>
              <div className="kv-row"><span>Two-factor</span><strong className="text-success">Enabled</strong></div>
              <div className="kv-row"><span>Sessions</span><strong>1 active</strong></div>
              <div className="kv-row"><span>Password age</span><strong>41 days</strong></div>
              <div className="helper-text mt-3">Can adjust inventory and approve transfers.</div>
            </div>
          </div>
          <div className="app-card">
            <div className="card-head d-flex justify-content-between">
              <h3 className="card-heading">Performance</h3>
              <span className="helper-text">Last 30 days</span>
            </div>
            <div className="card-body-app">
              <div className="metric-line">
                <span>Transactions logged</span>
                <strong className="text-primary">84</strong>
              </div>
              <div className="metric-line">
                <span>Orders processed</span>
                <strong>32</strong>
              </div>
              <div className="metric-line">
                <span>Average lead time</span>
                <strong>1.4 days</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={onDelete}
        title="Delete this employee?"
        subtitle={`${employee.number} · ${employee.name}`}
        consequences={[
          'The employee record and any saved preferences will be removed.',
          'Their past orders, transfers and adjustments remain in history (attributed to the deleted number).',
          'Use Suspend instead if you want to keep history but block access.',
        ]}
        acknowledge="I understand this employee record will be removed."
        confirmLabel="Delete employee"
      />
    </>
  );
}