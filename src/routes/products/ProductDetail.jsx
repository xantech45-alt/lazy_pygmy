import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ImagePreviewThumb from '../../components/ImagePreviewThumb.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { money } from '../../lib/format.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { brand } from '../../lib/brand.js';

/**
 * ProductDetail — replaces products/detail.html (PPT slide 11).
 * Tabs: Overview (active), History, Sales, POs. Overview shows product
 * information, pricing tiles, sales performance metrics, inventory side panel,
 * and warehouse & supplier details.
 * Delete modal confirms and removes from local store.
 */
export default function ProductDetail() {
  const { sku } = useParams();
  const product = localStorageStore.getProducts().find((p) => p.sku === sku);
  const navigate = useNavigate();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!product) {
    return (
      <>
        <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Products', to: '/products' }, { label: 'Not found' }]} />
        <PageHeader title="Product not found" subtitle={`No product with SKU ${sku}`}>
          <Link to="/products" className="btn btn-outline-app">
            Back to products
          </Link>
        </PageHeader>
        <div className="app-card">
          <div className="card-body-app">
            <p className="text-muted-app mb-0">Try the product list — the SKU may not exist in this catalogue.</p>
          </div>
        </div>
      </>
    );
  }

  const wholesale = +(product.cost + (product.price - product.cost) * 0.6).toFixed(2);
  const margin = ((product.price - product.cost) / product.price) * 100;
  const maxStock = 2000;
  const stockPct = Math.min(100, Math.round((product.qty / maxStock) * 100));
  const available = Math.max(0, product.qty - product.reserved);

  const onDelete = () => {
    localStorageStore.saveProducts(localStorageStore.getProducts().filter((p) => p.sku !== sku));
    toast(`${product.sku} deleted from local store.`);
    navigate('/products');
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Products', to: '/products' },
          { label: product.name },
        ]}
      />
      <PageHeader
        title={
          <>
            {product.name} <span className={`badge-status ${badgeClassFor(product.status)} ms-2`}>{product.status}</span>
          </>
        }
        subtitle={`${product.sku} · ${product.category} · updated ${product.updated}`}
      >
        <button className="btn btn-danger-app" data-bs-toggle="modal" data-bs-target="#deleteModal">
          Delete
        </button>
        <button className="btn btn-outline-app" onClick={() => toast(`${product.sku} duplicated (simulated).`)}>
          Duplicate
        </button>
        <Link to={`/products/${sku}/edit`} className="btn btn-primary-app">
          Edit Product
        </Link>
      </PageHeader>

      <ul className="nav tabs-app mb-3">
        <li className="nav-item">
          <span className="nav-link active">Overview</span>
        </li>
        <li>
          <Link className="nav-link" to={`/products/${sku}/history`}>
            Inventory History
          </Link>
        </li>
        <li>
          <span className="nav-link" aria-disabled="true" title="Coming soon">Sales</span>
        </li>
        <li>
          <span className="nav-link" aria-disabled="true" title="Coming soon">Purchase Orders</span>
        </li>
      </ul>

      <div className="content-grid">
        <div>
          <div className="app-card mb-3 product-info-card">
            <div className="card-head">
              <h5>Product Information</h5>
            </div>
            <div className="card-body-app">
              <div className="row g-3">
                <div className="col-12 col-md-4 product-info-card__image-col">
                  <div className="product-image-wrap mx-auto">
                    <ImagePreviewThumb
                      assetId={product.imageAssetId}
                      alt={product.name}
                      shape="square"
                      width={220}
                      height={220}
                    />
                    <div className="small-note text-center mt-2">{product.sku}</div>
                  </div>
                </div>
                <div className="col-12 col-md-8">
                  <ul className="list-unstyled product-info-card__fields mb-0">
                    <li className="product-info-card__field">
                      <span className="small-note">Category</span>
                      <strong>{product.category}</strong>
                    </li>
                    <li className="product-info-card__field">
                      <span className="small-note">Barcode</span>
                      <strong>6009811042</strong>
                    </li>
                    <li className="product-info-card__field">
                      <span className="small-note">Brand</span>
                      <strong>Lazy Pygmy Originals</strong>
                    </li>
                    <li className="product-info-card__field">
                      <span className="small-note">Batch number</span>
                      <strong>B-2025-072</strong>
                    </li>
                    <li className="product-info-card__field">
                      <span className="small-note">Grade level</span>
                      <strong>Nursery</strong>
                    </li>
                    <li className="product-info-card__field">
                      <span className="small-note">Date added</span>
                      <strong>12 Mar 2025</strong>
                    </li>
                    <li className="product-info-card__field">
                      <span className="small-note">Age group</span>
                      <strong>3 – 5 years</strong>
                    </li>
                    <li className="product-info-card__field">
                      <span className="small-note">Status</span>
                      <strong className="text-success">{product.status}</strong>
                    </li>
                  </ul>
                </div>
              </div>
              <p className="small-note mt-3 mb-0">Beginner alphabet reader with 32 illustrated pages.</p>
            </div>
          </div>

          <div className="app-card mb-3">
            <div className="card-head">
              <h5>Pricing</h5>
            </div>
            <div className="card-body-app">
              <div className="row g-2">
                <Tile label="Cost price" value={money(product.cost)} />
                <Tile label="Selling price" value={money(product.price)} />
                <Tile label="Wholesale" value={money(wholesale)} />
                <Tile label="Gross margin" value={`${margin.toFixed(1)}%`} />
              </div>
            </div>
          </div>

          <div className="app-card">
            <div className="card-head d-flex justify-content-between">
              <h5>Sales Performance</h5>
              <Link to="/reports">View report</Link>
            </div>
            <div className="card-body-app">
              <div className="row g-2">
                <Tile label="Units sold (Jan)" value="1,240" trend="+18% vs Dec" />
                <Tile label="Revenue (Jan)" value="$4,340" />
                <Tile label="Orders" value="42" subnote="across 31 schools" />
                <Tile label="Avg per order" value="30" subnote="pieces" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="app-card mb-3">
            <div className="card-head">
              <h5>Inventory</h5>
            </div>
            <div className="card-body-app">
              <div className="kpi-value">{product.qty.toLocaleString()}</div>
              <div className="small-note">units on hand at {product.warehouse.replace(/^WH-.*? /, '')}</div>
              <div className="progress my-3" style={{ height: 8 }}>
                <div className="progress-bar" style={{ width: `${stockPct}%`, background: brand.secondary }}></div>
              </div>
              <div className="small-note mb-3">{stockPct}% of 2,000 maximum stock level</div>
              <Row label="Reserved for orders" value={product.reserved.toString()} />
              <Row label="Available to sell" value={available.toLocaleString()} strong success />
              <Row label="Reorder level" value={product.reorder.toString()} />
              <Row label="Incoming" value="400" primary />
            </div>
          </div>

          <div className="app-card">
            <div className="card-head">
              <h5>Warehouse & Supplier</h5>
            </div>
            <div className="card-body-app">
              <strong>{product.warehouse}</strong>
              <div className="small-note mb-3">Bushrod Island, Monrovia, Montserrado</div>
              <hr />
              <strong>{product.supplier}</strong>
              <div className="small-note">SUP-007 · Margibi County</div>
              <div className="d-flex justify-content-between mt-3">
                <span>Payment terms</span>
                <strong>Net 30</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Average lead time</span>
                <strong>12 days</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Delivery reliability</span>
                <strong className="text-success">94%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="deleteModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h5 className="modal-title">Delete this product?</h5>
                <div className="small-note">
                  {product.sku} · {product.name}
                </div>
              </div>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <p>This permanently removes the product from the local prototype catalogue. It cannot be undone.</p>
              <div className="section-kicker mb-2">Before you delete</div>
              <ul>
                <li>{product.qty.toLocaleString()} units on hand at {product.warehouse} will be written off</li>
                <li>{product.reserved} units are reserved on open orders</li>
                <li>Set the status to Discontinued instead to keep history.</li>
              </ul>
              <label className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                />
                I understand this product may be on open orders
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-app" data-bs-dismiss="modal">
                Cancel
              </button>
              <button className="btn btn-danger" disabled={!confirmDelete} onClick={onDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Tile({ label, value, trend, subnote }) {
  return (
    <div className="col-md-3">
      <div className="metric-tile">
        <div className="small-note">{label}</div>
        <div className="fs-4 fw-bold">{value}</div>
        {trend && <div className="kpi-trend">{trend}</div>}
        {subnote && <div className="small-note">{subnote}</div>}
      </div>
    </div>
  );
}

function Row({ label, value, strong, success, primary }) {
  return (
    <div className="d-flex justify-content-between py-2">
      <span>{label}</span>
      <strong className={strong ? '' : success ? 'text-success' : primary ? 'text-primary' : ''}>{value}</strong>
    </div>
  );
}

function badgeClassFor(status) {
  if (status === 'In Stock') return 'badge-instock';
  if (status === 'Low Stock') return 'badge-low';
  return 'badge-out';
}
