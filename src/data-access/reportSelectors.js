/**
 * reportSelectors — pure read-only derivations over localStorageStore data.
 *
 * Used by the Reports page so that:
 *   - the same numbers are computed consistently across reports
 *   - selectors are testable in isolation
 *   - the Reports page only has to compose + render, not re-derive logic
 *
 * Every selector accepts the raw arrays and returns plain JS values/objects.
 * Nothing here mutates state. If `localStorageStore` is passed, the selector
 * reads it directly (so callers can avoid passing the same six arrays).
 */
import { localStorageStore } from './localStorageStore.js';

function pull(store) {
  if (store) return store;
  return {
    products: localStorageStore.getProducts(),
    purchaseOrders: localStorageStore.getPurchaseOrders(),
    orders: localStorageStore.getOrders(),
    warehouses: localStorageStore.getWarehouses(),
    suppliers: localStorageStore.getSuppliers(),
    receipts: localStorageStore.getReceipts(),
    schools: localStorageStore.getSchools(),
  };
}

export function inventoryValuation(store) {
  const s = pull(store);
  const rows = s.products.map((p) => ({
    sku: p.sku,
    name: p.name,
    category: p.category,
    onHand: Number(p.onHand ?? p.stock ?? 0),
    reorder: Number(p.reorder ?? 0),
    cost: Number(p.cost ?? 0),
    price: Number(p.price ?? 0),
    value: Number(p.onHand ?? p.stock ?? 0) * Number(p.cost ?? 0),
  }));
  const totalValue = rows.reduce((acc, r) => acc + r.value, 0);
  const totalUnits = rows.reduce((acc, r) => acc + r.onHand, 0);
  const byCategory = rows.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + r.value;
    return acc;
  }, {});
  const lowStock = rows.filter((r) => r.onHand <= r.reorder).length;
  const outOfStock = rows.filter((r) => r.onHand === 0).length;
  return { rows, totalValue, totalUnits, byCategory, lowStock, outOfStock };
}

export function stockHealth(store) {
  const s = pull(store);
  const out = [];
  s.products.forEach((p) => {
    const onHand = Number(p.onHand ?? p.stock ?? 0);
    const reorder = Number(p.reorder ?? 0);
    let status = 'In Stock';
    if (onHand === 0) status = 'Out of Stock';
    else if (onHand <= reorder) status = 'Low Stock';
    out.push({ sku: p.sku, name: p.name, category: p.category, onHand, reorder, status });
  });
  const byStatus = out.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  return { rows: out, byStatus };
}

export function ordersSummary(store) {
  const s = pull(store);
  const rows = s.orders.map((o) => ({
    order: o.order,
    school: o.school,
    county: o.county,
    items: Number(o.items ?? 0),
    total: Number(o.total ?? 0),
    status: o.status,
    placedAt: o.placedAt,
  }));
  const total = rows.reduce((acc, r) => acc + r.total, 0);
  const byStatus = rows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  return { rows, total, count: rows.length, byStatus };
}

export function purchasingReceiving(store) {
  const s = pull(store);
  const poRows = s.purchaseOrders.map((p) => ({
    po: p.po,
    supplier: p.supplier,
    date: p.date,
    total: Number(p.total ?? 0),
    status: p.status,
    expected: p.expected,
  }));
  const receiptRows = s.receipts.map((r) => ({
    id: r.id,
    po: r.po,
    supplier: r.supplier,
    date: r.date,
    warehouse: r.warehouse,
    receivedBy: r.receivedBy,
    deliveryNote: r.deliveryNote,
    total: Number(r.total ?? 0),
    lineCount: Array.isArray(r.lines) ? r.lines.length : 0,
  }));
  const poTotal = poRows.reduce((acc, r) => acc + r.total, 0);
  const receivedTotal = receiptRows.reduce((acc, r) => acc + r.total, 0);
  return { poRows, receiptRows, poTotal, receivedTotal };
}

export function supplierPerformance(store) {
  const s = pull(store);
  const map = new Map();
  s.purchaseOrders.forEach((p) => {
    const key = p.supplier || 'Unknown';
    if (!map.has(key)) map.set(key, { supplier: key, pos: 0, total: 0, onTime: 0 });
    const row = map.get(key);
    row.pos += 1;
    row.total += Number(p.total ?? 0);
    if ((p.status || '').toLowerCase().includes('received')) row.onTime += 1;
  });
  return Array.from(map.values()).map((r) => ({
    ...r,
    onTimeRate: r.pos ? r.onTime / r.pos : 0,
  }));
}

/**
 * reorderSuggestions — produce a draft-PO-ready list of low-stock products.
 *
 * Reads `products` from the store (or the passed-in store) and returns one
 * row per product whose `qty` is at or below its `reorder` threshold. The
 * `order` column holds the suggested order quantity so the calling page
 * can drop the rows straight into a draft PO without further derivation.
 *
 * Sort order: out-of-stock first, then by the absolute gap (reorder - qty)
 * descending. This matches the "Sorted by urgency" ordering used on the
 * InventoryLowStock page so the suggestion panel and the PO builder agree
 * on which products are most pressing.
 *
 * Returned shape:
 *   { rows, count, totalUnits, totalValue }
 *   rows: [{ sku, name, supplier, qty, reorder, status, order, cost, lineValue }]
 */
export function reorderSuggestions(store) {
  const s = pull(store);
  const candidates = s.products
    .map((p) => {
      const qty = Number(p.qty ?? p.onHand ?? p.stock ?? 0);
      const reorder = Number(p.reorder ?? 0);
      const cost = Number(p.cost ?? 0);
      const gap = Math.max(0, reorder - qty);
      const order = Math.max(reorder * 2 - qty, reorder);
      const lineValue = order * cost;
      const status = qty === 0 ? 'Out of Stock' : qty <= reorder ? 'Low Stock' : 'In Stock';
      return { sku: p.sku, name: p.name, supplier: p.supplier, qty, reorder, status, order, cost, lineValue };
    })
    .filter((r) => r.status !== 'In Stock')
    .sort((a, b) => {
      if (a.qty === 0 && b.qty !== 0) return -1;
      if (b.qty === 0 && a.qty !== 0) return 1;
      const ga = Math.max(0, a.reorder - a.qty);
      const gb = Math.max(0, b.reorder - b.qty);
      return gb - ga;
    });

  const totalUnits = candidates.reduce((acc, r) => acc + r.order, 0);
  const totalValue = candidates.reduce((acc, r) => acc + r.lineValue, 0);
  return { rows: candidates, count: candidates.length, totalUnits, totalValue };
}

export function schoolActivity(store) {
  const s = pull(store);
  const map = new Map();
  s.orders.forEach((o) => {
    const key = o.school || 'Unknown';
    if (!map.has(key)) map.set(key, { school: key, county: o.county, orders: 0, total: 0 });
    const row = map.get(key);
    row.orders += 1;
    row.total += Number(o.total ?? 0);
  });
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export const ALL_REPORTS = [
  { id: 'inventory-valuation', label: 'Inventory Valuation' },
  { id: 'stock-health', label: 'Stock Health' },
  { id: 'orders-summary', label: 'Orders Summary' },
  { id: 'purchasing-receiving', label: 'Purchasing / Receiving' },
  { id: 'supplier-performance', label: 'Supplier Performance' },
  { id: 'school-activity', label: 'School Activity' },
];
