/**
 * useRolePermissions — persisted permission matrix (lp_rolePermissions).
 *
 * The shape is keyed by role name (e.g. "Administrator", "Inventory
 * Manager") → { [permission]: boolean }. The hook returns
 *   [matrix, save, can]
 * where `can(role, permission)` is the gate used by destructive-action
 * buttons to hide themselves from non-approver roles.
 *
 * Audit fix: previously the hook was a near-stub returned-data-only
 * accessor. It now exposes a real `can()` helper, ships a default
 * permission matrix matching the EmployeeRoles page, and persists user
 * edits to lp_rolePermissions so they survive reload.
 */
import { useCallback, useState } from 'react';
import { localStorageStore } from './localStorageStore.js';

/**
 * Default permission matrix. Mirrors the 9-role × 15-permission grid in
 * EmployeeRoles.jsx. Permission names are short nouns; the column name
 * in the matrix page is the human-readable label.
 */
export const DEFAULT_PERMISSIONS = {
  Administrator: { View: true, Add: true, Edit: true, Delete: true, Adjust: true, Approve: true, Manage: true, Export: true, Financial: true },
  'Inventory Manager': { View: true, Add: true, Edit: true, Adjust: true, Approve: true, Manage: true, Export: true },
  'Warehouse Manager': { View: true, Edit: true, Adjust: true, Manage: true },
  'Sales Officer': { View: true, Add: true, Export: true },
  'Procurement Officer': { View: true, Edit: true, Add: true, Approve: true, Export: true },
  Accountant: { View: true, Export: true, Financial: true },
  Storekeeper: { View: true, Adjust: true, Manage: true },
  'Delivery Officer': { View: true, Manage: true },
  Viewer: { View: true },
};

/**
 * The 9 roles exposed in the EmployeeRoles admin grid.
 */
export const ROLE_NAMES = Object.keys(DEFAULT_PERMISSIONS);

export function useRolePermissions() {
  const [matrix, setMatrix] = useState(() => localStorageStore.get('rolePermissions', DEFAULT_PERMISSIONS));

  const save = useCallback((next) => {
    const merged = { ...DEFAULT_PERMISSIONS, ...next };
    localStorageStore.set('rolePermissions', merged);
    setMatrix(merged);
  }, []);

  const can = useCallback(
    (role, permission) => {
      const row = matrix[role] || DEFAULT_PERMISSIONS[role] || {};
      return Boolean(row[permission]);
    },
    [matrix]
  );

  return [matrix, save, can];
}

/**
 * Stable helper outside the hook — used by route components that only
 * need to read the active role's permissions without subscribing to the
 * matrix.
 */
export function roleCan(matrix, role, permission) {
  const row = matrix?.[role] || DEFAULT_PERMISSIONS[role] || {};
  return Boolean(row[permission]);
}
