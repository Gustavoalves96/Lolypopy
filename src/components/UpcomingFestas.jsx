import { CardShell } from './CardShell.jsx'
import { Icon } from './ui/Icon.jsx'

// Cores da caixa de data, alternadas por linha para dar o visual do design.
const ACCENTS = [
  { box: 'bg-[#FFEDF2]', num: 'text-[#FB5E89]', mon: 'text-[#FB8FB0]' },
  { box: 'bg-[#EFEAFF]', num: 'text-[#7B5CFA]', mon: 'text-[#A78FFB]' },
  { box: 'bg-[#FFF3DC]', num: 'text-[#E8930C]', mon: 'text-[#F0B450]' },
]

export function UpcomingFestas({ events, onAction }) {
  return (
    <CardShell title="Próximas festas" icon={<Icon name="sparkles" size={16} className="text-[#FB5E89]" />} iconBg="bg-[#FFEDF2]" actionLabel={<span className="inline-flex items-center gap-1">Ver todas <Icon name="arrowRight" size={14} /></span>} onAction={onAction}>
      {events.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <Icon name="calendar" size={32} className="mx-auto text-[#C4C0D8]" />
          <p className="mt-2 text-sm text-[#8B87A6]">Nenhuma festa nos próximos dias.</p>
        </div>
      ) : (
        <div>
          {events.map((event, i) => {
            const accent = ACCENTS[i % ACCENTS.length]
            return (
              <article key={event.name + event.day} className="flex items-center gap-[18px] border-b border-[#F6F4FC] px-6 py-4 transition last:border-0 hover:bg-[#FBFAFE]">
                <div className={`flex h-[58px] w-[54px] shrink-0 flex-col items-center justify-center rounded-[15px] leading-none ${accent.box}`}>
                  <span className={`text-[20px] font-extrabold ${accent.num}`}>{event.day}</span>
                  <span className={`mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] ${accent.mon}`}>{event.month}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-bold text-[#2C2752]">{event.name}</div>
                  <div className="mt-0.5 mb-2.5 text-[13px] text-[#9A96B4]">{event.client}</div>
                  <div className="flex flex-wrap gap-[7px]">
                    {event.tags.map((tag) => (
                      <span key={tag.label} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ${tag.className}`}>
                        {tag.icon && <Icon name={tag.icon} size={13} />}
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>

                <span className={`flex shrink-0 items-center gap-[7px] rounded-full px-3.5 py-[7px] text-[13px] font-bold ${event.status.className}`}>
                  <span className="h-[7px] w-[7px] rounded-full bg-current" />
                  {event.status.label}
                </span>
              </article>
            )
          })}
        </div>
      )}
    </CardShell>
  )
}
