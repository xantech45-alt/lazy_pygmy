import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { useSuppliers } from '../../data-access/useEntity.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * SupplierCreate — replaces suppliers/create.html (PPT slide 26).
 * Identity / Address / Contact / Commercial sections + scope tags sidebar.
 * Audit fix: removed fake defaultValues, added missing id/name/htmlFor
 * matches across every label/input/select.
 */
export default function SupplierCreate() {
  const { add } = useSuppliers();
  const toast = useToast();

  const onSave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.classList.add('was-validated');
      return;
    }
    const form = e.currentTarget;
    add({
      code: `SUP-${String(Math.floor(Math.random() * 900) + 100)}`,
      name: form.supplierName.value,
      location: `${form.supplierCity.value}, ${form.supplierCounty.value}`,
      contact: form.contactName.value,
      terms: form.paymentTerms.value,
      products: 0,
      purchases: 0,
      outstanding: 0,
      rating: 0,
      status: 'Active',
    });
    toast('Supplier added.');
    form.reset();
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Suppliers', to: '/suppliers' },
          { label: 'Add supplier' },
        ]}
      />
      <PageHeader
        title="Add Supplier"
        subtitle="New suppliers default to Active. Add a minimum order and lead-time to enable auto-PO suggestions."
      >
        <Link to="/suppliers" className="btn btn-outline-app">Cancel</Link>
        <button form="supplierForm" className="btn btn-primary-app" type="submit">
          Save Supplier
        </button>
      </PageHeader>

      <form id="supplierForm" noValidate onSubmit={onSave}>
        <div className="content-grid">
          <div className="app-card">
            <div className="card-head">
              <h5>Supplier Details</h5>
            </div>
            <div className="card-body-app">
              <div className="section-kicker">Identity</div>
              <div className="row g-3 mb-3">
                <div className="col-md-8">
                  <label className="form-label required" htmlFor="supplierName">Registered name</label>
                  <input id="supplierName" name="supplierName" className="form-control" placeholder="Monrovia Educational Print" />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="supplierTaxId">Tax ID</label>
                  <input id="supplierTaxId" name="supplierTaxId" className="form-control" placeholder="LR-TIN-220184" />
                </div>
              </div>
              <div className="section-kicker">Address</div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="supplierCity">City / town</label>
                  <input id="supplierCity" name="supplierCity" className="form-control" placeholder="Monrovia" />
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="supplierCounty">County</label>
                  <input id="supplierCounty" name="supplierCounty" className="form-control" placeholder="Montserrado" />
                </div>
              </div>
              <div className="section-kicker">Contact</div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="contactName">Primary contact</label>
                  <input id="contactName" name="contactName" className="form-control" placeholder="Mary Toe" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="contactPhone">Phone</label>
                  <input id="contactPhone" name="contactPhone" className="form-control" placeholder="+231 88 660 142" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="contactEmail">Email</label>
                  <input id="contactEmail" name="contactEmail" type="email" className="form-control" placeholder="mary@mepprint.lr" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="preferredChannel">Preferred channel</label>
                  <select id="preferredChannel" name="preferredChannel" className="form-select" defaultValue="">
                    <option value="" disabled>Select channel…</option>
                    <option>Email</option>
                    <option>Phone</option>
                    <option>WhatsApp</option>
                  </select>
                </div>
              </div>
              <div className="section-kicker">Commercial</div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="paymentTerms">Payment terms</label>
                  <select id="paymentTerms" name="paymentTerms" className="form-select" defaultValue="">
                    <option value="" disabled>Select terms…</option>
                    <option>Net 15</option>
                    <option>Net 30</option>
                    <option>Net 45</option>
                    <option>Prepaid</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="minimumOrder">Minimum order (USD)</label>
                  <input id="minimumOrder" name="minimumOrder" type="number" className="form-control" placeholder="500.00" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="leadTime">Lead time (days)</label>
                  <input id="leadTime" name="leadTime" type="number" className="form-control" placeholder="14" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="supplierStatus">Status</label>
                  <select id="supplierStatus" name="supplierStatus" className="form-select" defaultValue="">
                    <option value="" disabled>Select status…</option>
                    <option>Active</option>
                    <option>Under Review</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="app-card mb-3">
              <div className="card-head">
                <h5>Categories Supplied</h5>
              </div>
              <div className="card-body-app">
                <div className="d-flex flex-wrap gap-2">
                  {['Books', 'Puzzles', 'Copybooks', 'Game Cards'].map((c) => (
                    <span key={c} className="badge-status badge-info">{c}</span>
                  ))}
                  <span className="badge-status badge-draft">Alphabet Cards</span>
                </div>
                <div className="small-note mt-3">
                  Tagged categories influence auto-suggest when the system flags low stock. Add or remove at any time.
                </div>
              </div>
            </div>
            <div className="app-card">
              <div className="card-head">
                <h5>Compliance</h5>
              </div>
              <div className="card-body-app">
                <Row label="Business registration" value="Verified" />
                <Row label="Tax clearance" value="Valid until 30 Jun 2026" />
                <Row label="Bank account" value="Ecobank · verified" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="d-flex justify-content-between">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
