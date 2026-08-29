/**
 * HTTP client for the Lazy Pygmy backend.
 *
 * The backend speaks session cookies, not bearer tokens:
 *
 *   - ``lp_session`` (HttpOnly) carries the opaque session id and is
 *     never readable from JS — the browser attaches it automatically
 *     because every request here uses ``credentials: 'include'``.
 *   - ``lp_csrf`` (SPA-readable) is echoed back in the
 *     ``X-CSRF-Token`` header on every state-changing method. The
 *     backend's auth middleware rejects POST/PUT/PATCH/DELETE without
 *     a matching pair.
 *
 * Errors surface as ``ApiError`` carrying the backend's RFC 9457
 * Problem Details fields (``status``, ``title``, ``detail``,
 * ``code``) so callers can branch on the machine-readable ``code``
 * (e.g. ``unauthorized``) rather than scraping message strings.
 *
 * The base URL is same-origin by default: the Vite dev server proxies
 * ``/auth``, ``/dev``, ``/healthz`` and ``/readyz`` to the FastAPI
 * backend, so cookies never cross an origin in development. Deployed
 * environments can point the SPA directly at the API with
 * ``VITE_API_BASE_URL`` (the backend's CORS allow-list must include
 * the SPA origin for that mode).
 */

const CSRF_COOKIE_NAME = 'lp_csrf';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

/** RFC 9457 problem details lifted into a JS error. */
export class ApiError extends Error {
  constructor({ status, title, detail, code, errors }) {
    super(detail || title || `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.title = title || 'Request failed';
    this.detail = detail || null;
    this.code = code || null;
    /** Field-level validation issues: [{ field, message }] */
    this.errors = Array.isArray(errors) ? errors : [];
  }
}

/** True when the failure is an authentication problem (401). */
export function isUnauthorized(error) {
  return error instanceof ApiError && error.status === 401;
}

/** Read the CSRF cookie value the backend planted for the SPA. */
export function readCsrfToken() {
  if (typeof document === 'undefined') return null;
  const parts = document.cookie ? document.cookie.split(';') : [];
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    if (name === CSRF_COOKIE_NAME) {
      const value = part.slice(idx + 1).trim();
      return value ? decodeURIComponent(value) : null;
    }
  }
  return null;
}

/**
 * Normalise a Problem Details (or fallback) body into ApiError fields.
 * Exported for tests.
 */
export function toApiError(status, body) {
  if (body && typeof body === 'object') {
    return new ApiError({
      status,
      title: typeof body.title === 'string' ? body.title : undefined,
      detail: typeof body.detail === 'string' ? body.detail : undefined,
      code: typeof body.code === 'string' ? body.code : undefined,
      // ``errors`` arrives in two shapes: FastAPI's validation handler
      // embeds pydantic's errors() (loc/msg/type/input), and future
      // endpoints may use flat {field, message}. Map both.
      errors: Array.isArray(body.errors)
        ? body.errors
            .map((e) =>
              e && typeof e === 'object'
                ? {
                    field:
                      e.field ?? (Array.isArray(e.loc) ? e.loc.slice(1).join('.') : null),
                    message: e.message ?? e.msg ?? null,
                  }
                : { field: null, message: String(e) }
            )
            .filter((e) => e.message)
        : undefined,
    });
  }
  return new ApiError({ status });
}

async function parseErrorBody(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Core request helper. Prefer the typed wrappers below (api.get, …)
 * over calling this directly.
 */
export async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (MUTATING_METHODS.has(method)) {
    const token = readCsrfToken();
    if (token) headers.set(CSRF_HEADER_NAME, token);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      method,
      headers,
      credentials: 'include',
    });
  } catch (err) {
    // Network failure / dev server down — surface as a synthetic 0
    // so callers have one error type to handle.
    throw new ApiError({
      status: 0,
      title: 'Network error',
      detail: 'Could not reach the Lazy Pygmy backend. Is it running?',
      code: 'network_error',
    });
  }

  if (!response.ok) {
    throw toApiError(response.status, await parseErrorBody(response));
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  get: (path, options) => apiFetch(path, options),
  post: (path, body, options = {}) => apiFetch(path, { ...options, method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  put: (path, body, options = {}) => apiFetch(path, { ...options, method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: (path, body, options = {}) => apiFetch(path, { ...options, method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) }),
  delete: (path, options = {}) => apiFetch(path, { ...options, method: 'DELETE' }),
};

// ---------------------------------------------------------------------------
// Typed auth endpoints — the only backend surface that exists today.
// ---------------------------------------------------------------------------

/**
 * POST /auth/login. On success the backend plants lp_session +
 * lp_csrf cookies; the resolved value is the current-user payload.
 */
export function login(email, password) {
  return api.post('/auth/login', { email, password });
}

/** GET /auth/me — resolves the cookie-authenticated user or throws 401. */
export function fetchMe() {
  return api.get('/auth/me');
}

/** GET /auth/permissions — the caller's effective permission/role keys. */
export function fetchPermissions() {
  return api.get('/auth/permissions');
}

/** POST /auth/logout — revokes the session and clears both cookies. */
export function logout() {
  return api.post('/auth/logout', {});
}