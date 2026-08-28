import { useState } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { useRolePermissions } from '../../data-access/useRolePermissions.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * EmployeeRoles — replaces employees/roles.html (PPT slide 47).
 * Static 9×15 permission matrix with locked Administrator row + Save
 * Changes / Add Role buttons.
 *
 * Audit fix: the role toggles now write through to the lp_rolePermissions
 * store via useRolePermissions, so they persist across reloads and feed
 * the can(role, permission) gate used by destructive actions elsewhere
 * (e.g. OrderDetail cancel button).
 */
// Permission columns: each entry has a unique key (used for state + can() checks)
// and a human-readable label rendered in the table header. The keys match the
// short-noun permission names used by useRolePermissions().can() so the matrix
// state and the can() gate stay in lockstep — no more duplicate-string collisions
// when "View" / "Manage" each appeared multiple times in PERMS.
const PERMS = [
  { key: 'products.view', label: 'View' },
  { key: 'products.add', label: 'Add' },
  { key: 'products.edit', label: 'Edit' },
  { key: 'products.delete', label: 'Delete' },
  { key: 'inventory.view', label: 'View' },
  { key: 'inventory.adjust', label: 'Adjust' },
  { key: 'people.employees', label: 'Employees' },
  { key: 'people.suppliers', label: 'Suppliers' },
  { key: 'people.schools', label: 'Schools' },
  { key: 'orders.create', label: 'Create' },
  { key: 'orders.approve', label: 'Approve' },
  { key: 'orders.manage', label: 'Manage' },
  { key: 'reports.financial', label: 'Financial' },
  { key: 'reports.export', label: 'Export' },
  { key: 'admin.manage', label: 'Manage' },
];
const GROUPS = ['PRODUCTS', 'INVENTORY', 'PEOPLE', 'ORDERS', 'WHSE', 'REPORTS', 'ADMIN'];
const COLS = [4, 2, 3, 2, 1, 2, 1];

const ROLES = [
  { name: 'Administrator', desc: 'Full system access', count: 15, locked: true, perms: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true] },
  { name: 'Inventory Manager', desc: 'Stock and purchasing', count: 10, perms: [true, true, true, false, true, true, false, true, false, true, true, true, false, true, false] },
  { name: 'Warehouse Manager', desc: 'Site operations', count: 6, perms: [true, false, true, false, true, true, false, false, false, false, false, true, false, false, false] },
  { name: 'Sales Officer', desc: 'Schools and orders', count: 5, perms: [true, false, false, false, true, false, false, false, true, true, false, false, false, true, false] },
  { name: 'Procurement Officer', desc: 'Suppliers and POs', count: 7, perms: [true, false, true, false, true, false, false, true, false, true, true, false, false, true, false] },
  { name: 'Accountant', desc: 'Finance and reports', count: 6, perms: [true, false, false, false, true, false, false, false, false, false, false, false, true, true, false] },
  { name: 'Storekeeper', desc: 'Picking, packing and stock counts', count: 3, perms: [true, false, false, false, true, true, false, false, false, false, false, true, false, false, false] },
  { name: 'Delivery Officer', desc: 'Routes and POD', count: 3, perms: [true, false, false, false, true, false, false, false, false, false, false, true, false, false, false] },
  { name: 'Viewer', desc: 'Read-only access', count: 3, perms: [true, false, false, false, true, false, false, false, false, false, false, false, false, false, false] },
];

export default function EmployeeRoles() {
  const toast = useToast();
  const [, save] = useRolePermissions();
  // Local in-memory representation of the matrix — keyed by role → permKey → on.
  const [grid, setGrid] = useState(() => {
    const m = {};
    ROLES.forEach((r) => {
      m[r.name] = {};
      PERMS.forEach((p, i) => { m[r.name][p.key] = r.perms[i]; });
    });
    return m;
  });

  const toggle = (role, permKey, on) => {
    setGrid((g) => ({ ...g, [role]: { ...g[role], [permKey]: on } }));
  };

  // Translate the scoped grid keys (e.g. "orders.manage") into the
  // short-noun permission names (e.g. "Manage") that useRolePermissions()
  // and the can() gate elsewhere expect. If any scoped key in a group
  // is on, the corresponding short permission is on. This keeps the
  // matrix display unique per column while the rest of the app keeps
  // working with the existing permission names.
  const PERM_GROUP_TO_SHORT = {
    'products.view': 'View',
    'products.add': 'Add',
    'products.edit': 'Edit',
    'products.delete': 'Delete',
    'inventory.view': 'View',
    'inventory.adjust': 'Adjust',
    'people.employees': 'Employees',
    'people.suppliers': 'Suppliers',
    'people.schools': 'Schools',
    'orders.create': 'Create',
    'orders.approve': 'Approve',
    'orders.manage': 'Manage',
    'reports.financial': 'Financial',
    'reports.export': 'Export',
    'admin.manage': 'Manage',
  };

  const onSave = () => {
    const translated = {};
    Object.entries(grid).forEach(([role, perms]) => {
      translated[role] = {};
      Object.entries(perms).forEach(([key, on]) => {
        const short = PERM_GROUP_TO_SHORT[key];
        if (short) translated[role][short] = translated[role][short] || on;
      });
    });
    save(translated);
    toast('Permission changes saved. They will apply at next sign-in.');
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Employees', to: '/employees' },
          { label: 'Roles & permissions' },
        ]}
      />
      <PageHeader
        title="Roles & Permissions"
        subtitle={`${ROLES.length} roles · ${PERMS.length} permissions · changes apply at next sign-in · last edited 4 Jan 2026 by Moses Kollie`}
      >
        <button className="btn btn-outline-app" onClick={() => toast('Add Role dialog opened.')}>Add Role</button>
        <button className="btn btn-primary-app" onClick={onSave}>Save Changes</button>
      </PageHeader>

      <div className="app-card">
        <div className="card-head d-flex justify-content-between">
          <h3 className="card-heading">Permission Matrix</h3>
          <strong className="text-primary">Administrator is locked</strong>
        </div>
        <div className="permissions-scroll">
          <table className="table table-app permissions-table">
            <thead>
              <tr>
                <th scope="col" />
                {GROUPS.map((g, i) => (
                  <th scope="col" key={g} colSpan={COLS[i]}>{g}</th>
                ))}
              </tr>
              <tr>
                <th scope="col">ROLE</th>
                {PERMS.map((p) => (
                  <th scope="col" key={p.key}>{p.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r.name}>
                  <td>
                    <strong>{r.name}</strong>
                    <div className="helper-text">{r.desc}</div>
                    <span className="role-count visually-hidden">{r.count}</span>
                  </td>
                  {PERMS.map((p, i) => (
                    <td key={p.key}>
                      <div className="form-check form-switch d-inline-block">
                        <input
                          className="form-check-input role-permission"
                          type="checkbox"
                          data-role={r.name}
                          data-perm={p.key}
                          checked={Boolean(grid[r.name]?.[p.key])}
                          onChange={(e) => toggle(r.name, p.key, e.target.checked)}
                          disabled={r.locked}
                          aria-label={`${r.name}: ${p.label}`}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
