import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ToastProvider.jsx';
import { startResetFlow, RESET_FLOW_MESSAGES } from '../../data-access/resetFlow.js';

/**
 * ForgotPassword — replaces forgot-password.html.
 *
 * Submits the email and seeds a sessionStorage-only reset flow. The next
 * route is /verify-reset-code, which shows the 6-digit code on screen.
 * No email is sent — the demo notice appears verbatim on this screen.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [validated, setValidated] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setValidated(true);
    if (!form.checkValidity()) return;
    startResetFlow(email);
    toast(RESET_FLOW_MESSAGES.DEMO_NOTICE);
    navigate('/verify-reset-code');
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
        <h1 className="display-serif display-4 fw-bold mb-3">Reset your password.</h1>
        <p className="fs-5 opacity-75 mb-4">
          Enter your work email and we&apos;ll generate a demo reset-link confirmation.
        </p>
        <div className="login-stat">
          <i className="bi bi-shield-check"></i>{' '}
          Frontend demo — no email is sent.
        </div>
        <div className="mt-auto opacity-50">© 2026 Lazy Pygmy · Monrovia, Liberia</div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <h2 className="fw-bold mb-1">Reset password</h2>
          <p className="text-muted-app mb-4">
            {RESET_FLOW_MESSAGES.DEMO_NOTICE}
          </p>
          <form
            id="resetForm"
            noValidate
            className={validated ? 'was-validated' : ''}
            onSubmit={onSubmit}
          >
            <label className="form-label" htmlFor="resetEmail">
              Email address
            </label>
            <input
              id="resetEmail"
              type="email"
              className="form-control mb-4"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <button className="btn btn-primary-app w-100 py-2" type="submit">
              Send Reset Link
            </button>
          </form>
          <div className="text-center mt-4">
            <Link to="/sign-in">Back to sign in</Link>
          </div>
        </div>
      </section>
    </div>
  );
}