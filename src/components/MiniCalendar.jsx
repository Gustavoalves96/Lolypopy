import { useState, useEffect } from 'react'
import { CardShell } from './CardShell.jsx'
import { Icon } from './ui/Icon.jsx'
import { apiFetch } from '../api.js'

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]
const DIAS_SEMANA = ['D','S','T','Q','Q','S','S']

// Meses disponíveis: junho a dezembro do ano atual
const ANO = new Date().getFullYear()
const MESES_DISPONIVEIS = [6,7,8,9,10,11,12]

export function MiniCalendar({ onDiaClick }) {
  const mesAtual = new Date().getMonth() + 1
  const mesInicio = MESES_DISPONIVEIS.includes(mesAtual) ? mesAtual : 6
  const [mes, setMes] = useState(mesInicio)
  const [eventos, setEventos] = useState([])
  const [tooltip, setTooltip] = useState(null) // { dia, x, y }

  useEffect(() => {
    async function carregar() {
      try {
        const res = await apiFetch(`/eventos?mes=${mes}&ano=${ANO}`)
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
    <CardShell title={`Agenda de ${MESES[mes - 1].toLowerCase()}`} icon={<Icon name="calendar" size={16} className="text-[#7B5CFA]" />} iconBg="bg-[#EFEAFF]">
      <div className="px-6 py-5">

        {/* Cabeçalho com navegação */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="text-[15px] font-bold text-[#2C2752]">
            {MESES[mes - 1]} {ANO}
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={!podirAnterior}
              onClick={() => setMes(m => m - 1)}
              className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#ECE9F6] bg-white text-[15px] text-[#615D82] transition hover:bg-[#F6F4FD] disabled:opacity-30"
            >‹</button>
            <button
              type="button"
              disabled={!podirProximo}
              onClick={() => setMes(m => m + 1)}
              className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#ECE9F6] bg-white text-[15px] text-[#615D82] transition hover:bg-[#F6F4FD] disabled:opacity-30"
            >›</button>
          </div>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1.5">
          {DIAS_SEMANA.map((d, i) => (
            <div key={i} className="py-1 text-center text-[12px] font-bold text-[#B7B3CE]">
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

            let cellClass = 'relative flex h-10 items-center justify-center rounded-[11px] text-[14px] font-semibold transition cursor-default '

            if (ehHoje) {
              cellClass += 'bg-linear-to-br from-[#9B7BFF] to-[#7B5CFA] font-extrabold text-white shadow-[0_8px_16px_-6px_rgba(123,92,250,0.6)] '
            } else if (reservado) {
              cellClass += 'bg-[#FFEDF2] font-bold text-[#FB5E89] cursor-pointer hover:bg-[#ffdce7] '
            } else if (passado) {
              cellClass += 'text-[#C4C0D8] hover:bg-[#F4F2FD] '
            } else {
              cellClass += 'bg-[#E2F7F0] font-bold text-[#13B98A] hover:bg-[#cdf2e6] cursor-pointer '
            }

            const podeClicar = reservado || (!passado && !ehHoje)

            return (
              <div
                key={chave}
                className={cellClass}
                title={reservado ? nomes : ''}
                onClick={() => {
                  if (!onDiaClick || !podeClicar) return
                  onDiaClick(chave, diasReservados[chave] ?? [])
                }}
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
                  <span className="absolute bottom-1.5 left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#FB5E89]" />
                )}
              </div>
            )
          })}
        </div>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-4 text-[12px] font-semibold text-[#9A96B4]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#E2F7F0] ring-1 ring-[#13B98A]/25" />
            Dia livre
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#FFEDF2] ring-1 ring-[#FB5E89]/25" />
            Reservado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-linear-to-br from-[#9B7BFF] to-[#7B5CFA]" />
            Hoje
          </span>
        </div>

        {/* Resumo do mês */}
        {eventos.length > 0 && (
          <div className="mt-4 rounded-[14px] border border-[#ECE9F6] bg-[#FBFAFE] px-4 py-3">
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#9A96B4]">
              {eventos.length} reserva{eventos.length !== 1 ? 's' : ''} em {MESES[mes - 1]}
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {eventos.slice(0, 3).map((ev) => (
                <div key={ev.id} className="flex items-center gap-2 text-[12px]">
                  <span className="font-bold text-[#FB5E89]">
                    {new Date(ev.data + 'T12:00:00').getDate()}/{mes}
                  </span>
                  <span className="truncate font-semibold text-[#2C2752]">
                    {ev.cliente?.nome ?? ev.temaFesta ?? 'Reserva'}
                  </span>
                  {ev.horario && (
                    <span className="ml-auto shrink-0 text-[#9A96B4]">{ev.horario.slice(0,5)}</span>
                  )}
                </div>
              ))}
              {eventos.length > 3 && (
                <div className="text-[11px] text-[#9A96B4]">+ {eventos.length - 3} mais...</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tooltip flutuante */}
      {tooltip && (
        <div
          className="fixed z-50 flex max-w-50 items-center gap-1.5 rounded-2xl border border-[#ECE9F6] bg-white px-3 py-2 text-[12px] font-semibold text-[#2C2752] shadow-xl"
          style={{ top: tooltip.top, left: tooltip.left, pointerEvents: 'none' }}
        >
          <Icon name="calendar" size={13} className="shrink-0 text-[#7B5CFA]" /> {tooltip.dia}/{mes} — {tooltip.nomes}
        </div>
      )}
    </CardShell>
  )
}
