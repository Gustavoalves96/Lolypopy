import { useState, useEffect, useCallback } from 'react'
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import { CardShell } from './CardShell.jsx'
import { Icon } from './ui/Icon.jsx'
import { apiFetch } from '../api.js'

const MESES_LABEL = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const MESES_FULL  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtYAxis = (v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`

const PIE_COLORS = ['#06D6A0', '#FFD166']

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #F0E6F6',
    borderRadius: 16,
    fontSize: 12,
    color: '#2D1B4E',
    boxShadow: '0 8px 30px rgba(45,27,78,0.10)',
  },
  cursor: { fill: 'rgba(155,93,229,0.05)' },
}

function getLast6Months(mes, ano) {
  const months = []
  for (let i = 5; i >= 0; i--) {
    let m = mes - i
    let a = ano
    while (m <= 0) { m += 12; a-- }
    months.push({ mes: m, ano: a })
  }
  return months
}

// ─── KPI colorido ────────────────────────────────────────────────────────────
function KpiBox({ icon, label, value, tone }) {
  const tones = {
    green:  { bg: 'bg-[#D7FBF3]', text: 'text-[#0B7A5E]',  iconBg: 'bg-[#A8F0DC] text-[#0B7A5E]'  },
    pink:   { bg: 'bg-[#FFE8F1]', text: 'text-[#C9365A]',  iconBg: 'bg-[#FFC2D4] text-[#C9365A]'  },
    purple: { bg: 'bg-[#EEE4FF]', text: 'text-[#6B35C1]',  iconBg: 'bg-[#D4BAFF] text-[#6B35C1]'  },
    yellow: { bg: 'bg-[#FFF5D6]', text: 'text-[#A07800]',  iconBg: 'bg-[#FFE59A] text-[#A07800]'  },
    teal:   { bg: 'bg-[#D7FBF3]', text: 'text-[#0B7A5E]',  iconBg: 'bg-[#A8F0DC] text-[#0B7A5E]'  },
  }
  const t = tones[tone] ?? tones.purple
  return (
    <div className={`flex flex-col gap-3 rounded-3xl ${t.bg} p-4`}>
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${t.iconBg}`}><Icon name={icon} size={18} /></div>
      <div
        className={`text-[22px] font-extrabold leading-none ${t.text}`}
        style={{ fontFamily: '"Baloo 2", cursive' }}
      >
        {value}
      </div>
      <div className={`text-[11px] font-semibold uppercase tracking-wide opacity-70 ${t.text}`}>{label}</div>
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-3xl bg-[#F0E6F6] ${className}`} />
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Relatorios() {
  const hoje = new Date()

  const [mes, setMes]             = useState(hoje.getMonth() + 1)
  const [ano, setAno]             = useState(hoje.getFullYear())
  const [resumo, setResumo]       = useState(null)
  const [historico, setHistorico] = useState([])
  const [loading, setLoading]     = useState(true)

  const isCurrentMonth = mes === hoje.getMonth() + 1 && ano === hoje.getFullYear()

  const carregarDados = useCallback(async () => {
    setLoading(true)
    try {
      const meses6 = getLast6Months(mes, ano)
      const resultados = await Promise.all(
        meses6.map(({ mes: m, ano: a }) =>
          apiFetch(`/financeiro/resumo?mes=${m}&ano=${a}`).then((r) => r.json()),
        ),
      )
      setResumo(resultados[resultados.length - 1])
      setHistorico(
        resultados.map((r, i) => ({
          name:     MESES_LABEL[meses6[i].mes - 1],
          Receitas: Number(r.totalReceitas),
          Despesas: Number(r.totalDespesas),
        })),
      )
    } catch (err) {
      console.error('Erro ao carregar relatório:', err)
    } finally {
      setLoading(false)
    }
  }, [mes, ano])

  useEffect(() => { carregarDados() }, [carregarDados])

  function prevMes() {
    if (mes === 1) { setMes(12); setAno((a) => a - 1) }
    else setMes((m) => m - 1)
  }
  function nextMes() {
    if (isCurrentMonth) return
    if (mes === 12) { setMes(1); setAno((a) => a + 1) }
    else setMes((m) => m + 1)
  }

  // Dados para o gráfico de rosca
  const pieData = resumo
    ? [
        { name: 'Recebido', value: Number(resumo.receitasPagas)     },
        { name: 'Pendente', value: Number(resumo.receitasPendentes) },
      ]
    : []
  const hasPieData = pieData.some((d) => d.value > 0)

  return (
    <div className="mx-auto flex w-full max-w-400 flex-col gap-5">

      {/* ── Seletor de mês ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMes}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[#F0E6F6] bg-white text-[#6B35C1] text-xl shadow-sm transition hover:bg-[#EEE4FF]"
          >
            ‹
          </button>
          <span
            className="min-w-[160px] text-center text-[17px] font-bold text-[#2D1B4E]"
            style={{ fontFamily: '"Baloo 2", cursive' }}
          >
            {MESES_FULL[mes - 1]} {ano}
          </span>
          <button
            onClick={nextMes}
            disabled={isCurrentMonth}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[#F0E6F6] bg-white text-[#6B35C1] text-xl shadow-sm transition hover:bg-[#EEE4FF] disabled:cursor-not-allowed disabled:opacity-30"
          >
            ›
          </button>
        </div>
        {isCurrentMonth && (
          <span className="rounded-xl bg-[#EEE4FF] px-3 py-1 text-[11px] font-bold text-[#6B35C1]">
            Mês atual
          </span>
        )}
      </div>

      {/* ── KPIs do período ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : resumo ? (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <KpiBox icon="sparkles"    label="Festas confirmadas" value={String(resumo.festasDoMes)}   tone="purple" />
          <KpiBox icon="cash"        label="Receita total"      value={fmt(resumo.totalReceitas)}     tone="green"  />
          <KpiBox icon="expense"     label="Despesas"           value={fmt(resumo.totalDespesas)}     tone="pink"   />
          <KpiBox icon="wallet"      label="Saldo"              value={fmt(resumo.saldo)}             tone={resumo.saldo >= 0 ? 'teal' : 'pink'} />
          <KpiBox icon="checkCircle" label="Adimplência"        value={`${resumo.taxaAdimplencia}%`} tone="yellow" />
        </div>
      ) : null}

      {/* ── Gráficos ────────────────────────────────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">

        {/* Barras — últimos 6 meses */}
        <CardShell title="Receitas × Despesas" icon={<Icon name="chart" size={16} className="text-[#7B5CFA]" />} iconBg="bg-[#EFEAFF]">
          <div className="px-5 py-5">
            {loading ? (
              <Skeleton className="h-56" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={historico} barCategoryGap="32%" barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E6F6" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#8B7BAD', fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={fmtYAxis}
                      tick={{ fontSize: 10, fill: '#8B7BAD' }}
                      axisLine={false}
                      tickLine={false}
                      width={54}
                    />
                    <RechartTooltip
                      formatter={(v) => fmt(v)}
                      {...TOOLTIP_STYLE}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11, color: '#8B7BAD', paddingTop: 10 }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Bar dataKey="Receitas" fill="#06D6A0" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Despesas" fill="#FF6B9D" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="mt-1 text-center text-[11px] text-[#8B7BAD]">Últimos 6 meses</p>
              </>
            )}
          </div>
        </CardShell>

        {/* Rosca — adimplência */}
        <CardShell title="Adimplência do Mês" icon={<Icon name="checkCircle" size={16} className="text-[#13B98A]" />} iconBg="bg-[#E2F7F0]">
          <div className="flex flex-col items-center px-5 py-5">
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : hasPieData ? (
              <>
                <div className="relative">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={84}
                        paddingAngle={3}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <RechartTooltip
                        formatter={(v) => fmt(v)}
                        contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #F0E6F6' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Valor central */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-[24px] font-extrabold text-[#2D1B4E]"
                      style={{ fontFamily: '"Baloo 2", cursive' }}
                    >
                      {resumo?.taxaAdimplencia ?? 0}%
                    </span>
                    <span className="text-[10px] font-semibold text-[#8B7BAD]">adimplência</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2 w-full">
                  {pieData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2 font-semibold text-[#2D1B4E]">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        {item.name}
                      </div>
                      <span className="font-bold text-[#2D1B4E]">{fmt(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-56 flex-col items-center justify-center gap-2 text-[#8B7BAD]">
                <Icon name="inbox" size={32} className="text-[#C4C0D8]" />
                <p className="text-sm font-semibold">Sem receitas neste mês</p>
              </div>
            )}
          </div>
        </CardShell>
      </div>
    </div>
  )
}
