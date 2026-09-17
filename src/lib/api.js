/* The one place the site talks to backend/. Every call goes through `request`,
   so the token, the error envelope and the base URL are handled once.

   VITE_API_URL is inlined at build time, so changing it needs a rebuild. It
   defaults to a local backend, which is what `npm run dev` in backend/ serves. */
const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '')

/* The admin token lives in localStorage rather than a cookie: the API is a
   different origin, it authenticates with an Authorization header, and a header
   means CSRF is not a consideration. It is read through a function rather than
   cached in a module variable so a sign-out in another tab takes effect here. */
const TOKEN_KEY = 'thermax.admin.token'

export const auth = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      // Private browsing, or storage disabled. The session simply won't persist.
      return null
    }
  },
  set(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token)
      else localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* nothing to do — the session lasts as long as the tab */
    }
  },
  clear() {
    this.set(null)
  },
}

/* A failed request throws this rather than returning a status the caller has to
   remember to check. `details` carries the API's field-level messages, which the
   forms print against the field they belong to. */
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details ?? null
  }
}

async function request(path, { method = 'GET', body, auth: withAuth = true, signal } = {}) {
  const token = withAuth ? auth.get() : null
  const isForm = body instanceof FormData

  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      signal,
      headers: {
        // FormData sets its own content type, boundary and all.
        ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    // A network-level failure has no status and no envelope — usually the API
    // is not running, which is worth saying plainly.
    throw new ApiError(0, `Could not reach the API at ${BASE}. Is the backend running?`)
  }

  if (response.status === 204) return null

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    // A dead or revoked token should sign the admin out rather than leave every
    // subsequent call failing in the same way.
    if (response.status === 401) auth.clear()

    throw new ApiError(
      response.status,
      payload?.error?.message ?? `Request failed (${response.status}).`,
      payload?.error?.details,
    )
  }

  return payload
}

const query = (params = {}) => {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
  ).toString()
  return search ? `?${search}` : ''
}

/* A collection of records addressed by slug — the two admin panels differ only
   in the path and the field they call their image. */
const collection = (path, imageField) => ({
  list: (params, signal) => request(`${path}${query(params)}`, { signal }),
  get: (slug) => request(`${path}/${slug}`),
  create: (body) => request(path, { method: 'POST', body }),
  update: (slug, body) => request(`${path}/${slug}`, { method: 'PATCH', body }),
  remove: (slug) => request(`${path}/${slug}`, { method: 'DELETE' }),
  reorder: (slugs) => request(`${path}/reorder`, { method: 'PATCH', body: { slugs } }),
  uploadImage(slug, file) {
    const form = new FormData()
    form.append('image', file)
    return request(`${path}/${slug}/${imageField}`, { method: 'POST', body: form })
  },
  removeImage: (slug) => request(`${path}/${slug}/${imageField}`, { method: 'DELETE' }),
})

export const api = {
  baseUrl: BASE,
  health: () => request('/health', { auth: false }),
  sectors: () => request('/sectors', { auth: false }),

  signIn: (email, password) =>
    request('/auth/login', { method: 'POST', auth: false, body: { email, password } }),
  me: () => request('/auth/me'),

  clients: {
    ...collection('/clients', 'logo'),
    /* Grouped by sector with the counts and capacity totals already worked out
       — what the public Clients page draws, and what the sign-in summarises. */
    ledger: (params, signal) => request(`/clients/ledger${query(params)}`, { signal }),
  },
  applications: collection('/applications', 'image'),
}
