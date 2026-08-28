/**
 * Order-draft hook + Context. Persists to lp_orderDraft exactly like the
 * vanilla JS prototype (orders.js → LPStore.set/get).
 *
 * Default values mirror orders.js:
 *   - order: 'ORD-2026-0087'
 *   - school: 'Nimba Community School'
 *   - availableCredit: 890
 *   - lines: 4 pre-loaded lines
 *
 * Business rules (AUDIT_REPORT.md §5.2):
 *   - discount = $44
 *   - delivery = $35
 *   - total = subtotal - 44 + 35
 *   - credit warning if total > availableCredit
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { localStorageStore } from './localStorageStore.js';

export const DISCOUNT = 44;
export const DELIVERY = 35;
export const DEFAULT_CREDIT = 890;

const DEFAULT_LINES = [
  { sku: 'BK-0142', name: 'ABC Beginner Book', price: 3.5, qty: 120 },
  { sku: 'CB-0104', name: 'Handwriting Copybook', price: 1.6, qty: 100 },
  { sku: 'GC-0057', name: 'Memory Matching Cards', price: 3.4, qty: 60 },
  { sku: 'BK-0148', name: 'My First Mathematics Book', price: 4, qty: 40 },
];

const DEFAULT_DRAFT = {
  order: 'ORD-2026-0087',
  school: 'Nimba Community School',
  schoolCode: 'SCH-061',
  orderDate: '',
  deliveryDate: '',
  route: '',
  priority: 'Standard',
  salesOfficer: '',
  deliveryOfficer: '',
  terms: 'Net 30',
  schoolPO: '',
  availableCredit: DEFAULT_CREDIT,
  lines: DEFAULT_LINES,
};

const OrderDraftContext = createContext(null);

export function OrderDraftProvider({ children }) {
  const [draft, setDraft] = useState(() =>
    localStorageStore.get('orderDraft', DEFAULT_DRAFT)
  );

  const persist = useCallback((next) => {
    localStorageStore.set('orderDraft', next);
    setDraft(next);
  }, []);

  const update = useCallback((patch) => persist({ ...draft, ...patch }), [draft, persist]);
  const reset = useCallback(() => persist(DEFAULT_DRAFT), [persist]);

  const addLine = useCallback(
    (line) => {
      if (draft.lines.some((l) => l.sku === line.sku)) return;
      persist({ ...draft, lines: [...draft.lines, { ...line, qty: line.qty || 1 }] });
    },
    [draft, persist]
  );

  const removeLine = useCallback(
    (idx) => {
      const lines = draft.lines.filter((_, i) => i !== idx);
      persist({ ...draft, lines });
    },
    [draft, persist]
  );

  const changeQty = useCallback(
    (idx, qty) => {
      const lines = draft.lines.map((l, i) => (i === idx ? { ...l, qty: Math.max(1, qty || 1) } : l));
      persist({ ...draft, lines });
    },
    [draft, persist]
  );

  const totals = useMemo(() => {
    const units = draft.lines.reduce((a, b) => a + b.qty, 0);
    const subtotal = draft.lines.reduce((a, b) => a + b.qty * b.price, 0);
    const total = subtotal - DISCOUNT + DELIVERY;
    const over = Math.max(0, total - (draft.availableCredit || DEFAULT_CREDIT));
    return { units, subtotal, discount: DISCOUNT, delivery: DELIVERY, total, over };
  }, [draft]);

  const value = { draft, update, reset, addLine, removeLine, changeQty, totals };
  return <OrderDraftContext.Provider value={value}>{children}</OrderDraftContext.Provider>;
}

export function useOrderDraft() {
  const ctx = useContext(OrderDraftContext);
  if (!ctx) throw new Error('useOrderDraft must be used within <OrderDraftProvider>');
  return ctx;
}
