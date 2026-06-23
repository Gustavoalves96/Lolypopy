import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { CardShell } from './CardShell.jsx'
import { Modal } from './ui/Modal.jsx'
import { Campo } from './ui/Campo.jsx'
import { inputClass } from './ui/inputClass.js'
import { SkeletonRows } from './ui/Skeleton.jsx'
import { apiFetch } from '../api.js'

// ─── Constantes ──────────────────────────────────────────────────────────────

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

const TIPO_CONFIG = {
  receita: { label: 'Receita', className: 'bg-[#D7FBF3] text-[#0B7A5E]', dot: 'bg-[#0B9B73]' },
  despesa: { label: 'Despesa', className: 'bg-[#FFE8F1] text-[#C9365A]', dot: 'bg-[#EF476F]' },
}

const STATUS_CONFIG = {
  pendente:  { label: 'Pendente',  className: 'bg-[#FFF5D6] text-[#A07800]' },
  pago:      { label: 'Pago',      className: 'bg-[#D7FBF3] text-[#0B7A5E]' },
  cancelado: { label: 'Cancelado', className: 'bg-[#F0E6F6] text-[#8B7BAD]' },
}

const CATEGORIA_LABELS = {
  sinal:                'Sinal',
  parcela:              'Parcela',
  pagamento_final:      'Pagamento final',
  despesa_operacional:  'Despesa operacional',
  outro:                'Outro',
}

const FORM_VAZIO = {
  tipo: 'receita',
  status: 'pendente',
  categoria: 'outro',
  descricao: '',
  valor: '',
  dataVencimento: '',
  dataPagamento: '',
  eventoId: '',
  clienteId: '',
  observacoes: '',
}

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function KpiBox({ icon, label, value, sub, tone }) {
  const tones = {
    green:  { bg: 'bg-[#D7FBF3]', text: 'text-[#0B7A5E]', iconBg: 'bg-[#A8F0DC]' },
    pink:   { bg: 'bg-[#FFE8F1]', text: 'text-[#C9365A]', iconBg: 'bg-[#FFC2D4]' },
    purple: { bg: 'bg-[#EEE4FF]', text: 'text-[#6B35C1]', iconBg: 'bg-[#D4BAFF]' },
    yellow: { bg: 'bg-[#FFF5D6]', text: 'text-[#A07800]', iconBg: 'bg-[#FFE59A]' },
  }
  const t = tones[tone] ?? tones.purple
  return (
    <div className={`flex flex-col gap-2 rounded-3xl ${t.bg} p-5`}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${t.iconBg} text-lg`}>
        {icon}
      </div>
      <div className={`text-[22px] font-extrabold ${t.text}`} style={{ fontFamily: '"Baloo 2", cursive' }}>
        {value}
      </div>
      <div className="text-[12px] font-semibold text-[#2D1B4E]">{label}</div>
      {sub && <div className="text-[11px] text-[#8B7BAD]">{sub}</div>}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Financeiro({ onNovoLancamento }) {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [aba, setAba] = useState('resumo') // 'resumo' | 'lancamentos'
  const [filtroTipo, setFiltroTipo] = useState('todos') // 'todos' | 'receita' | 'despesa'

  const [resumo, setResumo] = useState(null)
  const [lancamentos, setLancamentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [modalAberto, setModalAberto] = useState(false)
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState(null)
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [confirmandoDeletar, setConfirmandoDeletar] = useState(null)

  const carregar = useCallback(async () => {
    try {
      setCarregando(true)
      const [rResumo, rLanc, rCl, rEv] = await Promise.all([
        apiFetch(`/financeiro/resumo?mes=${mes}&ano=${ano}`),
        apiFetch(`/financeiro/lancamentos?mes=${mes}&ano=${ano}`),
        apiFetch(`/clientes`),
        apiFetch(`/eventos?mes=${mes}&ano=${ano}`),
      ])
      setResumo(rResumo.ok ? await rResumo.json() : null)
      setLancamentos(rLanc.ok ? await rLanc.json() : [])
      setClientes(rCl.ok ? await rCl.json() : [])
      setEventos(rEv.ok ? await rEv.json() : [])
    } catch {
      setLancamentos([])
    } finally {
      setCarregando(false)
    }
  }, [mes, ano])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    if (onNovoLancamento) abrirNovo()
  }, [onNovoLancamento])

  function abrirNovo() {
    setLancamentoSelecionado(null)
    setForm(FORM_VAZIO)
    setModalAberto(true)
  }

  function abrirEditar(l) {
    setLancamentoSelecionado(l)
    setForm({
      tipo: l.tipo || 'receita',
      status: l.status || 'pendente',
      categoria: l.categoria || 'outro',
      descricao: l.descricao || '',
      valor: l.valor || '',
      dataVencimento: l.dataVencimento || '',
      dataPagamento: l.dataPagamento || '',
      eventoId: l.evento?.id || '',
      clienteId: l.cliente?.id || '',
      observacoes: l.observacoes || '',
    })
    setModalAberto(true)
  }

  async function salvar() {
    if (!form.valor || !form.dataVencimento) return
    setSalvando(true)
    try {
      const payload = {
        ...form,
        valor: Number(form.valor),
        eventoId: form.eventoId ? Number(form.eventoId) : undefined,
        clienteId: form.clienteId ? Number(form.clienteId) : undefined,
        dataPagamento: form.dataPagamento || undefined,
      }
      const url = lancamentoSelecionado
        ? `/financeiro/lancamentos/${lancamentoSelecionado.id}`
        : `/financeiro/lancamentos`
      const method = lancamentoSelecionado ? 'PATCH' : 'POST'
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      await carregar()
      setModalAberto(false)
      toast.success(lancamentoSelecionado ? 'Lançamento atualizado!' : 'Lançamento criado!')
    } catch {
      toast.error('Erro ao salvar lançamento.')
    } finally {
      setSalvando(false)
    }
  }

  async function marcarPago(l) {
    try {
      await apiFetch(`/financeiro/lancamentos/${l.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'pago',
          dataPagamento: new Date().toISOString().split('T')[0],
        }),
      })
      await carregar()
      toast.success('Lançamento marcado como pago!')
    } catch {
      toast.error('Erro ao atualizar lançamento.')
    }
  }

  async function deletar(id) {
    try {
      await apiFetch(`/financeiro/lancamentos/${id}`, { method: 'DELETE' })
      await carregar()
      setConfirmandoDeletar(null)
      toast.success('Lançamento removido.')
    } catch {
      toast.error('Erro ao remover lançamento.')
    }
  }

  const navegarMes = (dir) => {
    let novoMes = mes + dir
    let novoAno = ano
    if (novoMes > 12) { novoMes = 1; novoAno++ }
    if (novoMes < 1)  { novoMes = 12; novoAno-- }
    setMes(novoMes)
    setAno(novoAno)
  }

  const lancamentosFiltrados = lancamentos.filter(
    (l) => filtroTipo === 'todos' || l.tipo === filtroTipo,
  )

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-5">

      {/* NAVEGAÇÃO DE MÊS */}
      <CardShell title="Financeiro" icon="💰">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => navegarMes(-1)}
            className="rounded-xl border border-[#F0E6F6] px-3 py-1.5 text-sm font-bold text-[#9B5DE5] hover:bg-[#EEE4FF]"
          >
            ← Anterior
          </button>
          <span
            className="text-[15px] font-extrabold text-[#2D1B4E]"
            style={{ fontFamily: '"Baloo 2", cursive' }}
          >
            {MESES[mes - 1]} {ano}
          </span>
          <button
            onClick={() => navegarMes(1)}
            className="rounded-xl border border-[#F0E6F6] px-3 py-1.5 text-sm font-bold text-[#9B5DE5] hover:bg-[#EEE4FF]"
          >
            Próximo →
          </button>
        </div>
      </CardShell>

      {/* KPIs DO MÊS */}
      {resumo && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KpiBox icon="🎉" label="Festas confirmadas" value={resumo.festasDoMes} tone="purple" />
          <KpiBox icon="💵" label="Receitas do mês" value={fmt(resumo.totalReceitas)} sub={`Pago: ${fmt(resumo.receitasPagas)}`} tone="green" />
          <KpiBox icon="✅" label="Adimplência" value={`${resumo.taxaAdimplencia}%`} sub={`Pendente: ${fmt(resumo.receitasPendentes)}`} tone={resumo.taxaAdimplencia >= 80 ? 'green' : 'yellow'} />
          <KpiBox icon="📤" label="Despesas do mês" value={fmt(resumo.totalDespesas)} sub={`Saldo: ${fmt(resumo.saldo)}`} tone={resumo.saldo >= 0 ? 'green' : 'pink'} />
        </div>
      )}

      {/* ABAS */}
      <div className="flex gap-2">
        {['resumo', 'lancamentos'].map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`rounded-2xl px-5 py-2 text-sm font-bold transition ${
              aba === a
                ? 'bg-[#9B5DE5] text-white shadow-lg shadow-[#9B5DE5]/20'
                : 'border border-[#F0E6F6] text-[#8B7BAD] hover:bg-[#EEE4FF]'
            }`}
          >
            {a === 'resumo' ? '📊 Resumo' : '📋 Lançamentos'}
          </button>
        ))}
        <button
          onClick={abrirNovo}
          className="ml-auto rounded-2xl bg-[#9B5DE5] px-5 py-2 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1]"
        >
          + Novo lançamento
        </button>
      </div>

      {/* ABA RESUMO */}
      {aba === 'resumo' && resumo && (
        <CardShell title={`Resumo — ${MESES[mes - 1]} ${ano}`} icon="📊">
          <div className="divide-y divide-[#F0E6F6]">
            {[
              { label: 'Total de receitas', value: fmt(resumo.totalReceitas), color: 'text-[#0B7A5E]' },
              { label: '↳ Receitas pagas', value: fmt(resumo.receitasPagas), color: 'text-[#0B7A5E]', sub: true },
              { label: '↳ Receitas pendentes', value: fmt(resumo.receitasPendentes), color: 'text-[#A07800]', sub: true },
              { label: 'Total de despesas', value: fmt(resumo.totalDespesas), color: 'text-[#C9365A]' },
              { label: 'Saldo do mês', value: fmt(resumo.saldo), color: resumo.saldo >= 0 ? 'text-[#0B7A5E]' : 'text-[#C9365A]' },
            ].map((row) => (
              <div key={row.label} className={`flex items-center justify-between px-5 py-3 ${row.sub ? 'bg-[#FAFAFE]' : ''}`}>
                <span className={`text-sm ${row.sub ? 'pl-4 text-[#8B7BAD]' : 'font-semibold text-[#2D1B4E]'}`}>
                  {row.label}
                </span>
                <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </CardShell>
      )}

      {/* ABA LANÇAMENTOS */}
      {aba === 'lancamentos' && (
        <>
          {/* Filtro tipo */}
          <div className="flex gap-2">
            {['todos', 'receita', 'despesa'].map((t) => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                  filtroTipo === t
                    ? 'bg-[#2D1B4E] text-white'
                    : 'border border-[#F0E6F6] text-[#8B7BAD] hover:bg-[#F0E6F6]'
                }`}
              >
                {t === 'todos' ? 'Todos' : t === 'receita' ? '💚 Receitas' : '🔴 Despesas'}
              </button>
            ))}
          </div>

          <CardShell
            title={`${lancamentosFiltrados.length} lançamento${lancamentosFiltrados.length !== 1 ? 's' : ''}`}
          >
            {carregando ? (
              <SkeletonRows />
            ) : lancamentosFiltrados.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="text-4xl">💰</div>
                <p className="mt-3 text-sm text-[#8B7BAD]">Nenhum lançamento em {MESES[mes - 1]}.</p>
                <button
                  onClick={abrirNovo}
                  className="mt-4 rounded-2xl bg-[#9B5DE5] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1]"
                >
                  + Criar lançamento
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#F0E6F6]">
                {lancamentosFiltrados.map((l) => {
                  const tipo = TIPO_CONFIG[l.tipo] ?? TIPO_CONFIG.receita
                  const status = STATUS_CONFIG[l.status] ?? STATUS_CONFIG.pendente
                  const vencimento = new Date(l.dataVencimento + 'T12:00:00')
                  const atrasado =
                    l.status === 'pendente' &&
                    vencimento < new Date() &&
                    l.tipo === 'receita'

                  return (
                    <div
                      key={l.id}
                      className={`flex items-start gap-4 px-5 py-4 transition hover:bg-[#FFF8FB] ${atrasado ? 'border-l-4 border-[#EF476F]' : ''}`}
                    >
                      {/* Indicador tipo */}
                      <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tipo.dot}`} />

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-bold text-[#2D1B4E]">
                            {l.descricao || CATEGORIA_LABELS[l.categoria] || '—'}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tipo.className}`}>
                            {tipo.label}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status.className}`}>
                            {status.label}
                          </span>
                          {atrasado && (
                            <span className="rounded-full bg-[#FFE8F1] px-2 py-0.5 text-[10px] font-bold text-[#C9365A]">
                              ⚠️ Atrasado
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-[#8B7BAD]">
                          <span>Vence: {vencimento.toLocaleDateString('pt-BR')}</span>
                          {l.cliente && <span>👪 {l.cliente.nome}</span>}
                          {l.evento && <span>🎉 Evento #{l.evento.id}</span>}
                          {l.categoria !== 'outro' && (
                            <span>📁 {l.descricao?.match(/Parcela \d+\/\d+/) ? l.descricao.match(/Parcela \d+\/\d+/)[0] : CATEGORIA_LABELS[l.categoria]}</span>
                          )}
                        </div>
                      </div>

                      {/* Valor + ações */}
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span
                          className={`text-[16px] font-extrabold ${l.tipo === 'receita' ? 'text-[#0B7A5E]' : 'text-[#C9365A]'}`}
                          style={{ fontFamily: '"Baloo 2", cursive' }}
                        >
                          {l.tipo === 'despesa' ? '−' : '+'}{fmt(l.valor)}
                        </span>
                        <div className="flex gap-1.5">
                          {l.status === 'pendente' && l.tipo === 'receita' && (
                            <button
                              onClick={() => marcarPago(l)}
                              className="rounded-xl border border-[#D7FBF3] bg-white px-2.5 py-1 text-[11px] font-bold text-[#0B7A5E] transition hover:bg-[#D7FBF3]"
                              title={l.categoria === 'parcela' ? 'Marcar apenas esta parcela como paga' : 'Marcar como pago'}
                            >
                              {l.categoria === 'parcela' ? '✓ Parcela paga' : '✓ Pago'}
                            </button>
                          )}
                          <button
                            onClick={() => abrirEditar(l)}
                            className="rounded-xl border border-[#F0E6F6] bg-white px-2.5 py-1 text-[11px] font-bold text-[#9B5DE5] transition hover:bg-[#EEE4FF]"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmandoDeletar(l)}
                            className="rounded-xl border border-[#FFE8F1] bg-white px-2.5 py-1 text-[11px] font-bold text-[#C9365A] transition hover:bg-[#FFE8F1]"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardShell>
        </>
      )}

      {/* MODAL — FORMULÁRIO */}
      {modalAberto && (
        <Modal
          titulo={lancamentoSelecionado ? 'Editar Lançamento' : 'Novo Lançamento'}
          onClose={() => setModalAberto(false)}
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Campo label="Tipo *">
              <select
                className={inputClass()}
                value={form.tipo}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
              >
                <option value="receita">💚 Receita</option>
                <option value="despesa">🔴 Despesa</option>
              </select>
            </Campo>

            <Campo label="Status *">
              <select
                className={inputClass()}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </Campo>

            <Campo label="Categoria">
              <select
                className={inputClass()}
                value={form.categoria}
                onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
              >
                <option value="sinal">Sinal</option>
                <option value="parcela">Parcela</option>
                <option value="pagamento_final">Pagamento final</option>
                <option value="despesa_operacional">Despesa operacional</option>
                <option value="outro">Outro</option>
              </select>
            </Campo>

            <Campo label="Valor (R$) *">
              <input
                className={inputClass()}
                type="number"
                min="0"
                step="0.01"
                value={form.valor}
                onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                placeholder="0,00"
                autoFocus
              />
            </Campo>

            <div className="col-span-2">
              <Campo label="Descrição">
                <input
                  className={inputClass()}
                  value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  placeholder="Ex: Sinal festa da Sofia"
                />
              </Campo>
            </div>

            <Campo label="Data de vencimento *">
              <input
                className={inputClass()}
                type="date"
                value={form.dataVencimento}
                onChange={(e) => setForm((f) => ({ ...f, dataVencimento: e.target.value }))}
              />
            </Campo>

            <Campo label="Data de pagamento">
              <input
                className={inputClass()}
                type="date"
                value={form.dataPagamento}
                onChange={(e) => setForm((f) => ({ ...f, dataPagamento: e.target.value }))}
              />
            </Campo>

            <div className="col-span-2">
              <Campo label="Cliente">
                <select
                  className={inputClass()}
                  value={form.clienteId}
                  onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value }))}
                >
                  <option value="">— Selecionar cliente —</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className="col-span-2">
              <Campo label="Vincular a evento">
                <select
                  className={inputClass()}
                  value={form.eventoId}
                  onChange={(e) => setForm((f) => ({ ...f, eventoId: e.target.value }))}
                >
                  <option value="">— Nenhum —</option>
                  {eventos.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.data} {e.temaFesta ? `— ${e.temaFesta}` : ''}{' '}
                      {e.cliente ? `(${e.cliente.nome})` : ''}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className="col-span-2">
              <Campo label="Observações">
                <textarea
                  className={`${inputClass()} resize-none`}
                  rows={2}
                  value={form.observacoes}
                  onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                  placeholder="Detalhes adicionais..."
                />
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
              disabled={!form.valor || !form.dataVencimento || salvando}
              className="flex-2 rounded-2xl bg-[#9B5DE5] py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1] disabled:opacity-50"
            >
              {salvando
                ? 'Salvando...'
                : lancamentoSelecionado
                ? 'Salvar alterações'
                : 'Criar lançamento'}
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL — CONFIRMAR REMOÇÃO */}
      {confirmandoDeletar && (
        <Modal titulo="Remover lançamento" onClose={() => setConfirmandoDeletar(null)}>
          <p className="text-sm text-[#8B7BAD]">
            Tem certeza que deseja remover o lançamento{' '}
            <strong className="text-[#2D1B4E]">
              {confirmandoDeletar.descricao || fmt(confirmandoDeletar.valor)}
            </strong>
            ?
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
