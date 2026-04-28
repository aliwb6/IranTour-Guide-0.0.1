// ── Base URL ──────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ── Token helpers ─────────────────────────────────────────────
const TOKEN_KEY = 'auth_token'
export const getToken    = ()  => localStorage.getItem(TOKEN_KEY)
export const saveToken   = (t) => localStorage.setItem(TOKEN_KEY, t)
export const removeToken = ()  => localStorage.removeItem(TOKEN_KEY)

// ── Core fetch wrapper ────────────────────────────────────────
export const apiFetch = async (path, { body, headers = {}, ...rest } = {}) => {
  const token      = getToken()
  const isFormData = body instanceof FormData

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: isFormData      ? body
        : body !== undefined ? JSON.stringify(body)
        : undefined,
  })

  let data
  try { data = await res.json() } catch { data = {} }

  if (!res.ok) {
    const err = new Error(data.message || `خطای سرور — کد ${res.status}`)
    err.status = res.status
    err.data   = data
    throw err
  }
  return data
}

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (body) => apiFetch('/auth/register', { method: 'POST', body }),
  login:    (body) => apiFetch('/auth/login',    { method: 'POST', body }),
  me:       ()     => apiFetch('/auth/me'),
}

// ── Events ────────────────────────────────────────────────────
export const eventsAPI = {
  // Public
  list:     (params = {}) => apiFetch('/events?' + new URLSearchParams(params)),
  get:      (id)          => apiFetch(`/events/${id}`),
  // Protected — organizer
  myEvents: ()            => apiFetch('/events/organizer/my'),
  create:   (body)        => apiFetch('/events',       { method: 'POST',   body }),
  update:   (id, body)    => apiFetch(`/events/${id}`, { method: 'PUT',    body }),
  delete:   (id)          => apiFetch(`/events/${id}`, { method: 'DELETE' }),
  registrations: (id)     => apiFetch(`/events/${id}/registrations`),
  // Public — RSVP (optional auth)
  register: (id, body)    => apiFetch(`/events/${id}/register`, { method: 'POST', body }),
}

// ── Users ─────────────────────────────────────────────────────
export const usersAPI = {
  profile:       ()        => apiFetch('/users/profile'),
  updateProfile: (body)    => apiFetch('/users/profile',            { method: 'PUT',    body }),
  savedEvents:   ()        => apiFetch('/users/saved-events'),
  saveEvent:     (id)      => apiFetch(`/users/saved-events/${id}`, { method: 'POST'  }),
  unsaveEvent:   (id)      => apiFetch(`/users/saved-events/${id}`, { method: 'DELETE'}),
  registrations: ()        => apiFetch('/users/registrations'),
}

// ── Upload ────────────────────────────────────────────────────
export const uploadAPI = {
  image: (file) => {
    const fd = new FormData()
    fd.append('image', file)
    return apiFetch('/upload/image', { method: 'POST', body: fd })
  },
}
