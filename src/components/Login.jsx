import { useState } from 'react'
import { apiFetch, saveToken } from '../api.js'

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data?.message || 'Invalid credentials')
      saveToken(data.token)
      onSuccess && onSuccess()
    } catch (err) {
      setError(err.message || 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#FFF8FB_0%,#FFFDFE_100%)]">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Acesso administrativo</h2>
        <label className="block text-sm font-semibold mb-2">Senha</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border px-3 py-2 mb-3" autoFocus />
        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        <button type="submit" disabled={loading} className="w-full rounded-md bg-[#9B5DE5] text-white py-2 font-bold">{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
    </div>
  )
}
