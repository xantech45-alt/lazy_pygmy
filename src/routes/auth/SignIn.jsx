import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * SignIn — replaces index.html.
 * Closes AUDIT_REPORT.md §6.7 (password toggle aria-label / aria-pressed).
 */
export default function SignIn() {
  const [email, setEmail] = useState('moses.kollie@lazypygmy.lr');
  const [password, setPassword] = useState('inventory2026');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }
    localStorage.setItem('lp_auth', '1');
    navigate('/dashboard');
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
          Inventory, under
          <br />
          control.
        </h1>
        <p className="fs-5 opacity-75 mb-4">
          One workspace for products, warehouses, school orders and suppliers.
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
          <h2 className="fw-bold mb-1">Sign in</h2>
          <p className="text-muted-app mb-4">Use your Lazy Pygmy work account</p>
          <form
            id="loginForm"
            noValidate
            className={validated ? 'was-validated' : ''}
            onSubmit={onSubmit}
          >
            <label className="form-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="form-control mb-3"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-group mb-3">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                className="form-control"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                id="togglePassword"
                type="button"
                className="btn btn-outline-secondary"
                aria-label={showPwd ? 'Hide password' : 'Show password'}
                aria-pressed={showPwd}
                onClick={() => setShowPwd((v) => !v)}
              >
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="d-flex justify-content-between mb-4">
              <label className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="form-check-label">Remember me</span>
              </label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <button className="btn btn-primary-app w-100 py-2" type="submit">
              Sign In
            </button>
          </form>
          <div className="text-center text-muted my-3">or</div>
          <button
            type="button"
            className="btn btn-outline-app w-100"
            onClick={() => toast('SSO is simulated in this frontend prototype.')}
          >
            Sign in with school SSO
          </button>
          <div className="small text-muted-app text-center mt-4">
            Frontend demonstration only. No real authentication occurs.
          </div>
          <div className="text-center mt-3">
            <span className="text-muted-app">New to Lazy Pygmy? </span>
            <Link to="/register">Create an account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
