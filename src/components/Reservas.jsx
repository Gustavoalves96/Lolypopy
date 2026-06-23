import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { CardShell } from './CardShell.jsx'
import { Modal } from './ui/Modal.jsx'
import { Campo } from './ui/Campo.jsx'
import { inputClass } from './ui/inputClass.js'
import { SkeletonRows } from './ui/Skeleton.jsx'
import { mascaraTelefone } from '../utils/masks.js'
import { apiFetch } from '../api.js'

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const hoje = () => new Date().toISOString().split('T')[0]

const STATUS_CONFIG = {
  pendente:   { label: 'Pendente',   className: 'bg-[#FFF5D6] text-[#A07800]' },
  confirmado: { label: 'Confirmado', className: 'bg-[#D7FBF3] text-[#0B7A5E]' },
  realizado:  { label: 'Realizado',  className: 'bg-[#EEE4FF] text-[#6B35C1]' },
  cancelado:  { label: 'Cancelado',  className: 'bg-[#FFE8F1] text-[#C9365A]' },
}

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

// ─── Validação ─────────────────────────────────────────────────────────────
function validarReserva(form) {
  const erros = {}
  if (!form.data)    erros.data    = 'Data é obrigatória'
  else if (form.data < hoje()) erros.data = 'Não é possível criar reservas em datas passadas'
  if (!form.horario) erros.horario = 'Horário é obrigatório'
  return erros
}

function validarCliente(form) {
  const erros = {}
  if (!form.nome.trim())     erros.nome     = 'Nome é obrigatório'
  if (!form.telefone.trim()) erros.telefone = 'Telefone é obrigatório'
  return erros
}

// ─── Sub-componentes ───────────────────────────────────────────────────────
function Secao({ titulo, icon }) {
  return (
    <div className="col-span-2 mb-1 mt-2 flex items-center gap-2 border-b border-[#F0E6F6] pb-2">
      <span>{icon}</span>
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#8B7BAD]">{titulo}</span>
    </div>
  )
}

const FORM_RESERVA_VAZIO = {
  clienteId: '', data: '', horario: '', temaFesta: '',
  numeroCriancas: '', numeroPessoas: '', buffet: '',
  status: 'pendente', valorTotal: '', valorPago: '',
  parcelas: '1', observacoes: '',
}

const FORM_CLIENTE_VAZIO = {
  nome: '', telefone: '', email: '', nomeFilho: '',
  idadeAniversariante: '', cidade: '', observacoes: '',
}

// ─── Preview financeiro ────────────────────────────────────────────────────
function PreviewFinanceiro({ valorTotal, valorPago, parcelas }) {
  const total      = Number(valorTotal) || 0
  const pago       = Number(valorPago)  || 0
  const nParcelas  = Number(parcelas)   || 1
  const restante   = total - pago
  const pct        = total > 0 ? Math.min(100, Math.round((pago / total) * 100)) : 0
  const valorParc  = nParcelas > 1 && restante > 0
    ? Math.round((restante / nParcelas) * 100) / 100 : 0

  if (total === 0) return null

  return (
    <div className="col-span-2 mb-4 rounded-2xl border border-[#F0E6F6] bg-[#FFF8FB] p-4">
      <div className="mb-2 text-[12px] font-bold uppercase tracking-widest text-[#8B7BAD]">Resumo financeiro</div>
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F0E6F6]">
          <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-[#06D6A0]' : 'bg-[#9B5DE5]'}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[11px] font-bold text-[#8B7BAD]">{pct}%</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white px-2 py-2 shadow-sm">
          <div className="text-[11px] text-[#8B7BAD]">Total</div>
          <div className="text-[13px] font-extrabold text-[#2D1B4E]">{fmt(total)}</div>
        </div>
        <div className="rounded-xl bg-[#D7FBF3] px-2 py-2">
          <div className="text-[11px] text-[#0B7A5E]">Sinal ✓</div>
          <div className="text-[13px] font-extrabold text-[#0B7A5E]">{fmt(pago)}</div>
        </div>
        <div className={`rounded-xl px-2 py-2 ${restante > 0 ? 'bg-[#FFE8F1]' : 'bg-[#D7FBF3]'}`}>
          <div className={`text-[11px] ${restante > 0 ? 'text-[#C9365A]' : 'text-[#0B7A5E]'}`}>
            {restante > 0 ? 'Restante ⚠️' : 'Quitado 🎉'}
          </div>
          <div className={`text-[13px] font-extrabold ${restante > 0 ? 'text-[#C9365A]' : 'text-[#0B7A5E]'}`}>
            {fmt(restante > 0 ? restante : 0)}
          </div>
        </div>
      </div>

      {nParcelas > 1 && restante > 0 && (
        <div className="mt-3 rounded-xl bg-[#FFF5D6] px-3 py-2.5">
          <div className="mb-1.5 text-[11px] font-bold text-[#A07800]">
            📅 {nParcelas}x de {fmt(valorParc)}{pago > 0 ? ' — começa no mês seguinte à festa' : ' — começa no mês da festa'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: nParcelas }).map((_, i) => (
              <span key={i} className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-semibold text-[#A07800] shadow-sm">
                {i + 1}ª {fmt(i === nParcelas - 1
                  ? Math.round((restante - valorParc * (nParcelas - 1)) * 100) / 100
                  : valorParc)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 rounded-xl bg-[#EEE4FF] px-3 py-2 text-[11px] text-[#6B35C1]">
        💡 {nParcelas === 1
          ? pago > 0 && restante > 0 ? `Sinal de ${fmt(pago)} + saldo de ${fmt(restante)} à vista.`
          : pago > 0 && restante <= 0 ? `Pagamento completo de ${fmt(total)}.`
          : `Será cobrado ${fmt(total)} à vista.`
          : `${nParcelas}x de ${fmt(valorParc)} criadas automaticamente no Financeiro.`}
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function Reservas({ onNovaReserva, acaoCalendario }) {
  const [mes, setMes]       = useState(new Date().getMonth() + 1)
  const [ano, setAno]       = useState(new Date().getFullYear())
  const [eventos, setEventos]   = useState([])
  const [clientes, setClientes] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [modalAberto, setModalAberto]       = useState(false)
  const [eventoSelecionado, setEventoSelecionado] = useState(null)
  const [form, setForm]                     = useState(FORM_RESERVA_VAZIO)
  const [erros, setErros]                   = useState({})
  const [tentouSalvar, setTentouSalvar]     = useState(false)
  const [salvando, setSalvando]             = useState(false)

  const [novoClienteAberto, setNovoClienteAberto] = useState(false)
  const [formCliente, setFormCliente]       = useState(FORM_CLIENTE_VAZIO)
  const [errosCliente, setErrosCliente]     = useState({})
  const [tentouSalvarCliente, setTentouSalvarCliente] = useState(false)
  const [salvandoCliente, setSalvandoCliente] = useState(false)

  const [confirmandoDeletar, setConfirmandoDeletar] = useState(null)
  const [pendingEventId, setPendingEventId] = useState(null)

  async function carregar() {
    try {
      setCarregando(true)
      const [rEv, rCl] = await Promise.all([
        apiFetch(`/eventos?mes=${mes}&ano=${ano}`),
        apiFetch(`/clientes`),
      ])
      setEventos(rEv.ok ? await rEv.json() : [])
      setClientes(rCl.ok ? await rCl.json() : [])
    } catch { setEventos([]) }
    finally  { setCarregando(false) }
  }

  useEffect(() => { carregar() }, [mes, ano])
  useEffect(() => { if (onNovaReserva) abrirNovo() }, [onNovaReserva])
  useEffect(() => {
    if (!acaoCalendario) return
    if (acaoCalendario.tipo === 'nova') {
      abrirNovo(acaoCalendario.data)
    } else if (acaoCalendario.tipo === 'editar') {
      setMes(acaoCalendario.mes)
      setAno(acaoCalendario.ano)
      setPendingEventId(acaoCalendario.eventoId)
    }
  }, [acaoCalendario])
  useEffect(() => {
    if (!pendingEventId || carregando) return
    const ev = eventos.find(e => e.id === pendingEventId)
    if (ev) { abrirEditar(ev); setPendingEventId(null) }
    else setPendingEventId(null)
  }, [eventos, carregando, pendingEventId])

  useEffect(() => { if (tentouSalvar) setErros(validarReserva(form)) }, [form, tentouSalvar])
  useEffect(() => { if (tentouSalvarCliente) setErrosCliente(validarCliente(formCliente)) }, [formCliente, tentouSalvarCliente])

  function abrirNovo(dataInicial = '') {
    setEventoSelecionado(null)
    setForm({ ...FORM_RESERVA_VAZIO, data: dataInicial })
    setErros({})
    setTentouSalvar(false)
    setNovoClienteAberto(false)
    setModalAberto(true)
  }

  function abrirEditar(evento) {
    setEventoSelecionado(evento)
    setForm({
      clienteId:      evento.cliente?.id || '',
      data:           evento.data || '',
      horario:        evento.horario?.slice(0, 5) || '',
      temaFesta:      evento.temaFesta || '',
      numeroCriancas: evento.numeroCriancas || '',
      numeroPessoas:  evento.numeroPessoas || '',
      buffet:         evento.buffet || '',
      status:         evento.status || 'pendente',
      valorTotal:     evento.valorTotal || '',
      valorPago:      evento.valorPago || '',
      parcelas:       String(evento.parcelas || 1),
      observacoes:    evento.observacoes || '',
    })
    setErros({})
    setTentouSalvar(false)
    setNovoClienteAberto(false)
    setModalAberto(true)
  }

  async function salvarNovoCliente() {
    setTentouSalvarCliente(true)
    const e = validarCliente(formCliente)
    setErrosCliente(e)
    if (Object.keys(e).length > 0) return

    setSalvandoCliente(true)
    try {
      const res = await apiFetch('/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formCliente),
      })
      if (!res.ok) throw new Error()
      const criado = await res.json()
      const rCl = await apiFetch('/clientes')
      if (rCl.ok) setClientes(await rCl.json())
      setForm(f => ({ ...f, clienteId: criado.id }))
      setNovoClienteAberto(false)
      setFormCliente(FORM_CLIENTE_VAZIO)
      setTentouSalvarCliente(false)
      toast.success('Cliente cadastrado!')
    } catch { toast.error('Erro ao cadastrar cliente.') }
    finally  { setSalvandoCliente(false) }
  }

  async function salvar() {
    setTentouSalvar(true)
    const e = validarReserva(form)
    setErros(e)
    if (Object.keys(e).length > 0) return

    setSalvando(true)
    try {
      const payload = {
        ...form,
        clienteId:      form.clienteId      ? Number(form.clienteId)      : undefined,
        numeroCriancas: form.numeroCriancas  ? Number(form.numeroCriancas) : 0,
        numeroPessoas:  form.numeroPessoas   ? Number(form.numeroPessoas)  : 0,
        valorTotal:     form.valorTotal      ? Number(form.valorTotal)     : 0,
        valorPago:      form.valorPago       ? Number(form.valorPago)      : 0,
        parcelas:       form.parcelas        ? Number(form.parcelas)       : 1,
      }
      const url    = eventoSelecionado ? `/eventos/${eventoSelecionado.id}` : `/eventos`
      const method = eventoSelecionado ? 'PATCH' : 'POST'
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      await carregar()
      setModalAberto(false)
      toast.success(eventoSelecionado ? 'Reserva atualizada!' : 'Reserva criada!')
    } catch { toast.error('Erro ao salvar reserva.') }
    finally  { setSalvando(false) }
  }

  async function deletar(id) {
    try {
      await apiFetch(`/eventos/${id}`, { method: 'DELETE' })
      await carregar()
      setConfirmandoDeletar(null)
      toast.success('Reserva removida.')
    } catch { toast.error('Erro ao remover reserva.') }
  }

  const navegarMes = (dir) => {
    let novoMes = mes + dir, novoAno = ano
    if (novoMes > 12) { novoMes = 1;  novoAno++ }
    if (novoMes < 1)  { novoMes = 12; novoAno-- }
    setMes(novoMes); setAno(novoAno)
  }

  const clienteSelecionado = clientes.find(c => String(c.id) === String(form.clienteId))

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-5">

      {/* NAVEGAÇÃO MÊS */}
      <CardShell title="Reservas" icon="📅">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => navegarMes(-1)} className="rounded-xl border border-[#F0E6F6] px-3 py-1.5 text-sm font-bold text-[#9B5DE5] hover:bg-[#EEE4FF]">← Anterior</button>
          <span className="text-[15px] font-extrabold text-[#2D1B4E]" style={{ fontFamily: '"Baloo 2", cursive' }}>{MESES[mes - 1]} {ano}</span>
          <button onClick={() => navegarMes(1)} className="rounded-xl border border-[#F0E6F6] px-3 py-1.5 text-sm font-bold text-[#9B5DE5] hover:bg-[#EEE4FF]">Próximo →</button>
        </div>
      </CardShell>

      {/* LISTA */}
      <CardShell title={`${eventos.length} reserva${eventos.length !== 1 ? 's' : ''} em ${MESES[mes - 1]}`}>
        {carregando ? (
          <SkeletonRows />
        ) : eventos.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="text-4xl">📅</div>
            <p className="mt-3 text-sm text-[#8B7BAD]">Nenhuma reserva em {MESES[mes - 1]}.</p>
            <button onClick={abrirNovo} className="mt-4 rounded-2xl bg-[#9B5DE5] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1]">+ Criar primeira reserva</button>
          </div>
        ) : (
          <div className="divide-y divide-[#F0E6F6]">
            {eventos.map((evento) => {
              const status   = STATUS_CONFIG[evento.status] ?? STATUS_CONFIG.pendente
              const total    = Number(evento.valorTotal) || 0
              const pago     = Number(evento.valorPago)  || 0
              const restante = total - pago
              const pct      = total > 0 ? Math.min(100, Math.round((pago / total) * 100)) : 0

              return (
                <div key={evento.id} className="px-5 py-4 transition hover:bg-[#FFF8FB]">
                  <div className="flex items-start gap-4">
                    <div className="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-[#EEE4FF] py-2 text-center">
                      <span className="text-[11px] font-bold uppercase text-[#6B35C1]">
                        {new Date(evento.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </span>
                      <span className="text-[20px] font-extrabold leading-tight text-[#2D1B4E]">
                        {new Date(evento.data + 'T12:00:00').getDate()}
                      </span>
                      <span className="text-[10px] text-[#8B7BAD]">{evento.horario?.slice(0, 5)}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {evento.temaFesta && <span className="text-[15px] font-bold text-[#2D1B4E]">🎉 {evento.temaFesta}</span>}
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${status.className}`}>{status.label}</span>
                        {restante > 0 && total > 0 && <span className="rounded-full bg-[#FFE8F1] px-2.5 py-0.5 text-[11px] font-bold text-[#C9365A]">⚠️ Pendente</span>}
                        {total > 0 && restante === 0 && <span className="rounded-full bg-[#D7FBF3] px-2.5 py-0.5 text-[11px] font-bold text-[#0B7A5E]">✓ Quitado</span>}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-[#8B7BAD]">
                        {evento.cliente && (
                          <span>
                            👪 {evento.cliente.nome}
                            {evento.cliente.nomeFilho && (
                              <span className="ml-1 font-semibold text-[#C9365A]">
                                · 🎂 {evento.cliente.nomeFilho}{evento.cliente.idadeAniversariante ? ` (${evento.cliente.idadeAniversariante} anos)` : ''}
                              </span>
                            )}
                          </span>
                        )}
                        {evento.numeroCriancas > 0 && <span>👦 {evento.numeroCriancas} crianças</span>}
                        {evento.numeroPessoas  > 0 && <span>👥 {evento.numeroPessoas} pessoas</span>}
                        {evento.buffet && <span>🍰 {evento.buffet}</span>}
                        {evento.parcelas > 1 && <span>📅 {evento.parcelas}x</span>}
                      </div>
                      {total > 0 && (
                        <div className="mt-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F0E6F6]">
                              <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-[#06D6A0]' : 'bg-[#9B5DE5]'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-[#8B7BAD]">{pct}%</span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-3 text-[12px]">
                            <span className="font-semibold text-[#2D1B4E]">Total: <strong>{fmt(total)}</strong></span>
                            <span className="font-semibold text-[#0B7A5E]">Pago: {fmt(pago)}</span>
                            {restante > 0 && <span className="font-semibold text-[#C9365A]">Restante: {fmt(restante)}</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      <button onClick={() => abrirEditar(evento)} className="rounded-xl border border-[#F0E6F6] bg-white px-3 py-1.5 text-xs font-bold text-[#9B5DE5] transition hover:bg-[#EEE4FF]">Editar</button>
                      <button onClick={() => setConfirmandoDeletar(evento)} className="rounded-xl border border-[#FFE8F1] bg-white px-3 py-1.5 text-xs font-bold text-[#C9365A] transition hover:bg-[#FFE8F1]">Remover</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardShell>

      {/* MODAL — RESERVA */}
      {modalAberto && (
        <Modal titulo={eventoSelecionado ? 'Editar Reserva' : 'Nova Reserva'} onClose={() => setModalAberto(false)} maxWidth="max-w-2xl">
          <div className="grid grid-cols-2 gap-x-4">

            <Secao titulo="Dados da festa" icon="🎉" />

            <Campo label="Data" obrigatorio erro={erros.data}>
              <input className={inputClass(erros.data)} type="date" min={hoje()} value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} autoFocus />
            </Campo>
            <Campo label="Horário" obrigatorio erro={erros.horario}>
              <input className={inputClass(erros.horario)} type="time" value={form.horario} onChange={(e) => setForm(f => ({ ...f, horario: e.target.value }))} />
            </Campo>

            <div className="col-span-2">
              <Campo label="Tema da festa">
                <input className={inputClass()} value={form.temaFesta} onChange={(e) => setForm(f => ({ ...f, temaFesta: e.target.value }))} placeholder="Ex: Unicórnio, Super-Heróis..." />
              </Campo>
            </div>

            <Campo label="Nº crianças (até 40 não paga)">
              <input className={inputClass()} type="number" min="0" value={form.numeroCriancas} onChange={(e) => setForm(f => ({ ...f, numeroCriancas: e.target.value }))} placeholder="0" />
            </Campo>
            <Campo label="Nº total de pessoas">
              <input className={inputClass()} type="number" min="0" value={form.numeroPessoas} onChange={(e) => setForm(f => ({ ...f, numeroPessoas: e.target.value }))} placeholder="0" />
            </Campo>

            <Campo label="Buffet">
              <input className={inputClass()} value={form.buffet} onChange={(e) => setForm(f => ({ ...f, buffet: e.target.value }))} placeholder="Ex: Premium" />
            </Campo>
            <Campo label="Status">
              <select className={inputClass()} value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="realizado">Realizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </Campo>

            {/* CLIENTE */}
            <Secao titulo="Cliente" icon="👪" />
            <div className="col-span-2">
              <Campo label="Selecionar cliente">
                <select className={inputClass()} value={form.clienteId} onChange={(e) => setForm(f => ({ ...f, clienteId: e.target.value }))}>
                  <option value="">— Nenhum selecionado —</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}{c.nomeFilho ? ` · 🎂 ${c.nomeFilho}${c.idadeAniversariante ? ` (${c.idadeAniversariante} anos)` : ''}` : ''}{c.telefone ? ` (${c.telefone})` : ''}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            {clienteSelecionado && (
              <div className="col-span-2 mb-4 rounded-2xl bg-[#EEE4FF] px-4 py-3 text-[12px] text-[#6B35C1]">
                <strong>{clienteSelecionado.nome}</strong>
                {clienteSelecionado.nomeFilho && <span> · 🎂 {clienteSelecionado.nomeFilho}{clienteSelecionado.idadeAniversariante ? ` (${clienteSelecionado.idadeAniversariante} anos)` : ''}</span>}
                {clienteSelecionado.telefone  && <span> · 📞 {clienteSelecionado.telefone}</span>}
                {clienteSelecionado.cidade    && <span> · 📍 {clienteSelecionado.cidade}</span>}
              </div>
            )}

            <div className="col-span-2 mb-4">
              <button type="button" onClick={() => setNovoClienteAberto(v => !v)}
                className="flex items-center gap-2 rounded-xl border border-[#F0E6F6] px-4 py-2 text-[12px] font-bold text-[#9B5DE5] transition hover:bg-[#EEE4FF]">
                {novoClienteAberto ? '▲ Fechar cadastro' : '+ Cadastrar novo cliente'}
              </button>
            </div>

            {novoClienteAberto && (
              <div className="col-span-2 mb-4 rounded-2xl border border-[#EEE4FF] bg-[#FAFAFE] p-4">
                <div className="mb-3 text-[12px] font-bold uppercase tracking-widest text-[#9B5DE5]">Novo cliente</div>
                <div className="grid grid-cols-2 gap-x-4">
                  <div className="col-span-2">
                    <Campo label="Nome completo" obrigatorio erro={errosCliente.nome}>
                      <input className={inputClass(errosCliente.nome)} value={formCliente.nome} onChange={(e) => setFormCliente(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Maria Souza" />
                    </Campo>
                  </div>
                  <Campo label="Telefone" obrigatorio erro={errosCliente.telefone}>
                    <input className={inputClass(errosCliente.telefone)} value={formCliente.telefone}
                      onChange={(e) => setFormCliente(f => ({ ...f, telefone: mascaraTelefone(e.target.value) }))} placeholder="(51) 99999-9999" maxLength={15} />
                  </Campo>
                  <Campo label="E-mail">
                    <input className={inputClass()} type="email" value={formCliente.email} onChange={(e) => setFormCliente(f => ({ ...f, email: e.target.value }))} placeholder="email@email.com" />
                  </Campo>
                  <Campo label="Nome do aniversariante">
                    <input className={inputClass()} value={formCliente.nomeFilho} onChange={(e) => setFormCliente(f => ({ ...f, nomeFilho: e.target.value }))} placeholder="Ex: Sofia" />
                  </Campo>
                  <Campo label="Quantos anos vai fazer">
                    <input className={inputClass()} type="number" min="1" max="18" value={formCliente.idadeAniversariante} onChange={(e) => setFormCliente(f => ({ ...f, idadeAniversariante: e.target.value }))} placeholder="Ex: 5" />
                  </Campo>
                  <Campo label="Cidade">
                    <input className={inputClass()} value={formCliente.cidade} onChange={(e) => setFormCliente(f => ({ ...f, cidade: e.target.value }))} placeholder="Ex: Porto Alegre" />
                  </Campo>
                </div>
                <button type="button" onClick={salvarNovoCliente} disabled={salvandoCliente}
                  className="mt-2 w-full rounded-2xl bg-[#9B5DE5] py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1] disabled:opacity-50">
                  {salvandoCliente ? 'Salvando...' : '✓ Salvar cliente e selecionar'}
                </button>
              </div>
            )}

            {/* FINANCEIRO */}
            <Secao titulo="Financeiro" icon="💰" />
            <Campo label="Valor total (R$)">
              <input className={inputClass()} type="number" min="0" step="0.01" value={form.valorTotal} onChange={(e) => setForm(f => ({ ...f, valorTotal: e.target.value }))} placeholder="0,00" />
            </Campo>
            <Campo label="Sinal pago (R$)">
              <input className={inputClass()} type="number" min="0" step="0.01" value={form.valorPago} onChange={(e) => setForm(f => ({ ...f, valorPago: e.target.value }))} placeholder="0,00" />
            </Campo>

            {/* PARCELAMENTO — lista */}
            <div className="col-span-2 mb-4">
              <label className="mb-2 block text-[13px] font-semibold text-[#2D1B4E]">Parcelamento do restante</label>
              <div className="overflow-hidden rounded-2xl border border-[#F0E6F6]">
                {[
                  { n: 1,  label: 'À vista' },
                  ...[2,3,4,5,6,7,8,9,10,11,12].map(n => ({ n, label: `${n}x` }))
                ].map(({ n, label }) => {
                  const total    = Number(form.valorTotal) || 0
                  const pago     = Number(form.valorPago)  || 0
                  const restante = total - pago
                  const valorParc = n > 1 && restante > 0
                    ? fmt(Math.round((restante / n) * 100) / 100) : null
                  const selecionado = String(form.parcelas) === String(n)
                  return (
                    <button key={n} type="button" onClick={() => setForm(f => ({ ...f, parcelas: String(n) }))}
                      className={`flex w-full items-center justify-between border-b border-[#F0E6F6] px-4 py-2.5 text-left text-sm transition last:border-0 ${selecionado ? 'bg-[#9B5DE5] text-white' : 'hover:bg-[#FFF8FB] text-[#2D1B4E]'}`}>
                      <span className="font-semibold">{label}</span>
                      {valorParc && (
                        <span className={`text-[12px] font-bold ${selecionado ? 'text-white/80' : 'text-[#9B5DE5]'}`}>
                          {valorParc}/mês
                        </span>
                      )}
                      {selecionado && <span className="ml-2 text-white">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            <PreviewFinanceiro valorTotal={form.valorTotal} valorPago={form.valorPago} parcelas={form.parcelas} />

            <div className="col-span-2">
              <Campo label="Observações">
                <textarea className={`${inputClass()} resize-none`} rows={2} value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} placeholder="Detalhes adicionais..." />
              </Campo>
            </div>
          </div>

          {tentouSalvar && Object.keys(erros).length > 0 && (
            <div className="mb-4 rounded-2xl bg-[#FFE8F1] px-4 py-3 text-[12px] font-semibold text-[#C9365A]">
              ⚠️ {Object.values(erros)[0]}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setModalAberto(false)} className="flex-1 rounded-2xl border border-[#F0E6F6] py-2.5 text-sm font-bold text-[#8B7BAD] transition hover:bg-[#FFF8FB]">Cancelar</button>
            <button onClick={salvar} disabled={salvando} className="flex-2 rounded-2xl bg-[#9B5DE5] py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1] disabled:opacity-50">
              {salvando ? 'Salvando...' : eventoSelecionado ? 'Salvar alterações' : 'Criar reserva'}
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL — REMOVER */}
      {confirmandoDeletar && (
        <Modal titulo="Remover reserva" onClose={() => setConfirmandoDeletar(null)}>
          <p className="text-sm text-[#8B7BAD]">
            Tem certeza que deseja remover a reserva de{' '}
            <strong className="text-[#2D1B4E]">{new Date(confirmandoDeletar.data + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>
            {confirmandoDeletar.cliente && ` — ${confirmandoDeletar.cliente.nome}`}?
          </p>
          <p className="mt-2 text-[12px] text-[#C9365A]">⚠️ Os lançamentos financeiros vinculados também serão removidos.</p>
          <div className="mt-5 flex gap-3">
            <button onClick={() => setConfirmandoDeletar(null)} className="flex-1 rounded-2xl border border-[#F0E6F6] py-2.5 text-sm font-bold text-[#8B7BAD] transition hover:bg-[#FFF8FB]">Cancelar</button>
            <button onClick={() => deletar(confirmandoDeletar.id)} className="flex-2 rounded-2xl bg-[#EF476F] py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#d63860]">Sim, remover</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
