/**
 * useEntity — generic React hook factory for a single localStorage-backed entity.
 * Replaces the per-entity hooks (useProducts, useSuppliers, ...) listed in the plan.
 * Returns { items, add, update, remove, reset }.
 */
import { useCallback, useState } from 'react';
import { localStorageStore } from './localStorageStore.js';

export function createEntityHook(entityKey) {
  return function useEntity() {
    const [items, setItems] = useState(() => localStorageStore['get' + entityKey]());
    const idField = idFieldFor(entityKey);

    const persist = useCallback((next) => {
      localStorageStore['save' + entityKey](next);
      setItems(next);
    }, []);

    const add = useCallback(
      (record) => {
        const next = [record, ...items];
        persist(next);
        return next;
      },
      [items, persist]
    );

    const update = useCallback(
      (id, patch) => {
        const next = items.map((it) => (it[idField] === id ? { ...it, ...patch } : it));
        persist(next);
        return next;
      },
      [items, idField, persist]
    );

    const remove = useCallback(
      (id) => {
        const next = items.filter((it) => it[idField] !== id);
        persist(next);
        return next;
      },
      [items, idField, persist]
    );

    // `entityKey` is intentionally captured by the deps array: it's the
    // stable hook-factory key captured once when the component is created,
    // not a render-time value. Excluding it would let a stale closure hold
    // the wrong key after a hot-reload. ESLint can't trace the factory
    // pattern, so the rule is disabled for this single line.
    const reset = useCallback(() => {
      localStorageStore.remove(entityKey.charAt(0).toLowerCase() + entityKey.slice(1));
      setItems(localStorageStore['get' + entityKey]());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityKey]);

    return { items, add, update, remove, reset };
  };
}

function idFieldFor(entityKey) {
  switch (entityKey) {
    case 'Products':
      return 'sku';
    case 'Suppliers':
      return 'code';
    case 'Warehouses':
      return 'code';
    case 'Schools':
      return 'code';
    case 'Orders':
      return 'order';
    case 'Employees':
      return 'number';
    case 'Roles':
      return 'name';
    case 'PurchaseOrders':
      return 'po';
    default:
      return 'id';
  }
}

// Convenience exports
export const useProducts = createEntityHook('Products');
export const useSuppliers = createEntityHook('Suppliers');
export const useWarehouses = createEntityHook('Warehouses');
export const useSchools = createEntityHook('Schools');
export const useOrders = createEntityHook('Orders');
export const useEmployees = createEntityHook('Employees');
export const useRoles = createEntityHook('Roles');
export const usePurchaseOrders = createEntityHook('PurchaseOrders');
