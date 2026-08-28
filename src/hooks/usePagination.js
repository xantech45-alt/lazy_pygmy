import { useMemo, useState } from 'react';

/**
 * usePagination — local state hook for paginated lists.
 *
 * Returns { page, pageSize, setPage, setPageSize, paged, total } where
 * `paged` is a memoized slice of `rows` for the current page. Defaults
 * match the shared <Pagination> component (page 0, size 10).
 */
export default function usePagination(rows, initialSize = 10) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialSize);

  const total = rows.length;
  const paged = useMemo(() => {
    const start = page * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  return { page, pageSize, setPage, setPageSize, paged, total };
}