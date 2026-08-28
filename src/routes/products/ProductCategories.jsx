import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { money, number } from '../../lib/format.js';
import { brand } from '../../lib/brand.js';

const CATEGORY_COLORS = {
  Books: brand.secondary,
  Puzzles: brand.accentTeal,
  'Alphabet Cards': brand.accentTealLight,
  'Game Cards': brand.warning,
  Copybooks: brand.secondary,
};

/**
 * ProductCategories — replaces products/categories.html (PPT slide 9).
 * Top: live-derived counts/units/value per category from product catalog.
 * Bottom: Books grid showing 8 sample products (matches HTML's count of 8 of 68).
 */
export default function ProductCategories() {
  const toast = useToast();
  const products = localStorageStore.getProducts();
  const [view, setView] = useState('Grid');

  const categoryStats = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      if (!map.has(p.category)) {
        map.set(p.category, { category: p.category, count: 0, units: 0, value: 0 });
      }
      const s = map.get(p.category);
      s.count += 1;
      s.units += p.qty;
      s.value += p.qty * p.cost;
    });
    return Array.from(map.values());
  }, [products]);

  const totalCount = categoryStats.reduce((a, b) => a + b.count, 0);
  const totalUnits = categoryStats.reduce((a, b) => a + b.units, 0);
  const totalValue = categoryStats.reduce((a, b) => a + b.value, 0);

  // Static category shapes from categories.html (Books/Puzzles/Alphabet Cards/Game Cards/Copybooks).
  // Live counts/units/value override the hard-coded figures; color + label come from HTML.
  const knownCategories = ['Books', 'Puzzles', 'Alphabet Cards', 'Game Cards', 'Copybooks'];
  const categories = knownCategories.map((name) => {
    const live = categoryStats.find((s) => s.category === name) || { count: 0, units: 0, value: 0 };
    return { name, count: live.count || getStaticCount(name), units: live.units || getStaticUnits(name), value: live.value || getStaticValue(name) };
  });

  const booksSample = products.filter((p) => p.category === 'Books').slice(0, 8);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Products', to: '/products' }, { label: 'Categories' }]} />
      <PageHeader
        title="Product Categories"
        subtitle={`${categories.length} categories · ${number(totalCount)} products · ${number(totalUnits)} units · ${money(totalValue)} inventory value`}
      >
        <button className="btn btn-outline-app" onClick={() => toast('Category manager (simulated).')}>
          Manage
        </button>
        <button className="btn btn-primary-app" onClick={() => toast('Open category create flow (simulated).')}>
          + Add Category
        </button>
      </PageHeader>

      <div className="category-grid mb-4">
        {categories.map((c) => (
          <div key={c.name} className="app-card product-mini-card">
            <div className="d-flex justify-content-between mb-3">
              <div className="icon-circle">
                <i className="bi bi-circle-fill" style={{ color: CATEGORY_COLORS[c.name] }}></i>
              </div>
              {c.name === 'Books' && (
                <span className="badge-status badge-info" style={{ minWidth: 'auto' }}>
                  Active
                </span>
              )}
            </div>
            <h5>{c.name}</h5>
            <div className="small-note">{c.count} products</div>
            <hr />
            <div className="d-flex justify-content-between">
              <span className="small-note">Units</span>
              <strong>{number(c.units)}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span className="small-note">Value</span>
              <strong>{money(c.value)}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h4 className="mb-0">Books — {categories[0]?.count || 0} products</h4>
          <div className="small-note">Showing {Math.min(8, booksSample.length)} of {categories[0]?.count || 0} · sorted by units sold</div>
        </div>
        <div className="btn-group">
          {['Grid', 'List'].map((v) => (
            <button key={v} className={`btn btn-outline-app ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="product-card-grid">
        {booksSample.map((p) => (
          <div key={p.sku} className="app-card product-mini-card">
            <div className="d-flex gap-3">
              <div className="product-placeholder">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div>
                <strong>{p.name}</strong>
                <div className="small-note">{p.sku}</div>
              </div>
            </div>
            <hr />
            <div className="d-flex justify-content-between align-items-end">
              <div>
                <div className="fs-5 fw-bold">${p.price.toFixed(2)}</div>
                <div className="small-note">{number(p.qty)} in stock</div>
              </div>
              <span className={`badge-status ${getStockClass(p)}`}>{p.status}</span>
            </div>
          </div>
        ))}
      </div>

      {view === 'List' && (
        <div className="mt-3">
          <Link to="/products" className="btn btn-outline-app">
            See all Books in the product list
          </Link>
        </div>
      )}
    </>
  );
}

function getStaticCount(name) {
  return { Books: 68, Puzzles: 42, 'Alphabet Cards': 39, 'Game Cards': 44, Copybooks: 52 }[name] || 0;
}
function getStaticUnits(name) {
  return { Books: 6240, Puzzles: 3180, 'Alphabet Cards': 2930, 'Game Cards': 2610, Copybooks: 3490 }[name] || 0;
}
function getStaticValue(name) {
  return { Books: 14820, Puzzles: 9640, 'Alphabet Cards': 6180, 'Game Cards': 6020, Copybooks: 6190 }[name] || 0;
}
function getStockClass(p) {
  if (p.status === 'In Stock') return 'badge-instock';
  if (p.status === 'Low Stock') return 'badge-low';
  return 'badge-out';
}
