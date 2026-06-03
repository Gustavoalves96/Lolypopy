const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('auth_token')
  const headers = { ...(options.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  return res
}

export function saveToken(token) { localStorage.setItem('auth_token', token) }
export function clearToken() { localStorage.removeItem('auth_token') }
export function isLogged() { return !!localStorage.getItem('auth_token') }
