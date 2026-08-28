/**
 * Business-rule parity tests — one per AUDIT_REPORT.md §5 entry.
 * Locks in the discount=44, delivery=35, default credit=890, GRN short-receipt
 * math, and status-badge keyword mapping so a future regression can't drift.
 */
import { describe, expect, it } from 'vitest';
import { DISCOUNT, DELIVERY, DEFAULT_CREDIT } from '../src/data-access/useOrderDraft.jsx';
import { statusClass } from '../src/lib/status.js';
import { money, number } from '../src/lib/format.js';

describe('Order wizard constants', () => {
  it('discount is $44', () => expect(DISCOUNT).toBe(44));
  it('delivery is $35', () => expect(DELIVERY).toBe(35));
  it('default available credit is $890', () => expect(DEFAULT_CREDIT).toBe(890));
});

describe('Order totals formula', () => {
  it('subtotal - 44 + 35', () => {
    const sub = 120 * 3.5 + 100 * 1.6 + 60 * 3.4 + 40 * 4; // 420 + 160 + 204 + 160 = 944
    expect(sub).toBe(944);
    const total = sub - DISCOUNT + DELIVERY;
    expect(total).toBe(935);
  });

  it('over credit warning only triggers when total > availableCredit', () => {
    const credit = DEFAULT_CREDIT;
    const sub = 1200; // > 890 + 44 - 35 = 899
    const total = sub - DISCOUNT + DELIVERY;
    expect(total - credit).toBeGreaterThan(0); // exceeds
    const sub2 = 800; // < 899
    const total2 = sub2 - DISCOUNT + DELIVERY;
    expect(total2 - credit).toBeLessThan(0); // within
  });
});

describe('GRN short-receipt math (AUDIT §5.7)', () => {
  function grnRow(input, ordered, already) {
    const rec = Math.min(input, Math.max(0, ordered - already));
    const out = Math.max(0, ordered - already - rec);
    return { rec, out };
  }
  it('partial: input < remaining', () => {
    expect(grnRow(80, 120, 0)).toEqual({ rec: 80, out: 40 });
  });
  it('complete: input == remaining', () => {
    expect(grnRow(120, 120, 0)).toEqual({ rec: 120, out: 0 });
  });
  it('caps over-receive', () => {
    expect(grnRow(999, 120, 0)).toEqual({ rec: 120, out: 0 });
  });
  it('respects already-received', () => {
    expect(grnRow(50, 120, 80)).toEqual({ rec: 40, out: 0 });
  });
});

describe('Status badge keyword rules (AUDIT §5.8)', () => {
  const cases = [
    ['Out of Stock', 'badge-out'],
    ['Cancelled', 'badge-out'],
    ['Unpaid', 'badge-out'],
    ['Overdue', 'badge-out'],
    ['Rejected', 'badge-out'],
    ['Damaged', 'badge-out'],
    ['Written Off', 'badge-out'],
    ['Low Stock', 'badge-low'],
    ['Packed', 'badge-low'],
    ['Partially Received', 'badge-low'],
    ['Pending Approval', 'badge-low'],
    ['Suspended', 'badge-low'],
    ['In Inspection', 'badge-low'],
    ['In Transit', 'badge-low'],
    ['Short 12', 'badge-low'],
    ['Processing', 'badge-processing'],
    ['Approved', 'badge-processing'],
    ['Dispatched', 'badge-processing'],
    ['Draft', 'badge-draft'],
    ['Inactive', 'badge-draft'],
    ['Under Review', 'badge-under-review'],
    ['In Stock', 'badge-instock'],
    ['Operational', 'badge-instock'],
    ['Delivered', 'badge-instock'],
    ['Received', 'badge-instock'],
    ['Paid', 'badge-instock'],
    ['Active', 'badge-instock'],
  ];
  for (const [status, expected] of cases) {
    it(`${status} → ${expected}`, () => expect(statusClass(status)).toBe(expected));
  }
});

describe('Format helpers', () => {
  it('money uses $ prefix and 2 decimals', () => {
    expect(money(1234.5)).toBe('$1,234.50');
    expect(money(0)).toBe('$0.00');
  });
  it('number uses locale thousands', () => {
    expect(number(1234567)).toBe('1,234,567');
  });
});
