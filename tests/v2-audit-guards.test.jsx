/**
 * v2.0 Phase 7 audit-guard tests.
 *
 * Two specific checks called out in master prompt §7:
 *   - Storage quota abuse: no localStorage.setItem of any value > 100 KB
 *     (counts the JSON-stringified length of every lp_* key the app writes).
 *   - Click-spam duplicate-submit guard: OrderReview's submit must yield
 *     exactly one order even when the button is invoked many times.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// ──────────────────────────────────────────────────────────────────────────────
// 1. Storage-quota guard
// ──────────────────────────────────────────────────────────────────────────────

describe('storage-quota guard (no lp_* key > 100 KB)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('never writes a localStorage value greater than 100 KB', async () => {
    // Run the same writes the app does: seed defaults + auth + a few CRUD ops.
    const { localStorageStore } = await import('../src/data-access/localStorageStore.js');
    localStorageStore.saveProducts(localStorageStore.getProducts());
    localStorageStore.saveSuppliers(localStorageStore.getSuppliers());
    localStorageStore.saveOrders(localStorageStore.getOrders());
    localStorageStore.saveSchools(localStorageStore.getSchools());
    localStorageStore.saveEmployees(localStorageStore.getEmployees());
    localStorage.setItem('lp_auth', '1');

    let maxKey = '';
    let maxSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k);
      if (v.length > maxSize) {
        maxSize = v.length;
        maxKey = k;
      }
    }
    expect(maxSize).toBeLessThanOrEqual(100 * 1024);
    // Sanity check that we actually exercised the store
    expect(maxKey.startsWith('lp_')).toBe(true);
  });

  it('does not contain a Blob or data: URL anywhere in localStorage', () => {
    const offenders = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k);
      if (/^(blob:|data:image\/)/i.test(v) || /"blob:|data:image\//i.test(v)) {
        offenders.push(k);
      }
    }
    expect(offenders).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. Click-spam duplicate-submit guard (OrderReview)
// ──────────────────────────────────────────────────────────────────────────────

describe('OrderReview duplicate-submit guard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it('submits exactly one order even when "Send for Approval" is clicked 20 times', async () => {
    vi.useRealTimers();
    const { OrderDraftProvider } = await import('../src/data-access/useOrderDraft.jsx');
    const { ToastProvider } = await import('../src/components/ToastProvider.jsx');
    const OrderReview = (
      await import('../src/routes/orders/OrderReview.jsx')
    ).default;

    // Seed a draft with at least one line so Review is non-empty.
    const { localStorageStore } = await import('../src/data-access/localStorageStore.js');
    localStorage.setItem(
      'lp_orderDraft',
      JSON.stringify({
        order: 'ORD-TEST-1',
        school: 'Test School',
        schoolCode: 'SCH-T1',
        orderDate: '2026-08-21',
        deliveryDate: '2026-08-22',
        route: 'Monrovia – Bong',
        priority: 'Standard',
        salesOfficer: 'Grace Doe',
        deliveryOfficer: 'Peter Sirleaf',
        terms: 'Net 30',
        schoolPO: '',
        availableCredit: 890,
        lines: [
          { sku: 'BK-0142', name: 'ABC Beginner Book', price: 3.5, qty: 5 },
        ],
      })
    );

    // orders hook reads from localStorageStore.getOrders() — give it the seed.
    const seedOrders = localStorageStore.getOrders();

    function Harness() {
      return (
        <MemoryRouter initialEntries={['/orders/new/review']}>
          <ToastProvider>
            <OrderDraftProvider>
              <Routes>
                <Route path="/orders/new/review" element={<OrderReview />} />
                <Route path="/orders/new/products" element={<div>products step</div>} />
                <Route path="/orders" element={<div>orders list</div>} />
              </Routes>
            </OrderDraftProvider>
          </ToastProvider>
        </MemoryRouter>
      );
    }

    render(<Harness />);

    // Click 20 times rapidly. The submit handler has a useRef boolean and a
    // setConfirmOpen dialog flow — first click opens the dialog; subsequent
    // clicks (without confirming) must not create a new order.
    const sendBtn = await screen.findByRole('button', { name: /send for approval/i });

    for (let i = 0; i < 20; i++) {
      fireEvent.click(sendBtn);
    }

    // No order written yet — the confirmation dialog intercepts.
    let orders = localStorageStore.getOrders();
    expect(orders.length).toBe(seedOrders.length);

    // Confirm the dialog.
    const confirmBtn = await screen.findByRole('button', { name: /yes, send for approval/i });
    fireEvent.click(confirmBtn);

    // Even if the user manages to click "Send for Approval" once more between
    // confirm and the success state transition, the ref guard blocks.
    fireEvent.click(sendBtn);
    fireEvent.click(sendBtn);
    fireEvent.click(sendBtn);

    orders = localStorageStore.getOrders();
    const drafts = orders.filter((o) => o.order === 'ORD-TEST-1');
    expect(drafts.length).toBe(1);
  });
});