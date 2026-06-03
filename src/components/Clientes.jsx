import { useState, useEffect } from 'react'
import { CardShell } from './CardShell.jsx'
import { apiFetch } from '../api.js'

function Modal({ titulo, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(45,27,78,0.18)]">
        <div className="flex items-center justify-between border-b border-[#F0E6F6] px-6 py-4">
          <h3 className="text-[16px] font-bold text-[#2D1B4E]" style={{ fontFamily: '"Baloo 2", cursive' }}>
            {titulo}
          </h3>
          <button onClick={onClose} className="text-xl text-[#8B7BAD] hover:text-[#2D1B4E]">×</button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function Campo({ label, children }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[13px] font-semibold text-[#2D1B4E]">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-2xl border border-[#F0E6F6] bg-[#FFF8FB] px-4 py-2.5 text-sm text-[#2D1B4E] outline-none transition focus:border-[#9B5DE5] focus:ring-2 focus:ring-[#9B5DE5]/20'

const FORM_VAZIO = {
  nome: '', telefone: '', email: '', cpfCnpj: '',
  endereco: '', cidade: '', nomeFilho: '',
  dataNascimentoFilho: '', observacoes: '',
}

export default function Clientes({ onNovoCliente }) {
  const [clientes, setClientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [confirmandoDeletar, setConfirmandoDeletar] = useState(null)

  async function carregar() {
    try {
      setCarregando(true)
      const res = await apiFetch(`/clientes${busca ? `?busca=${busca}` : ''}`)
      if (!res.ok) throw new Error()
      setClientes(await res.json())
    } catch {
      setClientes([])
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [busca])

  // Chamado pela Topbar via prop
  useEffect(() => {
    if (onNovoCliente) abrirNovo()
  }, [onNovoCliente])

  function abrirNovo() {
    setClienteSelecionado(null)
    setForm(FORM_VAZIO)
    setModalAberto(true)
  }

  function abrirEditar(cliente) {
    setClienteSelecionado(cliente)
    setForm({
      nome: cliente.nome || '',
      telefone: cliente.telefone || '',
      email: cliente.email || '',
      cpfCnpj: cliente.cpfCnpj || '',
      endereco: cliente.endereco || '',
      cidade: cliente.cidade || '',
      nomeFilho: cliente.nomeFilho || '',
      dataNascimentoFilho: cliente.dataNascimentoFilho?.split('T')[0] || '',
      observacoes: cliente.observacoes || '',
    })
    setModalAberto(true)
  }

  async function salvar() {
    if (!form.nome.trim() || !form.telefone.trim()) return
    setSalvando(true)
    try {
      const url = clienteSelecionado ? `/clientes/${clienteSelecionado.id}` : `/clientes`
      const method = clienteSelecionado ? 'PATCH' : 'POST'
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      await carregar()
      setModalAberto(false)
    } catch {
      alert('Erro ao salvar cliente.')
    } finally {
      setSalvando(false)
    }
  }

  async function deletar(id) {
    try {
      await apiFetch(`/clientes/${id}`, { method: 'DELETE' })
      await carregar()
      setConfirmandoDeletar(null)
    } catch {
      alert('Erro ao remover cliente.')
    }
  }

  const inicial = (nome) => nome?.charAt(0).toUpperCase() ?? '?'
  const cores = ['bg-[#FFE8F1] text-[#C9365A]', 'bg-[#EEE4FF] text-[#6B35C1]', 'bg-[#D7FBF3] text-[#0B7A5E]', 'bg-[#FFF5D6] text-[#A07800]']
  const corAvatar = (id) => cores[id % cores.length]

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-5">
      {/* BARRA DE BUSCA */}
      <CardShell title="Clientes" icon="👪">
        <div className="px-5 py-4">
          <input
            className={inputClass}
            placeholder="🔍 Buscar por nome ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </CardShell>

      {/* LISTA */}
      <CardShell title={`${clientes.length} cliente${clientes.length !== 1 ? 's' : ''} cadastrado${clientes.length !== 1 ? 's' : ''}`}>
        {carregando ? (
          <div className="px-5 py-10 text-center text-sm text-[#8B7BAD]">Carregando clientes...</div>
        ) : clientes.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="text-4xl">👪</div>
            <p className="mt-3 text-sm text-[#8B7BAD]">
              {busca ? 'Nenhum cliente encontrado para essa busca.' : 'Nenhum cliente cadastrado ainda.'}
            </p>
            {!busca && (
              <button
                onClick={abrirNovo}
                className="mt-4 rounded-2xl bg-[#9B5DE5] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1]"
              >
                + Cadastrar primeiro cliente
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#F0E6F6]">
            {clientes.map((cliente) => (
              <div key={cliente.id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#FFF8FB]">
                {/* Avatar */}
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-extrabold ${corAvatar(cliente.id)}`}>
                  {inicial(cliente.nome)}
                </div>

                {/* Dados */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-bold text-[#2D1B4E]">{cliente.nome}</span>
                    {cliente.nomeFilho && (
                      <span className="rounded-full bg-[#FFE8F1] px-2.5 py-0.5 text-[11px] font-semibold text-[#C9365A]">
                        🎂 {cliente.nomeFilho}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-[#8B7BAD]">
                    <span>📞 {cliente.telefone}</span>
                    {cliente.email && <span>✉️ {cliente.email}</span>}
                    {cliente.cidade && <span>📍 {cliente.cidade}</span>}
                  </div>
                  {cliente.dataNascimentoFilho && (
                    <div className="mt-1 text-[11px] text-[#8B7BAD]">
                      🎉 Aniversário: {new Date(cliente.dataNascimentoFilho + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => abrirEditar(cliente)}
                    className="rounded-xl border border-[#F0E6F6] bg-white px-3 py-1.5 text-xs font-bold text-[#9B5DE5] transition hover:bg-[#EEE4FF]"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmandoDeletar(cliente)}
                    className="rounded-xl border border-[#FFE8F1] bg-white px-3 py-1.5 text-xs font-bold text-[#C9365A] transition hover:bg-[#FFE8F1]"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardShell>

      {/* MODAL — FORMULÁRIO */}
      {modalAberto && (
        <Modal
          titulo={clienteSelecionado ? `Editar — ${clienteSelecionado.nome}` : 'Novo Cliente'}
          onClose={() => setModalAberto(false)}
        >
          <div className="grid grid-cols-2 gap-x-4">
            <div className="col-span-2">
              <Campo label="Nome completo *">
                <input className={inputClass} value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Maria Souza" autoFocus />
              </Campo>
            </div>
            <Campo label="Telefone *">
              <input className={inputClass} value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(51) 99999-9999" />
            </Campo>
            <Campo label="E-mail">
              <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@email.com" />
            </Campo>
            <Campo label="CPF / CNPJ">
              <input className={inputClass} value={form.cpfCnpj} onChange={(e) => setForm(f => ({ ...f, cpfCnpj: e.target.value }))} placeholder="000.000.000-00" />
            </Campo>
            <Campo label="Cidade">
              <input className={inputClass} value={form.cidade} onChange={(e) => setForm(f => ({ ...f, cidade: e.target.value }))} placeholder="Porto Alegre" />
            </Campo>
            <div className="col-span-2">
              <Campo label="Endereço">
                <input className={inputClass} value={form.endereco} onChange={(e) => setForm(f => ({ ...f, endereco: e.target.value }))} placeholder="Rua, número, bairro" />
              </Campo>
            </div>
            <Campo label="Nome do filho(a)">
              <input className={inputClass} value={form.nomeFilho} onChange={(e) => setForm(f => ({ ...f, nomeFilho: e.target.value }))} placeholder="Ex: Sofia" />
            </Campo>
            <Campo label="Data de nascimento">
              <input className={inputClass} type="date" value={form.dataNascimentoFilho} onChange={(e) => setForm(f => ({ ...f, dataNascimentoFilho: e.target.value }))} />
            </Campo>
            <div className="col-span-2">
              <Campo label="Observações">
                <textarea className={`${inputClass} resize-none`} rows={3} value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} placeholder="Anotações sobre o cliente..." />
              </Campo>
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            <button
              onClick={() => setModalAberto(false)}
              className="flex-1 rounded-2xl border border-[#F0E6F6] py-2.5 text-sm font-bold text-[#8B7BAD] transition hover:bg-[#FFF8FB]"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={!form.nome.trim() || !form.telefone.trim() || salvando}
              className="flex-2 rounded-2xl bg-[#9B5DE5] py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1] disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : clienteSelecionado ? 'Salvar alterações' : 'Cadastrar cliente'}
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL — CONFIRMAR REMOÇÃO */}
      {confirmandoDeletar && (
        <Modal titulo="Remover cliente" onClose={() => setConfirmandoDeletar(null)}>
          <p className="text-sm text-[#8B7BAD]">
            Tem certeza que deseja remover <strong className="text-[#2D1B4E]">{confirmandoDeletar.nome}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setConfirmandoDeletar(null)}
              className="flex-1 rounded-2xl border border-[#F0E6F6] py-2.5 text-sm font-bold text-[#8B7BAD] transition hover:bg-[#FFF8FB]"
            >
              Cancelar
            </button>
            <button
              onClick={() => deletar(confirmandoDeletar.id)}
              className="flex-2 rounded-2xl bg-[#EF476F] py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#d63860]"
            >
              Sim, remover
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
