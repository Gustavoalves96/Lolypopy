import { useState, useEffect } from 'react'
import { CardShell } from './CardShell.jsx'
import { apiFetch } from '../api.js'

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function BadgeAtrasado({ dias }) {
  if (dias <= 7)  return <span className="rounded-full bg-[#FFF5D6] px-2 py-0.5 text-[10px] font-bold text-[#A07800]">{dias}d de atraso</span>
  if (dias <= 30) return <span className="rounded-full bg-[#FFE8F1] px-2 py-0.5 text-[10px] font-bold text-[#C9365A]">{dias}d de atraso</span>
  return <span className="rounded-full bg-[#EF476F] px-2 py-0.5 text-[10px] font-bold text-white">{dias}d de atraso</span>
}

function diasDeAtraso(dataStr) {
  const venc = new Date(dataStr + 'T12:00:00')
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((hoje - venc) / 86400000))
}

export default function PendenciasPage({ onVerFinanceiro }) {
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [marcando, setMarcando] = useState(null)

  async function carregar() {
    try {
      setCarregando(true)
      const res = await apiFetch('/financeiro/pendencias')
      setDados(res.ok ? await res.json() : null)
    } catch {
      setDados(null)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function marcarPago(lancamentoId) {
    setMarcando(lancamentoId)
    try {
      await apiFetch(`/financeiro/lancamentos/${lancamentoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'pago',
          dataPagamento: new Date().toISOString().split('T')[0],
        }),
      })
      await carregar()
    } catch {
      alert('Erro ao atualizar lançamento.')
    } finally {
      setMarcando(null)
    }
  }

  const totalGeral =
    (dados?.totalPendenteEmLancamentos ?? 0) +
    (dados?.totalDebtEmEventos ?? 0)

  const qtdTotal =
    (dados?.lancamentosAtrasados?.length ?? 0) +
    (dados?.eventosComDebt?.length ?? 0)

  if (carregando) {
    return (
      <div className="mx-auto flex w-full max-w-300 flex-col gap-5">
        <CardShell title="Pendências" icon="⚠️">
          <div className="px-5 py-10 text-center text-sm text-[#8B7BAD]">
            Carregando pendências...
          </div>
        </CardShell>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-5">

      {/* RESUMO TOPO */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-3xl bg-[#FFE8F1] p-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#C9365A]">Total em aberto</div>
          <div
            className="text-[24px] font-extrabold text-[#C9365A]"
            style={{ fontFamily: '"Baloo 2", cursive' }}
          >
            {fmt(totalGeral)}
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-3xl bg-[#FFF5D6] p-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A07800]">Itens pendentes</div>
          <div
            className="text-[24px] font-extrabold text-[#A07800]"
            style={{ fontFamily: '"Baloo 2", cursive' }}
          >
            {qtdTotal} {qtdTotal === 1 ? 'item' : 'itens'}
          </div>
        </div>
        {onVerFinanceiro && (
          <div className="flex items-center rounded-3xl bg-[#EEE4FF] p-5">
            <button
              onClick={onVerFinanceiro}
              className="w-full rounded-2xl bg-[#9B5DE5] py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1]"
            >
              Ver módulo financeiro →
            </button>
          </div>
        )}
      </div>

      {qtdTotal === 0 ? (
        <CardShell title="Pendências" icon="⚠️">
          <div className="px-5 py-14 text-center">
            <div className="text-5xl">🎉</div>
            <p className="mt-3 text-sm font-semibold text-[#0B7A5E]">
              Nenhuma pendência em aberto!
            </p>
            <p className="mt-1 text-xs text-[#8B7BAD]">Todos os pagamentos estão em dia.</p>
          </div>
        </CardShell>
      ) : (
        <>
          {/* LANÇAMENTOS ATRASADOS */}
          {dados?.lancamentosAtrasados?.length > 0 && (
            <CardShell
              title={`${dados.lancamentosAtrasados.length} lançamento${dados.lancamentosAtrasados.length !== 1 ? 's' : ''} atrasado${dados.lancamentosAtrasados.length !== 1 ? 's' : ''}`}
              icon="📋"
            >
              <div className="divide-y divide-[#F0E6F6]">
                {dados.lancamentosAtrasados.map((l) => {
                  const dias = diasDeAtraso(l.dataVencimento)
                  return (
                    <div
                      key={l.id}
                      className="flex items-start gap-4 border-l-4 border-[#EF476F] px-5 py-4 transition hover:bg-[#FFF8FB]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-bold text-[#2D1B4E]">
                            {l.descricao || l.categoria || 'Lançamento'}
                          </span>
                          <BadgeAtrasado dias={dias} />
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-[#8B7BAD]">
                          <span>
                            Venceu:{' '}
                            {new Date(l.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </span>
                          {l.cliente && <span>👪 {l.cliente.nome}</span>}
                          {l.evento && <span>🎉 Evento {l.evento.data}</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span
                          className="text-[16px] font-extrabold text-[#C9365A]"
                          style={{ fontFamily: '"Baloo 2", cursive' }}
                        >
                          {fmt(l.valor)}
                        </span>
                        <button
                          onClick={() => marcarPago(l.id)}
                          disabled={marcando === l.id}
                          className="rounded-xl border border-[#D7FBF3] bg-white px-3 py-1 text-[11px] font-bold text-[#0B7A5E] transition hover:bg-[#D7FBF3] disabled:opacity-50"
                        >
                          {marcando === l.id ? '...' : '✓ Marcar pago'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Subtotal lançamentos */}
              <div className="flex items-center justify-between border-t border-[#F0E6F6] bg-[#FFF8FB] px-5 py-3">
                <span className="text-[12px] font-bold text-[#8B7BAD]">Subtotal lançamentos</span>
                <span className="text-[14px] font-extrabold text-[#C9365A]">
                  {fmt(dados.totalPendenteEmLancamentos)}
                </span>
              </div>
            </CardShell>
          )}

          {/* EVENTOS COM SALDO DEVEDOR */}
          {dados?.eventosComDebt?.length > 0 && (
            <CardShell
              title={`${dados.eventosComDebt.length} evento${dados.eventosComDebt.length !== 1 ? 's' : ''} com saldo em aberto`}
              icon="🎉"
            >
              <div className="divide-y divide-[#F0E6F6]">
                {dados.eventosComDebt.map((e) => {
                  const saldo = Number(e.valorTotal) - Number(e.valorPago)
                  const pct = Number(e.valorTotal) > 0
                    ? Math.round((Number(e.valorPago) / Number(e.valorTotal)) * 100)
                    : 0
                  const dias = diasDeAtraso(e.data)

                  return (
                    <div
                      key={e.id}
                      className="flex items-start gap-4 border-l-4 border-[#FFD166] px-5 py-4 transition hover:bg-[#FFF8FB]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-bold text-[#2D1B4E]">
                            {e.temaFesta ? `🎉 ${e.temaFesta}` : `Evento ${e.data}`}
                          </span>
                          <BadgeAtrasado dias={dias} />
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-[#8B7BAD]">
                          <span>
                            Data:{' '}
                            {new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </span>
                          {e.cliente && <span>👪 {e.cliente.nome}</span>}
                        </div>

                        {/* Barra de progresso */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F0E6F6]">
                            <div
                              className="h-full rounded-full bg-[#9B5DE5] transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-[#8B7BAD]">{pct}% pago</span>
                        </div>

                        <div className="mt-1.5 flex gap-3 text-[12px]">
                          <span className="text-[#0B7A5E]">
                            Pago: <strong>{fmt(e.valorPago)}</strong>
                          </span>
                          <span className="text-[#2D1B4E]">
                            Total: <strong>{fmt(e.valorTotal)}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span
                          className="text-[16px] font-extrabold text-[#A07800]"
                          style={{ fontFamily: '"Baloo 2", cursive' }}
                        >
                          {fmt(saldo)}
                        </span>
                        <span className="text-[10px] text-[#8B7BAD]">em aberto</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Subtotal eventos */}
              <div className="flex items-center justify-between border-t border-[#F0E6F6] bg-[#FFF8FB] px-5 py-3">
                <span className="text-[12px] font-bold text-[#8B7BAD]">Subtotal eventos</span>
                <span className="text-[14px] font-extrabold text-[#A07800]">
                  {fmt(dados.totalDebtEmEventos)}
                </span>
              </div>
            </CardShell>
          )}
        </>
      )}
    </div>
  )
}
