import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * SchoolCreate — replaces schools/create.html (PPT slide 32).
 * Identity / Contact / Location & Scale sections + Directory Preview +
 * Credit & Terms side cards. Audit fix: removed fake defaultValues across
 * the entire form, added missing id/name/htmlFor matches on every
 * label/input/select, normalised the decorative-required pattern that
 * previously lacked semantic <label htmlFor>.
 */
export default function SchoolCreate() {
  const toast = useToast();

  const onSave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.classList.add('was-validated');
      return;
    }
    toast('School added.');
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Schools', to: '/schools' },
          { label: 'Add school' },
        ]}
      />
      <PageHeader
        title="Add School"
        subtitle="New schools start on prepayment until their first order is settled."
      >
        <Link to="/schools" className="btn btn-outline-app">Cancel</Link>
        <button form="schoolForm" className="btn btn-primary-app" type="submit">Save School</button>
      </PageHeader>

      <div className="content-grid">
        <form className="app-card" id="schoolForm" noValidate onSubmit={onSave}>
          <div className="card-body-app">
            <h3 className="card-heading mb-3">School Details</h3>
            <div className="section-kicker mb-2">Identity</div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label required" htmlFor="schoolCode">School code</label>
                <input id="schoolCode" name="schoolCode" className="form-control" placeholder="SCH-085" />
              </div>
              <div className="col-md-6">
                <label className="form-label required" htmlFor="schoolName">School name</label>
                <input id="schoolName" name="schoolName" className="form-control" placeholder="Ganta Hope Academy" />
              </div>
              <div className="col-md-6">
                <label className="form-label required" htmlFor="schoolType">School type</label>
                <select id="schoolType" name="schoolType" className="form-select" defaultValue="">
                  <option value="" disabled>Select type…</option>
                  <option>Primary</option>
                  <option>Secondary</option>
                  <option>Kindergarten</option>
                  <option>Nursery</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label required" htmlFor="customerCategory">Customer category</label>
                <select id="customerCategory" name="customerCategory" className="form-select" defaultValue="">
                  <option value="" disabled>Select category…</option>
                  <option>Private</option>
                  <option>Public</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="streetAddress">Street address</label>
                <input id="streetAddress" name="streetAddress" className="form-control" placeholder="Ganta–Sanniquellie Road, Ganta City, Nimba County" />
              </div>
            </div>
            <div className="form-section mt-3">
              <div className="section-kicker mb-2">Contact</div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="contactPerson">Contact person</label>
                  <input id="contactPerson" name="contactPerson" className="form-control" placeholder="Alphonso Doe" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="contactPosition">Position</label>
                  <input id="contactPosition" name="contactPosition" className="form-control" placeholder="Head Teacher" />
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="contactPhone">Phone</label>
                  <input id="contactPhone" name="contactPhone" className="form-control" placeholder="+231 88 512 704" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="contactEmail">Email</label>
                  <input id="contactEmail" name="contactEmail" type="email" className="form-control" placeholder="admin@gantahope.lr" />
                </div>
              </div>
            </div>
            <div className="form-section mt-3">
              <div className="section-kicker mb-2">Location & Scale</div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="district">District</label>
                  <input id="district" name="district" className="form-control" placeholder="Ganta" />
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="county">County</label>
                  <select id="county" name="county" className="form-select" defaultValue="">
                    <option value="" disabled>Select county…</option>
                    <option>Nimba</option>
                    <option>Montserrado</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="pupils">Number of pupils</label>
                  <input id="pupils" name="pupils" type="number" className="form-control" placeholder="425" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="creditLimit">Credit limit (USD)</label>
                  <input id="creditLimit" name="creditLimit" type="number" className="form-control" placeholder="1500" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="paymentTerms">Payment terms</label>
                  <select id="paymentTerms" name="paymentTerms" className="form-select" defaultValue="">
                    <option value="" disabled>Select terms…</option>
                    <option>Prepayment</option>
                    <option>Net 30</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="schoolStatus">Status</label>
                  <select id="schoolStatus" name="schoolStatus" className="form-select" defaultValue="">
                    <option value="" disabled>Select status…</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </form>

        <aside className="d-grid gap-3 align-content-start">
          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Directory Preview</h3>
            </div>
            <div className="card-body-app">
              <div className="profile-preview">
                <span className="profile-avatar">GH</span>
                <div>
                  <strong>Ganta Hope Academy</strong>
                  <div className="small-note">
                    SCH-085 · Nimba County
                  </div>
                  <span className="badge-status badge-instock mt-2">Active</span>
                </div>
              </div>
              <hr />
              <div className="kv-row"><span>Type</span><strong>Primary · Private</strong></div>
              <div className="kv-row"><span>Pupils</span><strong>425</strong></div>
              <hr />
              <strong>No order history yet</strong>
              <p className="small-note mb-0">
                Spend, balance and reorder patterns appear after the first delivered order.
              </p>
            </div>
          </div>
          <div className="app-card">
            <div className="card-head d-flex justify-content-between align-items-center">
              <h3 className="card-heading">Credit & Terms</h3>
            </div>
            <div className="card-body-app">
              <div className="kpi-value fs-3">$1,500.00</div>
              <hr />
              <div className="kv-row"><span>Payment terms</span><strong>Prepayment</strong></div>
              <div className="kv-row"><span>Current balance</span><strong>$0.00</strong></div>
              <div className="kv-row"><span>Available credit</span><strong>$1,500.00</strong></div>
              <div className="kv-row"><span>Orders placed</span><strong>0</strong></div>
              <div className="info-callout mt-3">
                Terms move to Net 30 automatically after 3 settled orders.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
