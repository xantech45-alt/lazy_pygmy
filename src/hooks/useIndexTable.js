import { useMemo, useState } from 'react';
import usePagination from './usePagination.js';

/**
 * useIndexTable — shared header logic for the 8 entity list pages.
 *
 * Audit fix #27: ProductList had the only fully-featured index page
 * (search + filters + sort + pagination + bulk-select + CSV export).
 * The other 7 lists had partial or no equivalents. This hook lifts the
 * common header logic out so every index page can compose it without
 * re-implementing it.
 *
 * Caller-provided:
 *   rows       — full dataset (already loaded from localStorageStore)
 *   searchKeys — string[] of fields to match against (case-insensitive
 *                includes)
 *   filterKeys — array of { key, options } | { key, options: fn(rows) }
 *   idKey      — string field used as the row identity (default 'id')
 *   initialSort — { key, asc } (default { key: 'name', asc: true })
 *
 * Returned:
 *   rows      — filtered and sorted full result set
 *   paged     — current page slice
 *   page, pageSize, total, setPage, setPageSize
 *   selected, setSelected, toggleAll, toggleOne, clearSelection
 *   search    — { q, onChange }
 *   sort      — { key, asc, onSort(k) }
 *   filter    — { values, set(key, value), options(key) }
 *   reset     — reset all filters and pagination to 0
 */
export default function useIndexTable({
  rows,
  searchKeys = [],
  filterKeys = [],
  idKey = 'id',
  initialSort = { key: 'name', asc: true },
  initialPageSize = 10,
}) {
  const [q, setQ] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [sortKey, setSortKey] = useState(initialSort.key);
  const [asc, setAsc] = useState(initialSort.asc);
  const [selected, setSelected] = useState(new Set());

  const filterOptions = useMemo(() => {
    const m = {};
    filterKeys.forEach(({ key, options }) => {
      m[key] = typeof options === 'function' ? options(rows) : options || [];
    });
    return m;
  }, [rows, filterKeys]);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    const f = rows.filter((row) => {
      if (term) {
        const hit = searchKeys.some((k) => String(row[k] || '').toLowerCase().includes(term));
        if (!hit) return false;
      }
      for (const { key } of filterKeys) {
        const v = filterValues[key];
        if (v && row[key] !== v) return false;
      }
      return true;
    });
    f.sort((a, b) => {
      let A = a[sortKey];
      let B = b[sortKey];
      if (typeof A === 'string') { A = A.toLowerCase(); B = B.toLowerCase(); }
      if (A == null) return 1;
      if (B == null) return -1;
      return (A > B ? 1 : A < B ? -1 : 0) * (asc ? 1 : -1);
    });
    return f;
  }, [rows, q, searchKeys, filterKeys, filterValues, sortKey, asc]);

  const { page, pageSize, setPage, setPageSize, paged, total } = usePagination(filtered, initialPageSize);

  const onSort = (k) => {
    if (sortKey === k) setAsc(!asc);
    else { setSortKey(k); setAsc(true); }
  };

  const setFilter = (key, value) => {
    setFilterValues((v) => ({ ...v, [key]: value }));
    setPage(0);
  };

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map((r) => r[idKey])));
  };

  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const clearSelection = () => setSelected(new Set());

  const setSearch = (value) => {
    setQ(value);
    setPage(0);
  };

  const reset = () => {
    setQ('');
    setFilterValues({});
    setSortKey(initialSort.key);
    setAsc(initialSort.asc);
    setSelected(new Set());
    setPage(0);
  };

  return {
    rows: filtered,
    paged,
    page,
    pageSize,
    total,
    setPage,
    setPageSize: (n) => { setPageSize(n); setPage(0); },
    selected,
    setSelected,
    toggleAll,
    toggleOne,
    clearSelection,
    search: { q, onChange: setSearch },
    sort: { key: sortKey, asc, onSort },
    filter: { values: filterValues, set: setFilter, options: filterOptions },
    reset,
  };
}
