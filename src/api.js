const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem('auth_token')
  const headers = { ...(options.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  // Token expirado ou inválido: limpa a sessão e avisa o app para deslogar.
  if (res.status === 401) {
    clearToken()
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }
  return res
}

export function saveToken(token) { sessionStorage.setItem('auth_token', token) }
export function clearToken() { sessionStorage.removeItem('auth_token') }
export function isLogged() { return !!sessionStorage.getItem('auth_token') }
