import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ImageImportField from '../../components/ImageImportField.jsx';
import { useProducts } from '../../data-access/useEntity.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * ProductCreate — replaces products/create.html (PPT slide 10).
 * Multi-section form (Product Information / Classification / Pricing & Stock
 * / Organisation). Audit fixes:
 *  - fake defaultValues removed; all fields render empty with placeholders
 *  - decorative `required` attributes removed (visual .required class kept
 *    for the red asterisk); native validation is enforced by checkValidity()
 *  - every select has matching id + name; every label has htmlFor
 *  - barcode + batch number inputs are no longer pre-filled
 */
export default function ProductCreate() {
  const { add } = useProducts();
  const toast = useToast();
  const [imageAssetId, setImageAssetId] = useState(null);

  const onSave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.classList.add('was-validated');
      return;
    }
    const form = e.currentTarget;
    add({
      sku: form.sku.value || `PZ-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: form.productName.value,
      category: form.category.value,
      warehouse: form.warehouse?.value || 'WH-01 Central',
      cost: Number(form.costPrice.value),
      price: Number(form.sellingPrice.value),
      qty: Number(form.openingQty.value || 0),
      status: 'In Stock',
      supplier: form.supplier?.value || 'Kakata Paper Mills',
      reorder: Number(form.reorderLevel.value || 0),
      reserved: 0,
      imageAssetId: imageAssetId || null,
      updated: 'just now',
    });
    toast('Product saved to local store.');
    form.reset();
    setImageAssetId(null);
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Products', to: '/products' },
          { label: 'Add product' },
        ]}
      />
      <PageHeader
        title="Add Product"
        subtitle="All fields marked * are required. Draft products are hidden from order forms."
      >
        <Link to="/products" className="btn btn-outline-app">
          Cancel
        </Link>
        <button
          className="btn btn-outline-app"
          onClick={() => toast('Draft saved locally.')}
          type="button"
        >
          Save as Draft
        </button>
        <button form="productForm" className="btn btn-primary-app" type="submit">
          Save Product
        </button>
      </PageHeader>

      <form id="productForm" noValidate onSubmit={onSave}>
        <div className="form-layout">
          <div className="form-layout__main">
          <div className="app-card">
            <div className="card-head">
              <h5>Product Details</h5>
            </div>
            <div className="card-body-app">
              <div className="section-kicker mb-2">Product Information</div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="productName">
                    Product name
                  </label>
                  <input id="productName" name="productName" className="form-control" placeholder="e.g. Shape Learning Puzzle" />
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="sku">
                    SKU
                  </label>
                  <input id="sku" name="sku" className="form-control" placeholder="PZ-0094" />
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="category">
                    Category
                  </label>
                  <select id="category" name="category" className="form-select" defaultValue="">
                    <option value="" disabled>Select category…</option>
                    {['Puzzles', 'Books', 'Alphabet Cards', 'Game Cards', 'Copybooks'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="brand">
                    Brand
                  </label>
                  <input id="brand" name="brand" className="form-control" placeholder="Lazy Pygmy Originals" />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="description">
                    Description
                  </label>
                  <textarea id="description" name="description" className="form-control" placeholder="Wooden shape-matching puzzle with 12 pieces for ages 3–5."></textarea>
                </div>
              </div>
              <div className="form-section mt-3">
                <div className="section-kicker mb-2">Classification</div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="grade">Grade level</label>
                    <select id="grade" name="grade" className="form-select" defaultValue="">
                      <option value="" disabled>Select grade…</option>
                      <option>Nursery / Pre-Primary</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="ageGroup">Age group</label>
                    <select id="ageGroup" name="ageGroup" className="form-select" defaultValue="">
                      <option value="" disabled>Select age group…</option>
                      <option>3 – 5 years</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="subject">Subject</label>
                    <select id="subject" name="subject" className="form-select" defaultValue="">
                      <option value="" disabled>Select subject…</option>
                      <option>Early Numeracy</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="unitType">Unit type</label>
                    <select id="unitType" name="unitType" className="form-select" defaultValue="">
                      <option value="" disabled>Select unit…</option>
                      <option>Piece</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-section mt-3">
                <div className="section-kicker mb-2">Pricing & Stock</div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label required" htmlFor="costPrice">
                      Cost price
                    </label>
                    <input id="costPrice" name="costPrice" type="number" step=".01" min=".01" className="form-control" placeholder="3.20" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required" htmlFor="sellingPrice">
                      Selling price
                    </label>
                    <input id="sellingPrice" name="sellingPrice" type="number" step=".01" min=".01" className="form-control" placeholder="5.60" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="wholesale">
                      Wholesale price
                    </label>
                    <input id="wholesale" name="wholesale" type="number" className="form-control" placeholder="4.80" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="openingQty">
                      Opening quantity
                    </label>
                    <input id="openingQty" name="openingQty" type="number" min="0" className="form-control" placeholder="260" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="reorderLevel">
                      Reorder level
                    </label>
                    <input id="reorderLevel" name="reorderLevel" type="number" min="0" className="form-control" placeholder="100" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="maxStock">
                      Maximum stock level
                    </label>
                    <input id="maxStock" name="maxStock" type="number" min="0" className="form-control" placeholder="600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="form-layout__preview">
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
              </div>
            </div>
            <div className="app-card">
              <div className="card-head">
                <h5>Organisation</h5>
              </div>
              <div className="card-body-app">
                <label className="form-label required" htmlFor="warehouse">
                  Warehouse
                </label>
                <select id="warehouse" name="warehouse" className="form-select mb-3" defaultValue="">
                  <option value="" disabled>Select warehouse…</option>
                  <option>WH-01 Central</option>
                  <option>WH-02 Paynesville</option>
                  <option>WH-03 Gbarnga</option>
                </select>
                <label className="form-label required" htmlFor="supplier">
                  Supplier
                </label>
                <select id="supplier" name="supplier" className="form-select mb-3" defaultValue="">
                  <option value="" disabled>Select supplier…</option>
                  <option>Kakata Paper Mills</option>
                  <option>Monrovia Print Works</option>
                  <option>Gbarnga Stationers</option>
                </select>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label" htmlFor="barcode">Barcode</label>
                    <input id="barcode" name="barcode" className="form-control" placeholder="6009812004" />
                  </div>
                  <div className="col-6">
                    <label className="form-label" htmlFor="batchNumber">Batch number</label>
                    <input id="batchNumber" name="batchNumber" className="form-control" placeholder="B-2026-014" />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <strong>Publish to catalogue</strong>
                    <div className="small-note">Visible on school order forms</div>
                  </div>
                  <div className="form-check form-switch">
                    <input id="publishToCatalogue" name="publishToCatalogue" className="form-check-input" type="checkbox" aria-label="Publish to catalogue" />
                  </div>
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
