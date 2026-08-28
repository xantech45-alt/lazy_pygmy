import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * Register — replaces register.html (master-prompt §2.3, post-audit addition).
 * Field set is authoritative as shipped in the HTML — no expansion without an
 * explicit instruction equivalent to the one that added it. Reuses the
 * login-shell / login-hero / login-panel layout from index.html and
 * forgot-password.html — no new visual language.
 *
 * Fields: firstName, lastName, email, username, phone, password,
 * confirmPassword, role (User / Admin / Manager / CEO / Employee),
 * acceptable-use checkbox.
 */
const ACCOUNT_ROLES = ['User', 'Admin', 'Manager', 'CEO', 'Employee'];

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('User');
  const [accepted, setAccepted] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [validated, setValidated] = useState(false);
  const [pwdMismatch, setPwdMismatch] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setValidated(true);

    if (password !== confirmPassword) {
      setPwdMismatch(true);
      form.querySelector('#confirmPassword')?.setCustomValidity('Passwords do not match');
    } else {
      setPwdMismatch(false);
      form.querySelector('#confirmPassword')?.setCustomValidity('');
    }

    if (form.checkValidity()) {
      toast('Account created. Sign in to continue.');
      navigate('/sign-in');
    }
  };

  return (
    <div className="login-shell">
      <section className="login-hero">
        <div className="d-flex align-items-center gap-3 mb-5">
          <div className="brand-mark">LP</div>
          <div>
            <div className="fs-5 fw-bold">Lazy Pygmy</div>
            <div className="opacity-75">Inventory Suite</div>
          </div>
        </div>
        <h1 className="display-serif display-4 fw-bold mb-3">
          Create your
          <br />
          workspace.
        </h1>
        <p className="fs-5 opacity-75 mb-4">
          A single account for products, warehouses, school orders and suppliers.
        </p>
        <div className="login-stat">
          <i className="bi bi-check-circle-fill"></i>245 products across 5 categories
        </div>
        <div className="login-stat">
          <i className="bi bi-check-circle-fill"></i>3 warehouses · 18,450 units tracked
        </div>
        <div className="login-stat">
          <i className="bi bi-check-circle-fill"></i>84 active schools in 4 counties
        </div>
        <div className="mt-auto opacity-50">© 2026 Lazy Pygmy · Monrovia, Liberia</div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <h2 className="fw-bold mb-1">Create account</h2>
          <p className="text-muted-app mb-4">
            Use your work email — you&apos;ll sign in once your account is created.
          </p>
          <form
            id="registerForm"
            noValidate
            className={validated ? 'was-validated' : ''}
            onSubmit={onSubmit}
          >
            <div className="row g-3 mb-1">
              <div className="col-sm-6">
                <label className="form-label" htmlFor="firstName">
                  First name <span className="text-danger">required</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="form-control"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label" htmlFor="lastName">
                  Last name <span className="text-danger">required</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="form-control"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <label className="form-label mt-3" htmlFor="regEmail">
              Work email <span className="text-danger">required</span>
            </label>
            <input
              id="regEmail"
              type="email"
              className="form-control mb-3"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <div className="row g-3 mb-1">
              <div className="col-sm-6">
                <label className="form-label" htmlFor="regUsername">
                  Username <span className="text-danger">required</span>
                </label>
                <input
                  id="regUsername"
                  type="text"
                  className="form-control"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label" htmlFor="regPhone">
                  Phone number
                </label>
                <input
                  id="regPhone"
                  type="tel"
                  className="form-control"
                  pattern="^\+?[0-9 ()-]{6,}$"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>

            <label className="form-label mt-3" htmlFor="regRole">
              Role <span className="text-danger">required</span>
            </label>
            <select
              id="regRole"
              className="form-select mb-3"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ACCOUNT_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="helper-text mb-3">
              Account role is independent of operational roles assigned to employees.
            </div>

            <label className="form-label" htmlFor="regPassword">
              Password <span className="text-danger">required</span>
            </label>
            <div className="input-group mb-3">
              <input
                id="regPassword"
                type={showPwd ? 'text' : 'password'}
                className="form-control"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                id="toggleRegPassword"
                type="button"
                className="btn btn-outline-secondary"
                aria-label={showPwd ? 'Hide password' : 'Show password'}
                aria-pressed={showPwd}
                onClick={() => setShowPwd((v) => !v)}
              >
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>

            <label className="form-label" htmlFor="confirmPassword">
              Confirm password <span className="text-danger">required</span>
            </label>
            <input
              id="confirmPassword"
              type={showPwd ? 'text' : 'password'}
              className={`form-control mb-1 ${pwdMismatch ? 'is-invalid' : ''}`}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {pwdMismatch && (
              <div className="invalid-feedback d-block">
                Passwords do not match.
              </div>
            )}

            <label className="form-check mt-3 mb-4">
              <input
                id="acceptTerms"
                className="form-check-input"
                type="checkbox"
                required
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span className="form-check-label">
                I agree to the acceptable-use policy and confirm I am authorised to create this account.
              </span>
            </label>

            <button className="btn btn-primary-app w-100 py-2" type="submit">
              Create Account
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/sign-in">Already have an account? Sign in</Link>
          </div>
          <div className="text-center mt-2">
            <Link to="/sign-in">← Back to sign in</Link>
          </div>
        </div>
      </section>
    </div>
  );
}