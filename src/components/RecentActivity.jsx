import { CardShell } from './CardShell.jsx'

export function RecentActivity({ items }) {
  return (
    <CardShell title="Atividade recente" icon="🕐" className="lg:col-span-1">
      {!items || items.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="text-3xl">🕐</div>
          <p className="mt-2 text-sm text-[#8B7BAD]">Nenhuma atividade registrada.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#F0E6F6]">
          {items.map((item) => (
            <article key={item.description} className="flex items-start gap-3 px-5 py-3.5">
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[15px] ${item.iconClass}`}>
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] leading-5 text-[#2D1B4E]">{item.description}</div>
                <div className="mt-1 text-[10px] text-[#8B7BAD]">{item.time}</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </CardShell>
  )
}
