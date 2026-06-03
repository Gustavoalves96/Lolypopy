import { useState, useEffect } from 'react'
import { CardShell } from './CardShell.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const STATUS_CONFIG = {
  pendente:   { label: 'Pendente',   className: 'bg-[#FFF5D6] text-[#A07800]' },
  confirmado: { label: 'Confirmado', className: 'bg-[#D7FBF3] text-[#0B7A5E]' },
  realizado:  { label: 'Realizado',  className: 'bg-[#EEE4FF] text-[#6B35C1]' },
  cancelado:  { label: 'Cancelado',  className: 'bg-[#FFE8F1] text-[#C9365A]' },
}

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

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
  clienteId: '',
  data: '',
  horario: '',
  temaFesta: '',
  numeroCriancas: '',
  buffet: '',
  status: 'pendente',
  valorTotal: '',
  valorPago: '',
  observacoes: '',
}

export default function Reservas({ onNovaReserva }) {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [eventos, setEventos] = useState([])
  const [clientes, setClientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [eventoSelecionado, setEventoSelecionado] = useState(null)
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [confirmandoDeletar, setConfirmandoDeletar] = useState(null)

  async function carregar() {
    try {
      setCarregando(true)
      const [rEv, rCl] = await Promise.all([
        fetch(`${API_URL}/eventos?mes=${mes}&ano=${ano}`),
        fetch(`${API_URL}/clientes`),
      ])
      setEventos(rEv.ok ? await rEv.json() : [])
      setClientes(rCl.ok ? await rCl.json() : [])
    } catch {
      setEventos([])
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [mes, ano])

  useEffect(() => {
    if (onNovaReserva) abrirNovo()
  }, [onNovaReserva])

  function abrirNovo() {
    setEventoSelecionado(null)
    setForm(FORM_VAZIO)
    setModalAberto(true)
  }

  function abrirEditar(evento) {
    setEventoSelecionado(evento)
    setForm({
      clienteId: evento.cliente?.id || '',
      data: evento.data || '',
      horario: evento.horario?.slice(0, 5) || '',
      temaFesta: evento.temaFesta || '',
      numeroCriancas: evento.numeroCriancas || '',
      buffet: evento.buffet || '',
      status: evento.status || 'pendente',
      valorTotal: evento.valorTotal || '',
      valorPago: evento.valorPago || '',
      observacoes: evento.observacoes || '',
    })
    setModalAberto(true)
  }

  async function salvar() {
    if (!form.data || !form.horario) return
    setSalvando(true)
    try {
      const payload = {
        ...form,
        clienteId: form.clienteId ? Number(form.clienteId) : undefined,
        numeroCriancas: form.numeroCriancas ? Number(form.numeroCriancas) : 0,
        valorTotal: form.valorTotal ? Number(form.valorTotal) : 0,
        valorPago: form.valorPago ? Number(form.valorPago) : 0,
      }
      const url = eventoSelecionado
        ? `${API_URL}/eventos/${eventoSelecionado.id}`
        : `${API_URL}/eventos`
      const method = eventoSelecionado ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      await carregar()
      setModalAberto(false)
    } catch {
      alert('Erro ao salvar reserva.')
    } finally {
      setSalvando(false)
    }
  }

  async function deletar(id) {
    try {
      await fetch(`${API_URL}/eventos/${id}`, { method: 'DELETE' })
      await carregar()
      setConfirmandoDeletar(null)
    } catch {
      alert('Erro ao remover reserva.')
    }
  }

  const valorRestante = (ev) => {
    const total = Number(ev.valorTotal) || 0
    const pago = Number(ev.valorPago) || 0
    return total - pago
  }

  const navegarMes = (dir) => {
    let novoMes = mes + dir
    let novoAno = ano
    if (novoMes > 12) { novoMes = 1; novoAno++ }
    if (novoMes < 1)  { novoMes = 12; novoAno-- }
    setMes(novoMes)
    setAno(novoAno)
  }

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-5">

      {/* NAVEGAÇÃO DE MÊS */}
      <CardShell title="Reservas" icon="📅">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => navegarMes(-1)} className="rounded-xl border border-[#F0E6F6] px-3 py-1.5 text-sm font-bold text-[#9B5DE5] hover:bg-[#EEE4FF]">
            ← Anterior
          </button>
          <span className="text-[15px] font-extrabold text-[#2D1B4E]" style={{ fontFamily: '"Baloo 2", cursive' }}>
            {MESES[mes - 1]} {ano}
          </span>
          <button onClick={() => navegarMes(1)} className="rounded-xl border border-[#F0E6F6] px-3 py-1.5 text-sm font-bold text-[#9B5DE5] hover:bg-[#EEE4FF]">
            Próximo →
          </button>
        </div>
      </CardShell>

      {/* LISTA DE EVENTOS */}
      <CardShell title={`${eventos.length} reserva${eventos.length !== 1 ? 's' : ''} em ${MESES[mes - 1]}`}>
        {carregando ? (
          <div className="px-5 py-10 text-center text-sm text-[#8B7BAD]">Carregando reservas...</div>
        ) : eventos.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="text-4xl">📅</div>
            <p className="mt-3 text-sm text-[#8B7BAD]">Nenhuma reserva em {MESES[mes - 1]}.</p>
            <button
              onClick={abrirNovo}
              className="mt-4 rounded-2xl bg-[#9B5DE5] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1]"
            >
              + Criar primeira reserva
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#F0E6F6]">
            {eventos.map((evento) => {
              const status = STATUS_CONFIG[evento.status] ?? STATUS_CONFIG.pendente
              const restante = valorRestante(evento)
              const dataFormatada = new Date(evento.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
              return (
                <div key={evento.id} className="px-5 py-4 transition hover:bg-[#FFF8FB]">
                  <div className="flex items-start gap-4">
                    {/* Data */}
                    <div className="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-[#EEE4FF] py-2 text-center">
                      <span className="text-[11px] font-bold uppercase text-[#6B35C1]">{dataFormatada.split(',')[0]}</span>
                      <span className="text-[20px] font-extrabold leading-tight text-[#2D1B4E]">
                        {new Date(evento.data + 'T12:00:00').getDate()}
                      </span>
                      <span className="text-[10px] text-[#8B7BAD]">{evento.horario?.slice(0, 5)}</span>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {evento.temaFesta && (
                          <span className="text-[15px] font-bold text-[#2D1B4E]">🎉 {evento.temaFesta}</span>
                        )}
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${status.className}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-[#8B7BAD]">
                        {evento.cliente && <span>👪 {evento.cliente.nome}</span>}
                        {evento.numeroCriancas > 0 && <span>👦 {evento.numeroCriancas} crianças</span>}
                        {evento.buffet && <span>🍰 {evento.buffet}</span>}
                      </div>

                      {Number(evento.valorTotal) > 0 && (
                        <div className="mt-2 flex flex-wrap gap-3 text-[12px]">
                          <span className="font-semibold text-[#2D1B4E]">
                            Total: <strong>R$ {Number(evento.valorTotal).toFixed(2).replace('.', ',')}</strong>
                          </span>
                          <span className="font-semibold text-[#0B7A5E]">
                            Pago: R$ {Number(evento.valorPago).toFixed(2).replace('.', ',')}
                          </span>
                          {restante > 0 && (
                            <span className="font-semibold text-[#C9365A]">
                              Restante: R$ {restante.toFixed(2).replace('.', ',')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        onClick={() => abrirEditar(evento)}
                        className="rounded-xl border border-[#F0E6F6] bg-white px-3 py-1.5 text-xs font-bold text-[#9B5DE5] transition hover:bg-[#EEE4FF]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmandoDeletar(evento)}
                        className="rounded-xl border border-[#FFE8F1] bg-white px-3 py-1.5 text-xs font-bold text-[#C9365A] transition hover:bg-[#FFE8F1]"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardShell>

      {/* MODAL — FORMULÁRIO */}
      {modalAberto && (
        <Modal
          titulo={eventoSelecionado ? 'Editar Reserva' : 'Nova Reserva'}
          onClose={() => setModalAberto(false)}
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Campo label="Data *">
              <input className={inputClass} type="date" value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} autoFocus />
            </Campo>
            <Campo label="Horário *">
              <input className={inputClass} type="time" value={form.horario} onChange={(e) => setForm(f => ({ ...f, horario: e.target.value }))} />
            </Campo>

            <div className="col-span-2">
              <Campo label="Cliente">
                <select className={inputClass} value={form.clienteId} onChange={(e) => setForm(f => ({ ...f, clienteId: e.target.value }))}>
                  <option value="">— Selecionar cliente —</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome} {c.nomeFilho ? `(filho: ${c.nomeFilho})` : ''}</option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className="col-span-2">
              <Campo label="Tema da festa">
                <input className={inputClass} value={form.temaFesta} onChange={(e) => setForm(f => ({ ...f, temaFesta: e.target.value }))} placeholder="Ex: Unicórnio, Super-Heróis..." />
              </Campo>
            </div>

            <Campo label="Nº de crianças">
              <input className={inputClass} type="number" min="0" value={form.numeroCriancas} onChange={(e) => setForm(f => ({ ...f, numeroCriancas: e.target.value }))} placeholder="0" />
            </Campo>
            <Campo label="Buffet">
              <input className={inputClass} value={form.buffet} onChange={(e) => setForm(f => ({ ...f, buffet: e.target.value }))} placeholder="Ex: Premium" />
            </Campo>

            <Campo label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="realizado">Realizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </Campo>
            <div />

            <Campo label="Valor total (R$)">
              <input className={inputClass} type="number" min="0" step="0.01" value={form.valorTotal} onChange={(e) => setForm(f => ({ ...f, valorTotal: e.target.value }))} placeholder="0,00" />
            </Campo>
            <Campo label="Valor pago (R$)">
              <input className={inputClass} type="number" min="0" step="0.01" value={form.valorPago} onChange={(e) => setForm(f => ({ ...f, valorPago: e.target.value }))} placeholder="0,00" />
            </Campo>

            <div className="col-span-2">
              <Campo label="Observações">
                <textarea className={`${inputClass} resize-none`} rows={3} value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} placeholder="Detalhes adicionais..." />
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
              disabled={!form.data || !form.horario || salvando}
              className="flex-[2] rounded-2xl bg-[#9B5DE5] py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1] disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : eventoSelecionado ? 'Salvar alterações' : 'Criar reserva'}
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL — CONFIRMAR REMOÇÃO */}
      {confirmandoDeletar && (
        <Modal titulo="Remover reserva" onClose={() => setConfirmandoDeletar(null)}>
          <p className="text-sm text-[#8B7BAD]">
            Tem certeza que deseja remover a reserva de{' '}
            <strong className="text-[#2D1B4E]">
              {new Date(confirmandoDeletar.data + 'T12:00:00').toLocaleDateString('pt-BR')}
            </strong>
            {confirmandoDeletar.cliente && ` — ${confirmandoDeletar.cliente.nome}`}?
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
