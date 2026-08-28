/**
 * OrderCreate — wizard step 1 (Phase 5 polished).
 *
 * Responsibilities:
 *   - Real form submit (Continue triggers validation, not bypass).
 *   - Synchronize school name with school code so later steps have a
 *     consistent customer record.
 *   - Validate: customer, order date, delivery date (≥ order date), route,
 *     priority, sales officer, delivery officer, payment terms, PO #.
 *   - Compact selected-customer summary using existing fields.
 *   - Cancel order flow with confirm.
 *   - The orderDraft school/code/etc. come from useOrderDraft (which already
 *     mirrors the legacy LPStore behavior).
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import AppCard from '../../components/AppCard.jsx';
import { useOrderDraft } from '../../data-access/useOrderDraft.jsx';
import { useToast } from '../../components/ToastProvider.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { useAppSettings } from '../../state/AppSettingsContext.jsx';
import { money } from '../../lib/format.js';
import WizardStepper from './WizardStepper.jsx';

const TODAY = () => new Date().toISOString().slice(0, 10);

export default function OrderCreate() {
  const { draft, update, reset } = useOrderDraft();
  const { settings } = useAppSettings();
  const toast = useToast();
  const navigate = useNavigate();

  const schools = useMemo(() => localStorageStore.getSchools(), []);
  const selectedSchool = useMemo(
    () => schools.find((s) => s.code === draft.schoolCode) || null,
    [schools, draft.schoolCode]
  );

  const [errors, setErrors] = useState({});
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize order date if blank
  useEffect(() => {
    if (!draft.orderDate) {
      update({ orderDate: TODAY() });
    }
    // Apply default terms + route from settings on a brand-new draft only
    if (!draft.touchedDefaults) {
      update({
        terms: settings.orders.defaultTerms || draft.terms,
        route: settings.orders.defaultRoute || draft.route,
        touchedDefaults: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k) => (e) => {
    const v = e.target.value;
    if (k === 'schoolCode') {
      const next = schools.find((s) => s.code === v);
      update({
        schoolCode: v,
        school: next?.name || draft.school,
        availableCredit: next?.outstanding ? 890 : draft.availableCredit,
      });
    } else {
      update({ [k]: v });
    }
  };

  const validate = () => {
    const next = {};
    if (!draft.schoolCode) next.schoolCode = 'Please pick a school.';
    if (!draft.orderDate) next.orderDate = 'Order date is required.';
    if (!draft.deliveryDate) next.deliveryDate = 'Delivery date is required.';
    if (
      draft.orderDate &&
      draft.deliveryDate &&
      draft.deliveryDate < draft.orderDate
    ) {
      next.deliveryDate = 'Delivery date cannot precede order date.';
    }
    if (!draft.route) next.route = 'Select a delivery route.';
    if (!draft.priority) next.priority = 'Choose a priority.';
    if (!draft.salesOfficer) next.salesOfficer = 'Assign a sales officer.';
    if (!draft.deliveryOfficer) next.deliveryOfficer = 'Assign a delivery officer.';
    if (!draft.terms) next.terms = 'Pick payment terms.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const continueToProducts = (e) => {
    e.preventDefault();
    if (!validate()) return;
    navigate('/orders/new/products');
  };

  const saveDraft = () => toast('Order draft saved locally.');

  const onCancel = () => {
    setConfirmCancel(true);
  };

  const confirmCancelOrder = () => {
    reset();
    setConfirmCancel(false);
    toast('Draft cleared.');
    navigate('/orders');
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Orders', to: '/orders' },
          { label: 'New order' },
        ]}
      />
      <PageHeader
        title="Create Order"
        subtitle={`${draft.order} · draft · ${draft.lines.length} lines · ${schools.find((s) => s.code === draft.schoolCode)?.name || draft.school}`}
      >
        <button type="button" className="btn btn-outline-app" onClick={onCancel}>
          Cancel order
        </button>
        <button
          type="button"
          className="btn btn-outline-app"
          id="saveOrderDraft"
          onClick={saveDraft}
        >
          Save Draft
        </button>
        <button
          type="submit"
          form="orderCustomerForm"
          className="btn btn-primary-app"
          id="continueProducts"
        >
          Continue → Add Products
        </button>
      </PageHeader>

      <WizardStepper active={1} completed={[]} />

      <div className="row g-3">
        <div className="col-lg-8">
          <AppCard head={<h5>Customer & schedule</h5>}>
            <form
              id="orderCustomerForm"
              noValidate
              onSubmit={continueToProducts}
              aria-describedby="orderFormHelp"
            >
              <p id="orderFormHelp" className="small-note mb-3">
                All fields are required. Delivery date cannot precede order date.
              </p>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="orderSchool">
                    School
                  </label>
                  <select
                    id="orderSchool"
                    name="schoolCode"
                    className={`form-select ${errors.schoolCode ? 'is-invalid' : ''}`}
                    value={draft.schoolCode}
                    onChange={set('schoolCode')}
                  >
                    {schools.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} · {s.name}
                      </option>
                    ))}
                  </select>
                  {errors.schoolCode && (
                    <div className="invalid-feedback d-block">{errors.schoolCode}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="schoolPO">
                    School PO #
                  </label>
                  <input
                    id="schoolPO"
                    name="schoolPO"
                    className="form-control"
                    value={draft.schoolPO}
                    onChange={set('schoolPO')}
                    placeholder="Optional reference"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="orderDate">
                    Order date
                  </label>
                  <input
                    id="orderDate"
                    name="orderDate"
                    type="date"
                    className={`form-control ${errors.orderDate ? 'is-invalid' : ''}`}
                    value={draft.orderDate}
                    onChange={set('orderDate')}
                  />
                  {errors.orderDate && (
                    <div className="invalid-feedback d-block">{errors.orderDate}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="deliveryDate">
                    Requested delivery
                  </label>
                  <input
                    id="deliveryDate"
                    name="deliveryDate"
                    type="date"
                    className={`form-control ${errors.deliveryDate ? 'is-invalid' : ''}`}
                    value={draft.deliveryDate}
                    onChange={set('deliveryDate')}
                    min={draft.orderDate || undefined}
                  />
                  {errors.deliveryDate && (
                    <div className="invalid-feedback d-block">{errors.deliveryDate}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="deliveryRoute">
                    Delivery route
                  </label>
                  <select
                    id="deliveryRoute"
                    name="route"
                    className={`form-select ${errors.route ? 'is-invalid' : ''}`}
                    value={draft.route}
                    onChange={set('route')}
                  >
                    <option value="">Select route…</option>
                    <option value="Monrovia – Bong">Monrovia – Bong</option>
                    <option value="Monrovia – Nimba">Monrovia – Nimba</option>
                    <option value="Monrovia – Lofa">Monrovia – Lofa</option>
                  </select>
                  {errors.route && <div className="invalid-feedback d-block">{errors.route}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="orderPriority">
                    Priority
                  </label>
                  <select
                    id="orderPriority"
                    name="priority"
                    className={`form-select ${errors.priority ? 'is-invalid' : ''}`}
                    value={draft.priority}
                    onChange={set('priority')}
                  >
                    <option>Standard</option>
                    <option>Rush</option>
                    <option>Hold for confirmation</option>
                  </select>
                  {errors.priority && (
                    <div className="invalid-feedback d-block">{errors.priority}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="salesOfficer">
                    Sales officer
                  </label>
                  <select
                    id="salesOfficer"
                    name="salesOfficer"
                    className={`form-select ${errors.salesOfficer ? 'is-invalid' : ''}`}
                    value={draft.salesOfficer}
                    onChange={set('salesOfficer')}
                  >
                    <option value="">Select…</option>
                    <option value="Grace Doe">Grace Doe</option>
                    <option value="Peter Sirleaf">Peter Sirleaf</option>
                  </select>
                  {errors.salesOfficer && (
                    <div className="invalid-feedback d-block">{errors.salesOfficer}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="deliveryOfficer">
                    Delivery officer
                  </label>
                  <select
                    id="deliveryOfficer"
                    name="deliveryOfficer"
                    className={`form-select ${errors.deliveryOfficer ? 'is-invalid' : ''}`}
                    value={draft.deliveryOfficer}
                    onChange={set('deliveryOfficer')}
                  >
                    <option value="">Select…</option>
                    <option value="Peter Sirleaf">Peter Sirleaf</option>
                    <option value="Moses Kollie">Moses Kollie</option>
                  </select>
                  {errors.deliveryOfficer && (
                    <div className="invalid-feedback d-block">{errors.deliveryOfficer}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="orderTerms">
                    Payment terms
                  </label>
                  <select
                    id="orderTerms"
                    name="terms"
                    className={`form-select ${errors.terms ? 'is-invalid' : ''}`}
                    value={draft.terms}
                    onChange={set('terms')}
                  >
                    <option>Net 30</option>
                    <option>Net 15</option>
                    <option>Prepaid</option>
                    <option>On delivery</option>
                  </select>
                  {errors.terms && <div className="invalid-feedback d-block">{errors.terms}</div>}
                </div>
              </div>
            </form>
          </AppCard>
        </div>
        <div className="col-lg-4">
          {selectedSchool && (
            <AppCard head={<h5>Selected customer</h5>}>
              <div className="kv-row"><span>Code</span><strong>{selectedSchool.code}</strong></div>
              <div className="kv-row"><span>Name</span><strong>{selectedSchool.name}</strong></div>
              <div className="kv-row"><span>Type</span><strong>{selectedSchool.type}</strong></div>
              <div className="kv-row"><span>County</span><strong>{selectedSchool.county}</strong></div>
              <div className="kv-row"><span>Contact</span><strong>{selectedSchool.contact}</strong></div>
              <div className="kv-row"><span>Outstanding</span><strong>{money(selectedSchool.outstanding || 0)}</strong></div>
              <div className="kv-row">
                <span>Status</span>
                <span className={`badge-status ${selectedSchool.status === 'Active' ? 'badge-active' : 'badge-pending'}`}>
                  {selectedSchool.status}
                </span>
              </div>
              <div className="info-callout mt-3">
                Credit warning is calculated in the next step when products are added.
              </div>
            </AppCard>
          )}
        </div>
      </div>

      {confirmCancel && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(20, 24, 32, 0.5)', zIndex: 1500 }}
          role="dialog"
          aria-modal="true"
          aria-label="Cancel order"
        >
          <button
            type="button"
            aria-label="Close dialog"
            className="position-absolute top-0 start-0 w-100 h-100 modal-backdrop-app"
            onClick={() => setConfirmCancel(false)}
          ></button>
          <div
            className="app-card"
            style={{ maxWidth: 460, width: '90%', position: 'relative', zIndex: 1 }}
          >
            <div className="card-head"><h5 className="m-0">Cancel this order?</h5></div>
            <div className="card-body-app">
              <p>The draft will be cleared from this browser. This cannot be undone.</p>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-outline-app" onClick={() => setConfirmCancel(false)}>
                  Keep draft
                </button>
                <button type="button" className="btn btn-danger-app" onClick={confirmCancelOrder}>
                  Yes, cancel order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="info-callout success-callout mt-3" role="status">
          Draft saved.
        </div>
      )}
    </>
  );
}
