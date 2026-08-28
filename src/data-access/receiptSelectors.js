/**
 * receiptSelectors — pure helpers for /inventory/receipts and its detail.
 */
import { localStorageStore } from './localStorageStore.js';

function pull() {
  return {
    receipts: localStorageStore.getReceipts(),
    purchaseOrders: localStorageStore.getPurchaseOrders(),
    suppliers: localStorageStore.getSuppliers(),
    warehouses: localStorageStore.getWarehouses(),
  };
}

export function listReceipts() {
  const { receipts } = pull();
  return [...receipts].sort((a, b) => {
    // sort newest first by id (ids are GRN-YYYY-NNNN, lexicographic works)
    if (a.id < b.id) return 1;
    if (a.id > b.id) return -1;
    return 0;
  });
}

export function getReceipt(id) {
  return pull().receipts.find((r) => r.id === id) || null;
}

export function receiptLineTotal(line) {
  const qty = Number(line?.qtyReceived ?? line?.qty ?? 0);
  const unit = Number(line?.unitCost ?? line?.cost ?? 0);
  return qty * unit;
}

export function receiptTotals(receipt) {
  if (!receipt) return { total: 0, totalUnits: 0, lineCount: 0 };
  const lines = Array.isArray(receipt.lines) ? receipt.lines : [];
  const total = lines.reduce((acc, l) => acc + receiptLineTotal(l), 0);
  const totalUnits = lines.reduce((acc, l) => acc + Number(l.qtyReceived ?? l.qty ?? 0), 0);
  return { total, totalUnits, lineCount: lines.length };
}

/**
 * Receives a PO and writes a new receipt to localStorageStore. Returns the
 * saved receipt record. Falls back to a deterministic default for the
 * purchase-order-driven case (Phase-5 hardening: a real product would
 * include the full supplier/invoice set).
 */
export function createReceiptFromPO(po, form) {
  if (!po) throw new Error('Missing purchase order');
  const existing = pull().receipts;
  const seq = existing.length + 1;
  const year = new Date().getFullYear();
  const id = `GRN-${year}-${String(seq).padStart(4, '0')}`;
  const lines = (form?.lines || []).map((l) => ({
    sku: l.sku,
    name: l.name,
    qtyOrdered: Number(l.qtyOrdered ?? 0),
    qtyReceived: Number(l.qtyReceived ?? 0),
    unitCost: Number(l.unitCost ?? 0),
  }));
  const receipt = {
    id,
    po: po.po,
    supplier: po.supplier,
    date: form?.date || new Date().toISOString().slice(0, 10),
    warehouse: form?.warehouse || 'WH-01 Central',
    receivedBy: form?.receivedBy || 'Sarah Weah',
    deliveryNote: form?.deliveryNote || `DN-${po.po || 'KP'}-${Math.floor(1000 + Math.random() * 9000)}`,
    lines,
  };
  const next = [receipt, ...existing];
  localStorageStore.saveReceipts(next);
  return receipt;
}
