/**
 * Profile / Account page (Phase 3).
 *
 * Sections:
 *   - Profile header: photo, name, role, status, location, storage notice.
 *   - Personal details: first/last name, work email, phone, "Save / Cancel".
 *   - Work information: employee #, role, department, location, status
 *     (read-only — these come from the employee directory).
 *   - Account & preferences summary: link to Settings, locale/timezone,
 *     simulated-auth notice.
 *
 * Storage rules (Phase 1 + Phase 2):
 *   - Profile data persists to lp_userProfile via useUserProfile().
 *   - Photo bytes live in IndexedDB (imageAssetStore) — only the asset id
 *     is kept on the profile record.
 *   - Replacing or removing the photo deletes the previous IDB record
 *     (orphan cleanup). Saving text edits never throws away the photo.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import AppCard from '../../components/AppCard.jsx';
import ImageImportField from '../../components/ImageImportField.jsx';
import ImagePreviewThumb from '../../components/ImagePreviewThumb.jsx';
import { useUserProfile } from '../../state/UserProfileContext.jsx';
import { useAppSettings } from '../../state/AppSettingsContext.jsx';
import { useToast } from '../../components/ToastProvider.jsx';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { imageAssetStore } from '../../data-access/imageAssetStore.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-\d\s]{6,}$/;

const EMPTY_FORM = {
  displayName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

function splitName(full = '') {
  const parts = String(full).trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0] || '', lastName: '' };
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
}

function deriveInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || '?';
}

export default function Profile() {
  const { profile, update, setPhoto, clearPhoto } = useUserProfile();
  const { settings } = useAppSettings();
  const toast = useToast();

  // Seed form values from the employee directory (EMP-001) the first time
  // we mount, then merge any local edits the user has made since.
  const seededEmployee = useMemo(() => {
    const list = localStorageStore.getEmployees();
    return list.find((e) => e.number === 'EMP-001') || null;
  }, []);

  const [form, setForm] = useState(() => {
    const persistedName = profile.displayName || '';
    const split = splitName(persistedName);
    const fallbackName = seededEmployee?.name || '';
    const splitSeed = splitName(fallbackName);
    return {
      displayName: persistedName || fallbackName,
      firstName: split.firstName || splitSeed.firstName,
      lastName: split.lastName || splitSeed.lastName,
      email: profile.email || seededEmployee?.email || 'moses.kollie@lazypygmy.lr',
      phone: profile.phone || seededEmployee?.phone || '+231 77 100 401',
    };
  });

  const [errors, setErrors] = useState({});
  const [savingPhotoId, setSavingPhotoId] = useState(profile.photoAssetId || null);

  // Mirror profile.photoAssetId back into local UI state.
  useEffect(() => {
    setSavingPhotoId(profile.photoAssetId || null);
  }, [profile.photoAssetId]);

  const dirty = useMemo(() => {
    const fields = ['displayName', 'firstName', 'lastName', 'email', 'phone'];
    return fields.some((f) => (form[f] || '') !== (initialFor(f, profile, seededEmployee) || ''));
  }, [form, profile, seededEmployee]);

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const validate = () => {
    const next = {};
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    if (!fullName) next.displayName = 'Please enter your first and last name.';
    if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid work email address.';
    if (form.phone && !PHONE_RE.test(form.phone)) {
      next.phone = 'Phone number looks invalid. Use digits, spaces, +, -, or ().';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const initials = deriveInitials(fullName);
    update({
      displayName: fullName,
      initials,
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    toast('Profile saved locally.');
  };

  const onCancel = () => {
    setForm({
      displayName: profile.displayName || seededEmployee?.name || '',
      firstName: splitName(profile.displayName || seededEmployee?.name || '').firstName,
      lastName: splitName(profile.displayName || seededEmployee?.name || '').lastName,
      email: profile.email || 'moses.kollie@lazypygmy.lr',
      phone: profile.phone || '+231 77 100 401',
    });
    setErrors({});
  };

  const handlePhotoCommit = async (assetId) => {
    // Persist via context (which writes lp_userProfile + version).
    setPhoto(assetId);
    setSavingPhotoId(assetId);
  };

  const handlePhotoRemove = async () => {
    // clearPhoto() returns the previous id; we also delete the IDB record
    // here (the field's internal cleanup handles staged asset deletion
    // when triggered by clicking Remove, but we double-check).
    const previousId = clearPhoto();
    if (previousId) {
      try {
        await imageAssetStore.delete(previousId);
      } catch {
        /* best-effort */
      }
    }
    setSavingPhotoId(null);
    toast('Photo removed.');
  };

  const workInfo = seededEmployee || {};

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Profile' },
        ]}
      />
      <PageHeader
        title="Profile & account"
        subtitle="Manage how you appear across the workspace. Stored in this browser only."
      >
        <Link to="/dashboard" className="btn btn-outline-app">
          Back
        </Link>
      </PageHeader>

      <div className="row g-3">
        {/* Profile header */}
        <div className="col-12">
          <AppCard>
            <div className="profile-photo-block">
              <ImagePreviewThumb
                assetId={savingPhotoId}
                shape="avatar"
                width={112}
                height={112}
                alt={profile.displayName}
              />
              <div className="profile-photo-meta">
                <div className="display-name">{profile.displayName}</div>
                <div className="text-muted-app small">
                  {workInfo.number || 'EMP-001'} · {workInfo.role || profile.role || 'Administrator'}
                  {' · '}
                  {workInfo.department || 'Management'} · {workInfo.location || 'Head Office'}
                </div>
                <div className="text-muted-app small mt-1">
                  Status: <span className="badge-status badge-active">{workInfo.status || 'Active'}</span>
                </div>
                <div className="small-note mt-2">
                  <i className="bi bi-shield-lock me-1" aria-hidden="true"></i>
                  Profile photo and preferences are stored in this browser only.
                </div>
              </div>
            </div>
            <hr />
            <div className="row g-3">
              <div className="col-md-6">
                <ImageImportField
                  kind="profile"
                  currentAssetId={savingPhotoId}
                  onCommit={handlePhotoCommit}
                  onRemove={handlePhotoRemove}
                  label="Profile photo"
                  helpText="PNG, JPEG, or WebP · up to 2 MB · stored in this browser."
                  shape="square"
                  ownerId="profile"
                />
              </div>
            </div>
          </AppCard>
        </div>

        {/* Personal details (editable) */}
        <div className="col-lg-7">
          <AppCard head={<h5>Personal details</h5>}>
            <form id="profileForm" noValidate onSubmit={onSave}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="profileFirstName">
                    First name
                  </label>
                  <input
                    id="profileFirstName"
                    name="firstName"
                    className={`form-control ${errors.displayName ? 'is-invalid' : ''}`}
                    value={form.firstName}
                    onChange={set('firstName')}
                    autoComplete="given-name"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="profileLastName">
                    Last name
                  </label>
                  <input
                    id="profileLastName"
                    name="lastName"
                    className={`form-control ${errors.displayName ? 'is-invalid' : ''}`}
                    value={form.lastName}
                    onChange={set('lastName')}
                    autoComplete="family-name"
                  />
                  {errors.displayName && (
                    <div className="invalid-feedback d-block">{errors.displayName}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label required" htmlFor="profileEmail">
                    Work email
                  </label>
                  <input
                    id="profileEmail"
                    name="email"
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    value={form.email}
                    onChange={set('email')}
                    autoComplete="email"
                  />
                  {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="profilePhone">
                    Phone
                  </label>
                  <input
                    id="profilePhone"
                    name="phone"
                    type="tel"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    value={form.phone}
                    onChange={set('phone')}
                    autoComplete="tel"
                    placeholder="+231 77 000 000"
                  />
                  {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-outline-app"
                  onClick={onCancel}
                  disabled={!dirty}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary-app"
                  disabled={!dirty}
                >
                  Save changes
                </button>
              </div>
            </form>
          </AppCard>
        </div>

        {/* Work info (read-only) */}
        <div className="col-lg-5">
          <AppCard head={<h5>Work information</h5>}>
            <p className="small-note mb-3">
              Work fields are managed by your administrator in the employee
              directory. Contact HR to update them.
            </p>
            <div className="kv-row">
              <span>Employee number</span>
              <strong className="font-numeric">{workInfo.number || 'EMP-001'}</strong>
            </div>
            <div className="kv-row">
              <span>Role</span>
              <strong>{workInfo.role || 'Administrator'}</strong>
            </div>
            <div className="kv-row">
              <span>Department</span>
              <strong>{workInfo.department || 'Management'}</strong>
            </div>
            <div className="kv-row">
              <span>Assigned location</span>
              <strong>{workInfo.location || 'Head Office'}</strong>
            </div>
            <div className="kv-row">
              <span>Employment status</span>
              <strong>{workInfo.status || 'Active'}</strong>
            </div>
            <div className="kv-row">
              <span>Employed since</span>
              <strong>{workInfo.employed || 'Feb 2019'}</strong>
            </div>
          </AppCard>
        </div>

        {/* Account & preferences summary */}
        <div className="col-12">
          <AppCard head={<h5>Account & preferences</h5>}>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="kv-row"><span>Timezone</span><strong>{settings.general.timezone}</strong></div>
                <div className="kv-row"><span>Locale</span><strong>{settings.general.locale}</strong></div>
                <div className="kv-row"><span>Currency</span><strong>{settings.general.currency}</strong></div>
                <Link to="/settings" className="btn btn-outline-app btn-sm mt-3">
                  <i className="bi bi-gear me-1" aria-hidden="true"></i>
                  Open Settings
                </Link>
              </div>
              <div className="col-md-8">
                <div className="info-callout">
                  <strong>Authentication is simulated.</strong> This frontend
                  prototype stores session state in your browser only. There
                  is no server account, password, or email transport. Profile
                  edits and photo changes remain on this device.
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </>
  );
}

function initialFor(field, profile, employee) {
  if (field === 'email') return profile.email || 'moses.kollie@lazypygmy.lr';
  if (field === 'phone') return profile.phone || employee?.phone || '';
  const full = profile.displayName || employee?.name || '';
  const { firstName, lastName } = splitName(full);
  if (field === 'firstName') return firstName;
  if (field === 'lastName') return lastName;
  if (field === 'displayName') return full;
  return '';
}
