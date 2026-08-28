import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { localStorageStore } from '../data-access/localStorageStore.js';

/**
 * GlobalSearch — mirrors app-shell.js bindSearch():
 *   - min query length 2
 *   - 4 products, 3 each of suppliers / warehouses / POs / schools / orders / employees
 *   - case-insensitive includes() on name + code/sku/order/number + location/county
 */
export default function GlobalSearch() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return null;
    const products = localStorageStore.getProducts().filter((x) => (x.name + x.sku + x.category).toLowerCase().includes(term)).slice(0, 4);
    const suppliers = localStorageStore.getSuppliers().filter((x) => (x.name + x.code + x.location).toLowerCase().includes(term)).slice(0, 3);
    const warehouses = localStorageStore.getWarehouses().filter((x) => (x.name + x.code + x.location).toLowerCase().includes(term)).slice(0, 3);
    const pos = localStorageStore.getPurchaseOrders().filter((x) => (x.po + x.supplier).toLowerCase().includes(term)).slice(0, 3);
    const schools = localStorageStore.getSchools().filter((x) => (x.name + x.code + x.county).toLowerCase().includes(term)).slice(0, 3);
    const orders = localStorageStore.getOrders().filter((x) => (x.order + x.school).toLowerCase().includes(term)).slice(0, 3);
    const employees = localStorageStore.getEmployees().filter((x) => (x.name + x.number + x.role).toLowerCase().includes(term)).slice(0, 3);
    return { products, suppliers, warehouses, pos, schools, orders, employees };
  }, [q]);

  const totalMatches = results
    ? results.products.length + results.suppliers.length + results.warehouses.length
      + results.pos.length + results.schools.length + results.orders.length + results.employees.length
    : 0;

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div ref={ref} className="position-relative top-search topbar-search">
      <i className="bi bi-search position-absolute topbar-search-icon" aria-hidden="true"></i>
      <input
        className="form-control ps-5 bg-light"
        placeholder="Search products, orders, schools…"
        aria-label="Search across products, orders, schools, suppliers, warehouses, purchase orders and employees"
        value={q}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
      />
      {open && q.trim().length >= 2 && results && (
        <div className="dropdown-menu w-100 show shadow-sm global-search-results">
          {totalMatches === 0 ? (
            <span className="dropdown-item-text text-muted">No matches</span>
          ) : (
            <SearchResults results={results} />
          )}
        </div>
      )}
    </div>
  );
}

function SearchResults({ results }) {
  const sections = [
    { key: 'products', label: 'Product', to: (x) => `/products/${x.sku}`, primary: (x) => x.sku, secondary: (x) => x.name },
    { key: 'suppliers', label: 'Supplier', to: (x) => `/suppliers/${x.code}`, primary: (x) => x.code, secondary: (x) => x.name },
    { key: 'warehouses', label: 'Warehouse', to: (x) => `/warehouses/${x.code}`, primary: (x) => x.code, secondary: (x) => x.name },
    { key: 'pos', label: 'Purchase Order', to: () => '/purchase-orders', primary: (x) => x.po, secondary: (x) => x.supplier },
    { key: 'schools', label: 'School', to: (x) => `/schools/${x.code}`, primary: (x) => x.code, secondary: (x) => x.name },
    { key: 'orders', label: 'Order', to: (x) => `/orders/${x.order}`, primary: (x) => x.order, secondary: (x) => x.school },
    { key: 'employees', label: 'Employee', to: (x) => `/employees/${x.number}`, primary: (x) => x.number, secondary: (x) => x.name },
  ];
  return (
    <>
      {sections.flatMap(({ key, label, to, primary, secondary }) =>
        results[key].map((x, i) => (
          <Link key={`${key}-${i}`} to={to(x)} className="dropdown-item">
            <small className="text-muted">{label}</small>
            <br />
            <strong>{primary(x)}</strong> {secondary(x)}
          </Link>
        ))
      )}
    </>
  );
}
