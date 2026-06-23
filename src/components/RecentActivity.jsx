import { CardShell } from './CardShell.jsx'
import { Icon } from './ui/Icon.jsx'

export function RecentActivity({ items }) {
  return (
    <CardShell title="Atividade recente" icon={<Icon name="activity" size={16} className="text-[#13B98A]" />} iconBg="bg-[#E2F7F0]" className="lg:col-span-1">
      {!items || items.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <Icon name="clock" size={32} className="mx-auto text-[#C4C0D8]" />
          <p className="mt-2 text-sm text-[#8B87A6]">Nenhuma atividade registrada.</p>
        </div>
      ) : (
        <div>
          {items.map((item) => (
            <article key={item.description} className="flex items-start gap-3.5 border-b border-[#F6F4FC] px-6 py-[15px] last:border-0">
              <div className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[11px] ${item.iconClass}`}>
                <Icon name={item.icon} size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium leading-snug text-[#2C2752]">{item.description}</div>
                <div className="mt-0.5 text-[12px] text-[#9A96B4]">{item.time}</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </CardShell>
  )
}
