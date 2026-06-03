import { useState, useEffect } from 'react'
import { CardShell } from './CardShell.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]
const DIAS_SEMANA = ['D','S','T','Q','Q','S','S']

// Meses disponíveis: junho a dezembro do ano atual
const ANO = new Date().getFullYear()
const MESES_DISPONIVEIS = [6,7,8,9,10,11,12]

export function MiniCalendar() {
  const mesAtual = new Date().getMonth() + 1
  const mesInicio = MESES_DISPONIVEIS.includes(mesAtual) ? mesAtual : 6
  const [mes, setMes] = useState(mesInicio)
  const [eventos, setEventos] = useState([])
  const [tooltip, setTooltip] = useState(null) // { dia, x, y }

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`${API_URL}/eventos?mes=${mes}&ano=${ANO}`)
        if (res.ok) setEventos(await res.json())
        else setEventos([])
      } catch {
        setEventos([])
      }
    }
    carregar()
  }, [mes])

  // Monta mapa de dias reservados: { '2026-06-15': [evento, ...] }
  const diasReservados = {}
  eventos.forEach((ev) => {
    const chave = ev.data?.split('T')[0]
    if (!chave) return
    if (!diasReservados[chave]) diasReservados[chave] = []
    diasReservados[chave].push(ev)
  })

  // Gera o grid do mês
  const primeiroDia = new Date(ANO, mes - 1, 1).getDay() // 0=dom
  const totalDias = new Date(ANO, mes, 0).getDate()
  const hoje = new Date()
  const hojeStr = `${ANO}-${String(mes).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`

  const grid = [
    ...Array(primeiroDia).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ]

  const podirAnterior = mes > MESES_DISPONIVEIS[0]
  const podirProximo  = mes < MESES_DISPONIVEIS[MESES_DISPONIVEIS.length - 1]

  function diaKey(dia) {
    return `${ANO}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
  }

  function nomesClientes(dia) {
    const evs = diasReservados[diaKey(dia)] ?? []
    return evs.map(ev => ev.cliente?.nome ?? ev.temaFesta ?? 'Reservado').join(', ')
  }

  return (
    <CardShell title={`Agenda de ${MESES[mes - 1].toLowerCase()}`} icon="📆" className="lg:col-span-1">
      <div className="px-5 py-4">

        {/* Cabeçalho com navegação */}
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="text-[15px] font-bold text-[#2D1B4E]" style={{ fontFamily: '"Baloo 2", cursive' }}>
            {MESES[mes - 1]} {ANO}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!podirAnterior}
              onClick={() => setMes(m => m - 1)}
              className="grid h-8 w-8 place-items-center rounded-xl border border-[#F0E6F6] bg-[#FFF8FB] text-sm text-[#2D1B4E] transition hover:bg-[#F7EEF9] disabled:opacity-30"
            >‹</button>
            <button
              type="button"
              disabled={!podirProximo}
              onClick={() => setMes(m => m + 1)}
              className="grid h-8 w-8 place-items-center rounded-xl border border-[#F0E6F6] bg-[#FFF8FB] text-sm text-[#2D1B4E] transition hover:bg-[#F7EEF9] disabled:opacity-30"
            >›</button>
          </div>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1">
          {DIAS_SEMANA.map((d, i) => (
            <div key={i} className="py-1 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#8B7BAD]">
              {d}
            </div>
          ))}

          {/* Células do grid */}
          {grid.map((dia, idx) => {
            if (!dia) {
              return <div key={`e-${idx}`} />
            }

            const chave = diaKey(dia)
            const reservado = !!diasReservados[chave]
            const ehHoje = chave === hojeStr
            const nomes = reservado ? nomesClientes(dia) : ''
            const passado = new Date(ANO, mes - 1, dia) < new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())

            let cellClass = 'relative rounded-xl py-1.5 text-center text-[12px] font-semibold transition cursor-default '

            if (ehHoje) {
              cellClass += 'bg-[#9B5DE5] text-white shadow-lg shadow-[#9B5DE5]/25 '
            } else if (reservado) {
              cellClass += 'bg-[#FFE8F1] text-[#C9365A] ring-1 ring-[#EF476F]/30 cursor-pointer hover:bg-[#ffd6e4] '
            } else if (passado) {
              cellClass += 'text-[#c4b8d4] '
            } else {
              cellClass += 'bg-[#D7FBF3] text-[#0B7A5E] hover:bg-[#bbf5e8] cursor-pointer '
            }

            return (
              <div
                key={chave}
                className={cellClass}
                title={reservado ? nomes : ''}
                onMouseEnter={(e) => {
                  if (reservado) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltip({ dia, nomes, top: rect.bottom + 6, left: rect.left })
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {dia}
                {reservado && (
                  <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#EF476F]" />
                )}
              </div>
            )
          })}
        </div>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-4 text-[11px] font-semibold text-[#8B7BAD]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-[4px] bg-[#D7FBF3] ring-1 ring-[#0B7A5E]/20" />
            Dia livre
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-[4px] bg-[#FFE8F1] ring-1 ring-[#EF476F]/20" />
            Reservado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-[4px] bg-[#9B5DE5]" />
            Hoje
          </span>
        </div>

        {/* Resumo do mês */}
        {eventos.length > 0 && (
          <div className="mt-4 rounded-2xl border border-[#F0E6F6] bg-[#FFF8FB] px-4 py-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8B7BAD]">
              {eventos.length} reserva{eventos.length !== 1 ? 's' : ''} em {MESES[mes - 1]}
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {eventos.slice(0, 3).map((ev) => (
                <div key={ev.id} className="flex items-center gap-2 text-[12px]">
                  <span className="font-bold text-[#C9365A]">
                    {new Date(ev.data + 'T12:00:00').getDate()}/{mes}
                  </span>
                  <span className="text-[#2D1B4E] font-semibold truncate">
                    {ev.cliente?.nome ?? ev.temaFesta ?? 'Reserva'}
                  </span>
                  {ev.horario && (
                    <span className="ml-auto shrink-0 text-[#8B7BAD]">{ev.horario.slice(0,5)}</span>
                  )}
                </div>
              ))}
              {eventos.length > 3 && (
                <div className="text-[11px] text-[#8B7BAD]">+ {eventos.length - 3} mais...</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tooltip flutuante */}
      {tooltip && (
        <div
          className="fixed z-50 max-w-[200px] rounded-2xl border border-[#F0E6F6] bg-white px-3 py-2 text-[12px] font-semibold text-[#2D1B4E] shadow-xl"
          style={{ top: tooltip.top, left: tooltip.left, pointerEvents: 'none' }}
        >
          📅 {tooltip.dia}/{mes} — {tooltip.nomes}
        </div>
      )}
    </CardShell>
  )
}
