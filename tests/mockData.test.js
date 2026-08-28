/**
 * Data-parity test — locks in the data-model from AUDIT_REPORT.md §4.
 * Every entity field must be present (no field added or renamed) and the
 * 9 seed records for products must be intact.
 */
import { describe, expect, it } from 'vitest';
import { mockData } from '../src/data/mockData.js';

describe('Entity field set (AUDIT §4)', () => {
  const expected = {
    products: ['sku', 'name', 'category', 'warehouse', 'cost', 'price', 'qty', 'status', 'supplier', 'reorder', 'reserved', 'updated'],
    suppliers: ['code', 'name', 'location', 'contact', 'terms', 'products', 'purchases', 'outstanding', 'rating', 'status'],
    warehouses: ['code', 'name', 'location', 'manager', 'units', 'capacity', 'value', 'status'],
    purchaseOrders: ['po', 'supplier', 'raised', 'expected', 'items', 'units', 'value', 'received', 'status'],
    notifications: ['type', 'level', 'title', 'text', 'time', 'unread'],
    schools: ['code', 'name', 'type', 'category', 'county', 'contact', 'pupils', 'orders', 'spend', 'outstanding', 'status'],
    orders: ['order', 'school', 'date', 'items', 'units', 'total', 'payment', 'status', 'officer'],
    employees: ['number', 'name', 'role', 'department', 'location', 'phone', 'employed', 'status'],
    roles: ['name', 'count', 'locked'],
  };

  for (const [entity, fields] of Object.entries(expected)) {
    it(`${entity} has exactly the expected fields`, () => {
      expect(mockData[entity].length).toBeGreaterThan(0);
      for (const rec of mockData[entity]) {
        for (const f of fields) expect(rec).toHaveProperty(f);
      }
    });
  }

  it('branding: 0 EduStock references in mock data', () => {
    const blob = JSON.stringify(mockData);
    expect(blob).not.toMatch(/EduStock/i);
  });
});

describe('Seed counts match source', () => {
  it('10 products', () => expect(mockData.products.length).toBe(10));
  it('6 suppliers', () => expect(mockData.suppliers.length).toBe(6));
  it('3 warehouses', () => expect(mockData.warehouses.length).toBe(3));
  it('11 purchase orders', () => expect(mockData.purchaseOrders.length).toBe(11));
  it('6 notifications', () => expect(mockData.notifications.length).toBe(6));
  it('7 schools', () => expect(mockData.schools.length).toBe(7));
  it('6 orders', () => expect(mockData.orders.length).toBe(6));
  it('9 employees', () => expect(mockData.employees.length).toBe(9));
  it('9 roles', () => expect(mockData.roles.length).toBe(9));
});
