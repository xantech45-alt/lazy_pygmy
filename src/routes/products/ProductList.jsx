import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import AppCard from '../../components/AppCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import IndexTable from '../../components/IndexTable.jsx';
import ImagePreviewThumb from '../../components/ImagePreviewThumb.jsx';
import RowActionsMenu from '../../components/RowActionsMenu.jsx';
import useIndexTable from '../../hooks/useIndexTable.js';
import { money, number, exportCsv } from '../../lib/format.js';
import { useProducts } from '../../data-access/useEntity.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * ProductList — replaces products/index.html (PPT slide 8).
 * Audit fix #27: now composes the shared useIndexTable hook + IndexTable
 * shell so search / filter / sort / pagination / bulk-select / CSV export
 * are all driven from a single source of truth.
 */
export default function ProductList() {
  const { items } = useProducts();
  const toast = useToast();

  const filterKeys = useMemo(() => [
    { key: 'category', options: (rows) => [...new Set(rows.map((p) => p.category))] },
    { key: 'warehouse', options: (rows) => [...new Set(rows.map((p) => p.warehouse))] },
    { key: 'status', options: (rows) => [...new Set(rows.map((p) => p.status))] },
    { key: 'supplier', options: (rows) => [...new Set(rows.map((p) => p.supplier))] },
  ], []);

  const t = useIndexTable({
    rows: items,
    idKey: 'sku',
    searchKeys: ['name', 'sku'],
    filterKeys,
    initialSort: { key: 'name', asc: true },
  });

  const columns = [
    { key: 'thumb', label: '', sortable: false },
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'warehouse', label: 'Warehouse', sortable: true },
    { key: 'cost', label: 'Cost', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'qty', label: 'Qty', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Products' }]} />
      <PageHeader
        title="Products"
        subtitle="245 products across 5 categories · 3 warehouses"
      >
        <button
          className="btn btn-outline-app"
          onClick={() => toast('Import prepared in this frontend prototype.')}
        >
          Import
        </button>
        <button
          className="btn btn-outline-app"
          id="exportProducts"
          onClick={() => exportCsv('lazy-pygmy-products.csv', t.rows)}
        >
          Export
        </button>
        <Link to="/products/new" className="btn btn-primary-app">
          + Add Product
        </Link>
      </PageHeader>

      {t.rows.length === 0 ? (
        <AppCard>
          <EmptyState title="No products match these filters" message="Adjust the filters or clear them to see all products." />
        </AppCard>
      ) : (
        <IndexTable
          id="productTable"
          search={{ q: t.search.q, onChange: t.search.onChange, placeholder: 'Search by name, SKU or barcode' }}
          sort={t.sort}
          filter={{ keys: filterKeys.map((f) => f.key), values: t.filter.values, set: t.filter.set, options: t.filter.options }}
          selected={t.selected}
          paged={t.paged}
          total={t.total}
          page={t.page}
          pageSize={t.pageSize}
          setPage={t.setPage}
          setPageSize={t.setPageSize}
          toggleAll={t.toggleAll}
          toggleOne={t.toggleOne}
          clearSelection={t.clearSelection}
          bulkLabel="products"
          columns={columns}
          rowId="sku"
          pagination={
            <Pagination
              page={t.page}
              pageSize={t.pageSize}
              total={t.total}
              onPageChange={t.setPage}
              onPageSizeChange={t.setPageSize}
            />
          }
          renderRow={(p) => (
            <>
              <td>
                <ImagePreviewThumb assetId={p.imageAssetId} alt={p.name} shape="product" />
              </td>
              <td className="sku"><Link to={`/products/${p.sku}`}>{p.sku}</Link></td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.warehouse}</td>
              <td className="numeric">{money(p.cost)}</td>
              <td className="numeric fw-bold">{money(p.price)}</td>
              <td className="numeric fw-bold">{number(p.qty)}</td>
              <td><StatusBadge status={p.status} /></td>
              <td>
                <RowActionsMenu
                  viewTo={`/products/${p.sku}`}
                  editTo={`/products/${p.sku}/edit`}
                  label={`Actions for ${p.name}`}
                />
              </td>
            </>
          )}
        />
      )}
    </>
  );
}
