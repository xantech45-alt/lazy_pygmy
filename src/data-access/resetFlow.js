/**
 * resetFlow — sessionStorage helper for the password-reset prototype flow.
 *
 * Important constraints from the master prompt:
 *   - "No claim that a reset code or email was actually sent."
 *   - "Use the text 'Frontend demo—no email is sent' or an equally clear
 *      message in the reset flow."
 *   - "No storage of plaintext passwords in localStorage, sessionStorage,
 *      mock data, source files, or logs."
 *
 * This helper:
 *   - Generates a 6-digit verification code (held only in sessionStorage).
 *   - Records a 10-minute expiry timestamp.
 *   - Tracks resend cooldown (30s) to mirror the real-product cadence
 *     without ever sending a real email.
 *   - Never stores the user's password. The "new password" step holds the
 *     value in component state only, validated, and immediately consumed
 *     on submit.
 */
const KEY = 'lp_reset_flow_v1';
const EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

function read() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(value) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* ignore — private mode etc. */
  }
}

function clear() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

function generateCode() {
  // 6 digits, allow leading zeros
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}

export function startResetFlow(email) {
  const code = generateCode();
  const now = Date.now();
  const state = {
    email: (email || '').trim().toLowerCase(),
    code,
    issuedAt: now,
    expiresAt: now + EXPIRY_MS,
    lastResendAt: now,
    resendCount: 0,
    verifiedAt: null,
    consumed: false,
  };
  write(state);
  return state;
}

export function getResetFlow() {
  const state = read();
  if (!state) return null;
  if (state.expiresAt && Date.now() > state.expiresAt) {
    clear();
    return null;
  }
  return state;
}

export function resendCode() {
  const prev = getResetFlow();
  if (!prev) return null;
  const now = Date.now();
  if (prev.lastResendAt && now - prev.lastResendAt < RESEND_COOLDOWN_MS) {
    return { ...prev, cooldownMs: RESEND_COOLDOWN_MS - (now - prev.lastResendAt) };
  }
  const next = {
    ...prev,
    code: generateCode(),
    issuedAt: now,
    expiresAt: now + EXPIRY_MS,
    lastResendAt: now,
    resendCount: (prev.resendCount || 0) + 1,
  };
  write(next);
  return next;
}

export function verifyCode(input) {
  const state = getResetFlow();
  if (!state) return { ok: false, reason: 'expired' };
  if (state.consumed) return { ok: false, reason: 'consumed' };
  if (state.code !== String(input || '').trim()) return { ok: false, reason: 'mismatch' };
  const next = { ...state, verifiedAt: Date.now() };
  write(next);
  return { ok: true, state: next };
}

export function consumeResetFlow() {
  const state = getResetFlow();
  if (!state || !state.verifiedAt) return null;
  const consumed = { ...state, consumed: true };
  write(consumed);
  // wipe after a short delay so the password-reset step can read verifiedAt
  setTimeout(clear, 250);
  return consumed;
}

export function cancelResetFlow() {
  clear();
}

export function resendCooldownMs() {
  const state = getResetFlow();
  if (!state || !state.lastResendAt) return 0;
  const remaining = RESEND_COOLDOWN_MS - (Date.now() - state.lastResendAt);
  return remaining > 0 ? remaining : 0;
}

export const RESET_FLOW_MESSAGES = {
  DEMO_NOTICE: 'Frontend demo—no email is sent. Use the 6-digit code shown on the next screen to continue.',
  CODE_HINT: 'Your 6-digit code',
  EXPIRED: 'That code has expired. Click “Resend code” to start over.',
  MISMATCH: 'That code does not match. Please try again.',
  CONSUMED: 'This reset has already been used. Start a new request from the sign-in page.',
};
