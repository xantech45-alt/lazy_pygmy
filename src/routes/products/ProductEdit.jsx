import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ImageImportField from '../../components/ImageImportField.jsx';
import ImagePreviewThumb from '../../components/ImagePreviewThumb.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * ProductEdit — replaces products/edit.html (PPT slide 12).
 * Pre-fills form fields from local product record. Save persists patch.
 * "modified-field" badge shows changed fields; unsaved-changes banner appears
 * on any input change.
 */
export default function ProductEdit() {
  const { sku } = useParams();
  const product = localStorageStore.getProducts().find((p) => p.sku === sku);
  const toast = useToast();
  const [modified, setModified] = useState({});
  const [original, setOriginal] = useState({});
  const [imageAssetId, setImageAssetId] = useState(product?.imageAssetId || null);

  useEffect(() => {
    if (product) setOriginal(product);
  }, [product]);

  if (!product) {
    return (
      <>
        <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Products', to: '/products' }, { label: 'Not found' }]} />
        <PageHeader title="Product not found" subtitle={sku}>
          <Link to="/products" className="btn btn-outline-app">
            Back
          </Link>
        </PageHeader>
      </>
    );
  }

  const track = (field) => (e) => {
    const v = e.target.value;
    setModified((m) => ({ ...m, [field]: v !== String(original[field] ?? '') }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const patch = {
      name: form.editName.value,
      category: form.category?.value,
      cost: Number(form.cost?.value),
      price: Number(form.editPrice?.value),
      reorder: Number(form.editReorder?.value),
      warehouse: form.warehouse?.value,
      supplier: form.supplier?.value,
      status: form.status?.value,
    };
    const next = localStorageStore.getProducts().map((p) => (p.sku === sku ? { ...p, ...patch, imageAssetId } : p));
    localStorageStore.saveProducts(next);
    setOriginal({ ...original, ...patch });
    setModified({});
    toast(`${sku} saved.`);
  };

  const changedCount = Object.values(modified).filter(Boolean).length;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Products', to: '/products' },
          { label: product.name, to: `/products/${sku}` },
          { label: 'Edit' },
        ]}
      />
      <PageHeader
        title="Edit Product"
        subtitle={`${product.sku} · ${product.name}`}
      >
        <Link to={`/products/${sku}`} className="btn btn-outline-app">
          Cancel
        </Link>
        <button form="editProductForm" className="btn btn-primary-app" type="submit">
          Save Changes
        </button>
      </PageHeader>

      {changedCount > 0 && (
        <div className="unsaved-banner mb-3 d-flex justify-content-between">
          <strong>
            <i className="bi bi-exclamation-circle me-2"></i>
            Unsaved changes — {changedCount} field{changedCount === 1 ? '' : 's'} modified
          </strong>
          <div>
            <button className="btn btn-sm btn-link" onClick={() => setModified({})}>
              Discard
            </button>
            <button className="btn btn-sm btn-warning">Review diff</button>
          </div>
        </div>
      )}

      <form id="editProductForm" onSubmit={onSubmit}>
        <div className="content-grid">
          <div className="app-card">
            <div className="card-head">
              <h5>Product Details</h5>
            </div>
            <div className="card-body-app">
              <div className="section-kicker mb-2">Product Information</div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="editName">Product name</label>
                  <input id="editName" name="editName" className={`form-control ${modified.name ? 'modified-field' : ''}`} defaultValue={product.name} onChange={track('name')} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="editSku">SKU</label>
                  <input id="editSku" name="editSku" className="form-control" defaultValue={product.sku} disabled title="SKU is the product identifier and cannot be changed after creation" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="editCategory">Category</label>
                  <select id="editCategory" name="category" className={`form-select ${modified.category ? 'modified-field' : ''}`} defaultValue={product.category} onChange={track('category')}>
                    {['Books', 'Puzzles', 'Alphabet Cards', 'Game Cards', 'Copybooks'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="editBrand">Brand</label>
                  <input id="editBrand" name="editBrand" className="form-control" defaultValue="Lazy Pygmy Originals" />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="editDescription">Description</label>
                  <textarea id="editDescription" name="editDescription" className="form-control" defaultValue={`Beginner alphabet reader with 32 illustrated pages. ${product.category} line.`}></textarea>
                </div>
              </div>
              <div className="form-section mt-3">
                <div className="section-kicker mb-2">Pricing & Stock</div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="cost">Cost price</label>
                    <input id="cost" name="cost" type="number" step=".01" className="form-control" defaultValue={product.cost} onChange={track('cost')} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="editPrice">Selling price</label>
                    <input id="editPrice" name="editPrice" type="number" step=".01" className={`form-control ${modified.price ? 'modified-field' : ''}`} defaultValue={product.price} onChange={track('price')} />
                    {modified.price && <div className="modified-note">Previously ${original.price?.toFixed(2)}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="wholesaleEdit">Wholesale price</label>
                    <input id="wholesaleEdit" type="number" step=".01" className="form-control" defaultValue={(product.cost + (product.price - product.cost) * 0.6).toFixed(2)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="editReorder">Reorder level</label>
                    <input id="editReorder" name="editReorder" type="number" min="0" className={`form-control ${modified.reorder ? 'modified-field' : ''}`} defaultValue={product.reorder} onChange={track('reorder')} />
                    {modified.reorder && <div className="modified-note">Previously {original.reorder}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="app-card mb-3">
              <div className="card-head">
                <h5>Product Image</h5>
              </div>
              <div className="card-body-app">
                <ImageImportField
                  kind="product"
                  currentAssetId={imageAssetId}
                  onCommit={setImageAssetId}
                  onRemove={() => setImageAssetId(null)}
                  label="Product photo"
                  helpText="PNG or JPG · stored in this browser · max 5 MB · 1600 px long edge"
                  shape="square"
                />
                {imageAssetId && (
                  <div className="d-flex align-items-center gap-2 mt-3 small-note">
                    <ImagePreviewThumb assetId={imageAssetId} alt="Current product image" shape="product" />
                    <span>This image will be saved when you click Save Changes.</span>
                  </div>
                )}
              </div>
            </div>
            <div className="app-card">
              <div className="card-head">
                <h5>Organisation</h5>
              </div>
              <div className="card-body-app">
                <label className="form-label" htmlFor="editWarehouse">Warehouse</label>
                <select id="editWarehouse" name="warehouse" className="form-select mb-3" defaultValue={product.warehouse}>
                  <option>WH-01 Central Warehouse</option>
                  <option>WH-02 Paynesville</option>
                  <option>WH-03 Gbarnga</option>
                </select>
                <label className="form-label" htmlFor="editSupplier">Supplier</label>
                <select id="editSupplier" name="supplier" className="form-select mb-3" defaultValue={product.supplier}>
                  <option>SUP-007 Kakata Paper Mills</option>
                  <option>SUP-003 Monrovia Print Works</option>
                  <option>SUP-011 Gbarnga Stationers</option>
                </select>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label" htmlFor="editMaxStock">Max stock</label>
                    <input id="editMaxStock" name="editMaxStock" className="form-control" defaultValue="2,000" />
                  </div>
                  <div className="col-6">
                    <label className="form-label" htmlFor="editStatus">Status</label>
                    <select id="editStatus" name="status" className="form-select" defaultValue={product.status}>
                      <option>In Stock</option>
                      <option>Low Stock</option>
                      <option>Out of Stock</option>
                      <option>Discontinued</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
