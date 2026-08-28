import { useEffect, useMemo, useRef, useState } from 'react';
import { money } from '../lib/format.js';
import { useProducts } from '../data-access/useEntity.js';

/**
 * ProductPicker — searchable, category-filtered catalogue modal.
 *
 * Extracted from `routes/orders/OrderProducts.jsx` (T1-09). Reused by
 * `PurchaseOrderCreate` and `TransferCreate` where the same
 * "+ Add product" affordance was previously a no-op button.
 *
 * Props:
 *   open        — boolean, controls visibility
 *   onClose     — () => void, dismiss without selecting
 *   onPick      — (product) => void, called when a row is chosen; the
 *                 caller decides how to insert (PO line, transfer row, etc.)
 *   title       — optional modal heading
 *   excludeSkus — array of SKUs to disable (already selected elsewhere)
 *
 * Behaviour:
 *   - Backdrop click + Escape dismiss the modal.
 *   - Body scroll is locked while open.
 *   - Focus is moved to the search input on open and returned on close.
 *   - "Add" buttons toggle to "Added" (disabled) when their SKU is in
 *     `excludeSkus`, matching the OrderProducts catalogue affordance.
 */
export default function ProductPicker({
  open,
  onClose,
  onPick,
  title = 'Add product',
  excludeSkus = [],
}) {
  const { items: products } = useProducts();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const inputRef = useRef(null);
  const lastFocusRef = useRef(null);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products]
  );

  const filteredCatalogue = useMemo(() => {
    const term = q.toLowerCase();
    return products.filter(
      (p) =>
        (!term || (p.name + p.sku).toLowerCase().includes(term)) &&
        (!cat || p.category === cat)
    );
  }, [products, q, cat]);

  useEffect(() => {
    if (!open) return undefined;
    lastFocusRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = prevOverflow;
      if (lastFocusRef.current && typeof lastFocusRef.current.focus === 'function') {
        lastFocusRef.current.focus();
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const excludeSet = new Set(excludeSkus);

  const onBackdropMouseDown = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modal-backdrop-app"
      role="presentation"
      onMouseDown={onBackdropMouseDown}
    >
      <div
        className="app-card modal-card-app"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="card-head d-flex justify-content-between align-items-center">
          <h5 className="m-0">{title}</h5>
          <button
            type="button"
            className="btn btn-link p-0"
            aria-label="Close product picker"
            onClick={onClose}
          >
            <i className="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </div>
        <div className="card-body-app">
          <div className="d-flex gap-2 mb-2">
            <input
              ref={inputRef}
              id="productPickerSearch"
              name="productPickerSearch"
              className="form-control"
              placeholder="Search catalogue…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search products"
            />
          </div>
          <div className="status-filter-row mb-3">
            <button
              type="button"
              className={`btn btn-sm ${cat === '' ? 'btn-primary-app' : 'btn-outline-app'}`}
              onClick={() => setCat('')}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                type="button"
                key={c}
                className={`btn btn-sm ${cat === c ? 'btn-primary-app' : 'btn-outline-app'}`}
                onClick={() => setCat(c)}
                data-cat={c}
              >
                {c}
              </button>
            ))}
          </div>
          {filteredCatalogue.length === 0 && (
            <div className="info-callout" role="status">
              No products match those filters.
            </div>
          )}
          <div className="catalog-list" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
            {filteredCatalogue.map((p) => {
              const exists = excludeSet.has(p.sku);
              return (
                <div key={p.sku} className="catalog-item">
                  <div className="flex-grow-1">
                    <strong>{p.name}</strong>
                    <div className="small-note">
                      {p.sku} · {money(p.price)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`btn btn-sm ${exists ? 'btn-success disabled' : 'btn-primary-app'}`}
                    disabled={exists}
                    onClick={() => onPick(p)}
                    aria-label={`Add ${p.name}`}
                  >
                    {exists ? '✓ Added' : '+ Add'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}