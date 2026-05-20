import { CardShell } from './CardShell.jsx'

export function UpcomingFestas({ events, onAction }) {
  return (
    <CardShell title="Próximas festas" icon="📅" actionLabel="Ver todas →" onAction={onAction}>
      <div className="divide-y divide-[#F0E6F6]">
        {events.map((event) => (
          <article key={event.name} className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#FFF8FB]">
            <div className="min-w-[52px] rounded-2xl border border-[#F0E6F6] bg-[#FFF8FB] px-2.5 py-2 text-center">
              <div
                className="text-[22px] font-extrabold leading-none text-[#9B5DE5]"
                style={{ fontFamily: '"Baloo 2", cursive' }}
              >
                {event.day}
              </div>
              <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8B7BAD]">
                {event.month}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-bold text-[#2D1B4E]">{event.name}</div>
              <div className="mt-1 text-[11px] text-[#8B7BAD]">{event.client}</div>

              <div className="mt-2 flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag.label}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${tag.className}`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${event.status.className}`}>
                {event.status.label}
              </span>
            </div>
          </article>
        ))}
      </div>
    </CardShell>
  )
}