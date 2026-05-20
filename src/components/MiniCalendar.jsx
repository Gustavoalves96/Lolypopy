import { CardShell } from './CardShell.jsx'

export function MiniCalendar({ month, grid, legend }) {
  return (
    <CardShell
      title={`Agenda de ${month.label}`}
      icon="📆"
      className="lg:col-span-1"
    >
      <div className="px-5 py-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div
            className="text-[15px] font-bold text-[#2D1B4E]"
            style={{ fontFamily: '"Baloo 2", cursive' }}
          >
            {month.name}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-xl border border-[#F0E6F6] bg-[#FFF8FB] text-sm text-[#2D1B4E] transition hover:bg-[#F7EEF9]"
            >
              ‹
            </button>
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-xl border border-[#F0E6F6] bg-[#FFF8FB] text-sm text-[#2D1B4E] transition hover:bg-[#F7EEF9]"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {month.weekdays.map((weekday) => (
            <div key={weekday} className="py-1 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#8B7BAD]">
              {weekday}
            </div>
          ))}

          {grid.map((day, index) => (
            <button
              type="button"
              key={`${day.label ?? 'empty'}-${index}`}
              disabled={day.empty}
              className={`rounded-xl py-1.5 text-center text-[12px] font-semibold transition ${day.className}`}
            >
              {day.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-[11px] font-semibold text-[#8B7BAD]">
          {legend.map((item) => (
            <span key={item.label} className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-[4px] ${item.dotClass}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </CardShell>
  )
}