import { useState, useEffect, useRef } from 'react'
import { CardShell } from './CardShell.jsx'
import { apiFetch } from '../api.js'

const STATUS_CONFIG = {
  pendente:  { label: 'Pendente',  className: 'bg-[#FFF5D6] text-[#A07800]' },
  assinado:  { label: 'Assinado',  className: 'bg-[#D7FBF3] text-[#0B7A5E]' },
  cancelado: { label: 'Cancelado', className: 'bg-[#FFE8F1] text-[#C9365A]' },
}

const FORM_VAZIO = {
  clienteId: '', data: '', valor: '', status: 'pendente', observacoes: '',
}

function Modal({ titulo, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(45,27,78,0.18)]">
        <div className="flex items-center justify-between border-b border-[#F0E6F6] px-6 py-4">
          <h3 className="text-[16px] font-bold text-[#2D1B4E]" style={{ fontFamily: '"Baloo 2", cursive' }}>{titulo}</h3>
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

const inputClass = 'w-full rounded-2xl border border-[#F0E6F6] bg-[#FFF8FB] px-4 py-2.5 text-sm text-[#2D1B4E] outline-none transition focus:border-[#9B5DE5] focus:ring-2 focus:ring-[#9B5DE5]/20'

export default function Contratos({ onNovoContrato }) {
  const [contratos, setContratos] = useState([])
  const [clientes, setClientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [contratoSelecionado, setContratoSelecionado] = useState(null)
  const [form, setForm] = useState(FORM_VAZIO)
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [confirmandoDeletar, setConfirmandoDeletar] = useState(null)
  const inputRef = useRef()

  async function carregar() {
    try {
      setCarregando(true)
      const [rCont, rCli] = await Promise.all([
        apiFetch(`/contratos`),
        apiFetch(`/clientes`),
      ])
      setContratos(rCont.ok ? await rCont.json() : [])
      setClientes(rCli.ok ? await rCli.json() : [])
    } catch { setContratos([]) }
    finally { setCarregando(false) }
  }

  useEffect(() => { carregar() }, [])
  useEffect(() => { if (onNovoContrato) abrirNovo() }, [onNovoContrato])

  function abrirNovo() {
    setContratoSelecionado(null)
    setForm(FORM_VAZIO)
    setArquivoSelecionado(null)
    setProgresso(0)
    setModalAberto(true)
  }

  function abrirEditar(contrato) {
    setContratoSelecionado(contrato)
    setForm({
      clienteId: contrato.cliente?.id || '',
      data: contrato.data || '',
      valor: contrato.valor || '',
      status: contrato.status || 'pendente',
      observacoes: contrato.observacoes || '',
    })
    setArquivoSelecionado(null)
    setProgresso(0)
    setModalAberto(true)
  }

  async function salvar() {
    if (!form.clienteId || !form.data || !form.valor) return
    setSalvando(true)
    setProgresso(0)
    try {
      const payload = {
        ...form,
        clienteId: Number(form.clienteId),
        valor: Number(form.valor),
      }
      const url = contratoSelecionado ? `/contratos/${contratoSelecionado.id}` : `/contratos`
      const method = contratoSelecionado ? 'PATCH' : 'POST'
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      const contratoSalvo = await res.json()

      if (arquivoSelecionado) {
        const intervalo = setInterval(() => setProgresso(p => p < 85 ? p + 15 : p), 200)
        const formData = new FormData()
        formData.append('arquivo', arquivoSelecionado)
        const resUpload = await apiFetch(`/contratos/${contratoSalvo.id}/upload`, {
          method: 'POST',
          body: formData,
        })
        clearInterval(intervalo)
        setProgresso(100)
        if (!resUpload.ok) throw new Error('Contrato salvo, mas falhou o upload do PDF.')
      }

      await carregar()
      setModalAberto(false)
    } catch (e) {
      alert(e.message || 'Erro ao salvar contrato.')
    } finally {
      setSalvando(false)
    }
  }

  async function deletar(id) {
    try {
      await apiFetch(`/contratos/${id}`, { method: 'DELETE' })
      await carregar()
      setConfirmandoDeletar(null)
    } catch { alert('Erro ao remover contrato.') }
  }

  // Cálculos separados por status
  const valorAssinados = contratos
    .filter(c => c.status === 'assinado')
    .reduce((acc, c) => acc + Number(c.valor || 0), 0)

  const valorPendentes = contratos
    .filter(c => c.status === 'pendente')
    .reduce((acc, c) => acc + Number(c.valor || 0), 0)

  const totalAssinados = contratos.filter(c => c.status === 'assinado').length

  const podeSalvar = form.clienteId && form.data && form.valor && !salvando

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-5">

      {/* CARDS RESUMO */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total de contratos', valor: contratos.length, icon: '📄', cor: '#6366f1' },
          { label: 'Assinados', valor: totalAssinados, icon: '✅', cor: '#059669' },
          { label: 'Valor assinados', valor: `R$ ${valorAssinados.toFixed(2).replace('.', ',')}`, icon: '💰', cor: '#059669' },
          { label: 'Valor pendente', valor: `R$ ${valorPendentes.toFixed(2).replace('.', ',')}`, icon: '⏳', cor: '#f59e0b' },
        ].map(card => (
          <div key={card.label} className="flex items-center gap-3 rounded-[20px] border border-[#F0E6F6] bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: card.cor + '18' }}>{card.icon}</div>
            <div>
              <div className="text-[20px] font-extrabold leading-tight" style={{ color: card.cor }}>{card.valor}</div>
              <div className="text-[11px] text-[#8B7BAD]">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* LISTA */}
      <CardShell title="Contratos" icon="📄">
        {carregando ? (
          <div className="px-5 py-10 text-center text-sm text-[#8B7BAD]">Carregando contratos...</div>
        ) : contratos.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="text-4xl">📄</div>
            <p className="mt-3 text-sm text-[#8B7BAD]">Nenhum contrato cadastrado ainda.</p>
            <button onClick={abrirNovo} className="mt-4 rounded-2xl bg-[#9B5DE5] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1]">
              + Criar primeiro contrato
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#F0E6F6]">
            {contratos.map(contrato => {
              const status = STATUS_CONFIG[contrato.status] ?? STATUS_CONFIG.pendente
              return (
                <div key={contrato.id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#FFF8FB]">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${contrato.arquivoUrl ? 'bg-[#D7FBF3]' : 'bg-[#F0E6F6]'}`}>
                    {contrato.arquivoUrl ? '📄' : '📝'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-bold text-[#2D1B4E]">{contrato.cliente?.nome ?? 'Sem cliente'}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${status.className}`}>{status.label}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-4 text-[12px] text-[#8B7BAD]">
                      <span>📅 {new Date(contrato.data + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                      <span>💰 R$ {Number(contrato.valor).toFixed(2).replace('.', ',')}</span>
                      {contrato.arquivoUrl
                        ? <a href={contrato.arquivoUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#9B5DE5] hover:underline">📎 Ver PDF</a>
                        : <span className="text-[#f59e0b]">⚠ Sem PDF</span>
                      }
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <button onClick={() => abrirEditar(contrato)} className="rounded-xl border border-[#F0E6F6] bg-white px-3 py-1.5 text-xs font-bold text-[#9B5DE5] transition hover:bg-[#EEE4FF]">Editar</button>
                    <button onClick={() => setConfirmandoDeletar(contrato)} className="rounded-xl border border-[#FFE8F1] bg-white px-3 py-1.5 text-xs font-bold text-[#C9365A] transition hover:bg-[#FFE8F1]">Remover</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardShell>

      {/* MODAL — FORMULÁRIO + UPLOAD */}
      {modalAberto && (
        <Modal titulo={contratoSelecionado ? 'Editar Contrato' : 'Novo Contrato'} onClose={() => setModalAberto(false)}>
          <div className="grid grid-cols-2 gap-x-4">
            <div className="col-span-2">
              <Campo label="Cliente *">
                <select
                  className={`${inputClass} ${!form.clienteId ? 'border-[#f59e0b]' : ''}`}
                  value={form.clienteId}
                  onChange={e => setForm(f => ({ ...f, clienteId: e.target.value }))}
                >
                  <option value="">— Selecionar cliente (obrigatório) —</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                {!form.clienteId && (
                  <p className="mt-1 text-[11px] text-[#f59e0b] font-semibold">⚠ Selecione um cliente para continuar</p>
                )}
              </Campo>
            </div>
            <Campo label="Data *">
              <input className={inputClass} type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
            </Campo>
            <Campo label="Valor (R$) *">
              <input className={inputClass} type="number" min="0" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="0,00" />
            </Campo>
            <Campo label="Status">
              <select className={inputClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="pendente">Pendente</option>
                <option value="assinado">Assinado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </Campo>
            <div />
            <div className="col-span-2">
              <Campo label="Observações">
                <textarea className={`${inputClass} resize-none`} rows={2} value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} placeholder="Detalhes adicionais..." />
              </Campo>
            </div>

            {/* UPLOAD PDF */}
            <div className="col-span-2">
              <Campo label="Arquivo PDF (opcional)">
                {!arquivoSelecionado ? (
                  <div onClick={() => inputRef.current?.click()}
                    className="cursor-pointer rounded-2xl border-2 border-dashed border-[#D8C8F0] bg-[#FFF8FB] py-6 text-center transition hover:border-[#9B5DE5] hover:bg-[#F7EEF9]">
                    <div className="text-3xl">📎</div>
                    <div className="mt-2 text-sm font-semibold text-[#2D1B4E]">Clique para anexar o PDF</div>
                    <div className="mt-0.5 text-[11px] text-[#8B7BAD]">Apenas PDF · Máximo 10MB</div>
                    <input ref={inputRef} type="file" accept=".pdf" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) setArquivoSelecionado(f); e.target.value = '' }} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl border border-[#D7FBF3] bg-[#F0FDF9] px-4 py-3">
                    <span className="text-2xl">📄</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-bold text-[#2D1B4E]">{arquivoSelecionado.name}</div>
                      <div className="text-[11px] text-[#8B7BAD]">{(arquivoSelecionado.size / 1024).toFixed(0)} KB</div>
                    </div>
                    {!salvando && (
                      <button onClick={() => setArquivoSelecionado(null)} className="text-lg text-[#8B7BAD] hover:text-[#C9365A]">×</button>
                    )}
                  </div>
                )}

                {salvando && arquivoSelecionado && progresso > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#e5e7eb]">
                      <div className="h-full rounded-full bg-[#9B5DE5] transition-all duration-300" style={{ width: `${progresso}%` }} />
                    </div>
                    <div className="mt-1 text-[11px] font-bold text-[#9B5DE5]">
                      {progresso < 100 ? 'Enviando PDF...' : '✓ PDF enviado!'}
                    </div>
                  </div>
                )}

                {contratoSelecionado?.arquivoUrl && !arquivoSelecionado && (
                  <div className="mt-2 flex items-center gap-2 text-[12px] text-[#8B7BAD]">
                    <span>PDF atual:</span>
                    <a href={contratoSelecionado.arquivoUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#9B5DE5] hover:underline">Ver PDF atual</a>
                    <span>· selecione um novo para substituir</span>
                  </div>
                )}
              </Campo>
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            <button onClick={() => setModalAberto(false)} className="flex-1 rounded-2xl border border-[#F0E6F6] py-2.5 text-sm font-bold text-[#8B7BAD] transition hover:bg-[#FFF8FB]">Cancelar</button>
            <button onClick={salvar} disabled={!podeSalvar}
              className="flex-2 rounded-2xl py-2.5 text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: podeSalvar ? 'linear-gradient(135deg,#f472b6,#9B5DE5)' : '#e5e7eb', color: podeSalvar ? '#fff' : '#9ca3af' }}>
              {salvando ? (arquivoSelecionado && progresso > 0 ? 'Enviando PDF...' : 'Salvando...') : contratoSelecionado ? 'Salvar alterações' : 'Criar contrato'}
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL — CONFIRMAR REMOÇÃO */}
      {confirmandoDeletar && (
        <Modal titulo="Remover contrato" onClose={() => setConfirmandoDeletar(null)}>
          <p className="text-sm text-[#8B7BAD]">
            Tem certeza que deseja remover o contrato de{' '}
            <strong className="text-[#2D1B4E]">{confirmandoDeletar.cliente?.nome ?? 'este cliente'}</strong>?
            {confirmandoDeletar.arquivoUrl && ' O PDF também será deletado.'}
          </p>
          <div className="mt-5 flex gap-3">
            <button onClick={() => setConfirmandoDeletar(null)} className="flex-1 rounded-2xl border border-[#F0E6F6] py-2.5 text-sm font-bold text-[#8B7BAD] transition hover:bg-[#FFF8FB]">Cancelar</button>
            <button onClick={() => deletar(confirmandoDeletar.id)} className="flex-2 rounded-2xl bg-[#EF476F] py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#d63860]">Sim, remover</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
