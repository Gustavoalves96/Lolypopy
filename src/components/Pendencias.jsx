import { CardShell } from './CardShell.jsx'
import { Icon } from './ui/Icon.jsx'

export function Pendencias({ items, onAction }) {
  return (
    <CardShell title="Pendências" icon={<Icon name="alert" size={16} className="text-[#E8930C]" />} iconBg="bg-[#FFF3DC]" actionLabel={<span className="inline-flex items-center gap-1">Ver todas <Icon name="arrowRight" size={14} /></span>} onAction={onAction}>
      {items.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <Icon name="checkCircle" size={32} className="mx-auto text-[#13B98A]" />
          <p className="mt-2 text-sm text-[#8B87A6]">Nenhuma pendência em aberto!</p>
        </div>
      ) : (
        <div>
          {items.map((item) => (
            <article key={item.name + item.description} className="flex items-center gap-3.5 border-b border-[#F6F4FC] px-6 py-[15px] transition last:border-0 hover:bg-[#FBFAFE]">
              <span className={`h-[9px] w-[9px] shrink-0 rounded-full ${item.dotClass}`} />

              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold text-[#2C2752]">{item.name}</div>
                <div className="mt-0.5 text-[12px] text-[#9A96B4]">{item.description}</div>
              </div>

              <div className={`shrink-0 text-[15px] font-extrabold ${item.amountClass}`}>
                {item.amount}
              </div>
            </article>
          ))}
        </div>
      )}
    </CardShell>
  )
}
