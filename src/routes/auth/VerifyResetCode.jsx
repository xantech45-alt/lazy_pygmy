import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getResetFlow,
  resendCode,
  resendCooldownMs,
  startResetFlow,
  verifyCode,
  cancelResetFlow,
  RESET_FLOW_MESSAGES,
} from '../../data-access/resetFlow.js';
import { useToast } from '../../components/ToastProvider.jsx';

/**
 * VerifyResetCode — second screen of the reset prototype.
 *
 * - Displays the 6-digit code on screen (demo notice above).
 * - Six single-digit inputs: auto-advance on entry, Backspace navigates
 *   backwards, paste fills all six, ArrowLeft/ArrowRight move between cells.
 * - inputMode="numeric", pattern="\d*" for mobile keyboards.
 * - Submit verifies; success navigates to /reset-password.
 * - Resend respects a 30-second cooldown.
 */
const CODE_LEN = 6;

export default function VerifyResetCode() {
  const [digits, setDigits] = useState(() => Array(CODE_LEN).fill(''));
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const refs = useRef([]);
  const navigate = useNavigate();
  const toast = useToast();

  const flow = getResetFlow();
  // If the user lands here without a flow, redirect them back to start.
  useEffect(() => {
    if (!flow) navigate('/forgot-password', { replace: true });
  }, [flow, navigate]);

  // Cooldown ticker.
  useEffect(() => {
    if (!flow) return undefined;
    const tick = () => setCooldown(resendCooldownMs());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [flow]);

  const combined = useMemo(() => digits.join(''), [digits]);

  const setDigit = (i, v) => {
    const clean = v.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = prev.slice();
      next[i] = clean;
      return next;
    });
    if (clean && i < CODE_LEN - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (!digits[i] && i > 0) refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < CODE_LEN - 1) {
      e.preventDefault();
      refs.current[i + 1]?.focus();
    }
  };

  const onPaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, CODE_LEN);
    if (!text) return;
    e.preventDefault();
    const next = Array(CODE_LEN).fill('');
    for (let i = 0; i < text.length; i += 1) next[i] = text[i];
    setDigits(next);
    refs.current[Math.min(text.length, CODE_LEN - 1)]?.focus();
  };

  const submit = (e) => {
    e?.preventDefault?.();
    setError('');
    if (combined.length !== CODE_LEN) {
      setError('Please enter all 6 digits.');
      return;
    }
    const result = verifyCode(combined);
    if (!result.ok) {
      if (result.reason === 'expired') {
        toast(RESET_FLOW_MESSAGES.EXPIRED);
        navigate('/forgot-password', { replace: true });
        return;
      }
      if (result.reason === 'consumed') {
        toast(RESET_FLOW_MESSAGES.CONSUMED);
        navigate('/forgot-password', { replace: true });
        return;
      }
      setError(RESET_FLOW_MESSAGES.MISMATCH);
      refs.current[0]?.focus();
      return;
    }
    navigate('/reset-password');
  };

  const onResend = () => {
    if (cooldown > 0) return;
    if (!flow) {
      navigate('/forgot-password', { replace: true });
      return;
    }
    resendCode();
    setDigits(Array(CODE_LEN).fill(''));
    setError('');
    refs.current[0]?.focus();
    toast('A new code has been generated on screen. No email was sent.');
  };

  const onCancel = () => {
    cancelResetFlow();
    navigate('/sign-in');
  };

  if (!flow) return null;

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
        <h1 className="display-serif display-4 fw-bold mb-3">Verify your code.</h1>
        <p className="fs-5 opacity-75 mb-4">
          {RESET_FLOW_MESSAGES.DEMO_NOTICE}
        </p>
        <div className="login-stat">
          <i className="bi bi-clock-history"></i> The code expires in 10 minutes.
        </div>
        <div className="login-stat">
          <i className="bi bi-eye"></i> For this demo, the code is shown on the next screen.
        </div>
        <div className="mt-auto opacity-50">© 2026 Lazy Pygmy · Monrovia, Liberia</div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <h2 className="fw-bold mb-1">Enter the 6-digit code</h2>
          <p className="text-muted-app mb-4">
            A 6-digit code has been generated for <strong>{flow.email}</strong>. For
            this frontend demo, no email is dispatched — the code is also shown
            below for testing.
          </p>

          <div
            className="alert alert-light border text-center mb-4 font-numeric fs-3 letter-spacing-2"
            role="status"
            aria-label="Demo verification code"
          >
            <span className="text-muted-app small d-block mb-1">
              {RESET_FLOW_MESSAGES.CODE_HINT}
            </span>
            <strong aria-hidden="true">{flow.code}</strong>
          </div>

          <form id="verifyCodeForm" onSubmit={submit} noValidate>
            <span className="form-label" id="otp-label">
              Type the code
            </span>
            <div
              className="d-flex gap-2 mb-3 otp-cells"
              role="group"
              aria-labelledby="otp-label"
              onPaste={onPaste}
            >
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  className={`form-control text-center fs-4 font-numeric otp-cell ${
                    error ? 'is-invalid' : ''
                  }`}
                  aria-label={`Digit ${i + 1} of 6`}
                  aria-invalid={!!error}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                />
              ))}
            </div>
            {error && (
              <div className="invalid-feedback d-block mb-3" role="alert">
                {error}
              </div>
            )}

            <button className="btn btn-primary-app w-100 py-2" type="submit">
              Verify
            </button>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={onResend}
                disabled={cooldown > 0}
                aria-live="polite"
              >
                {cooldown > 0
                  ? `Resend code in ${Math.ceil(cooldown / 1000)}s`
                  : 'Resend code'}
              </button>
              <button
                type="button"
                className="btn btn-link p-0 text-danger"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <Link to="/sign-in">Back to sign in</Link>
          </div>
        </div>
      </section>
    </div>
  );
}