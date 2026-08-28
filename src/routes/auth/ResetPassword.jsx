import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  consumeResetFlow,
  getResetFlow,
  RESET_FLOW_MESSAGES,
} from '../../data-access/resetFlow.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * ResetPassword — final screen of the reset prototype.
 *
 * - Only accessible after a successful verifyCode() (i.e. flow.verifiedAt set).
 * - Two password fields with show/hide toggle and mismatch validation.
 * - Password values live only in component state — never persisted to
 *   localStorage or sessionStorage — and are cleared on unmount.
 * - On submit, marks the reset flow consumed and routes to /sign-in.
 */
export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const flow = getResetFlow();
  useEffect(() => {
    // Gate: must have a verified flow to view this page.
    if (!flow || !flow.verifiedAt) {
      navigate('/forgot-password', { replace: true });
    }
  }, [flow, navigate]);

  // Always wipe password state on unmount, per "no plaintext password in
   // storage" constraint.
  useEffect(() => {
    return () => {
      setPassword('');
      setConfirm('');
    };
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setValidated(true);

    if (password !== confirm) {
      setMismatch(true);
      form.querySelector('#newConfirm')?.setCustomValidity('Passwords do not match');
    } else {
      setMismatch(false);
      form.querySelector('#newConfirm')?.setCustomValidity('');
    }

    if (!form.checkValidity()) return;

    consumeResetFlow();
    setPassword('');
    setConfirm('');
    toast('Password updated. Sign in with your new password.');
    navigate('/sign-in');
  };

  if (!flow || !flow.verifiedAt) return null;

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
        <h1 className="display-serif display-4 fw-bold mb-3">Set a new password.</h1>
        <p className="fs-5 opacity-75 mb-4">
          Choose a password with at least 8 characters. For this prototype the
          password is held in memory only and is never written to storage.
        </p>
        <div className="login-stat">
          <i className="bi bi-shield-lock"></i> Frontend demo — passwords are not transmitted.
        </div>
        <div className="mt-auto opacity-50">© 2026 Lazy Pygmy · Monrovia, Liberia</div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <h2 className="fw-bold mb-1">Create a new password</h2>
          <p className="text-muted-app mb-4">{RESET_FLOW_MESSAGES.DEMO_NOTICE}</p>

          <form
            id="resetPasswordForm"
            noValidate
            className={validated ? 'was-validated' : ''}
            onSubmit={onSubmit}
          >
            <label className="form-label" htmlFor="newPassword">
              New password
            </label>
            <div className="input-group mb-3">
              <input
                id="newPassword"
                type={show ? 'text' : 'password'}
                className="form-control"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                aria-label={show ? 'Hide password' : 'Show password'}
                aria-pressed={show}
                onClick={() => setShow((v) => !v)}
              >
                {show ? 'Hide' : 'Show'}
              </button>
            </div>

            <label className="form-label" htmlFor="newConfirm">
              Confirm new password
            </label>
            <input
              id="newConfirm"
              type={show ? 'text' : 'password'}
              className={`form-control mb-1 ${mismatch ? 'is-invalid' : ''}`}
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
            {mismatch && (
              <div className="invalid-feedback d-block mb-3">Passwords do not match.</div>
            )}

            <button className="btn btn-primary-app w-100 py-2 mt-3" type="submit">
              Update password
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