import { CardShell } from './CardShell.jsx'

export function Pendencias({ items, onAction }) {
  return (
    <CardShell title="Pendências" icon="⚠️" actionLabel="Ver todas →" onAction={onAction}>
      <div className="divide-y divide-[#F0E6F6]">
        {items.map((item) => (
          <article key={item.name} className="flex items-center gap-3 px-5 py-4 transition hover:bg-[#FFF8FB]">
            <div className={`h-2 w-2 shrink-0 rounded-full ${item.dotClass}`} />

            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-[#2D1B4E]">{item.name}</div>
              <div className="mt-1 text-[11px] text-[#8B7BAD]">{item.description}</div>
            </div>

            <div
              className={`shrink-0 text-[15px] font-extrabold ${item.amountClass}`}
              style={{ fontFamily: '"Baloo 2", cursive' }}
            >
              {item.amount}
            </div>
          </article>
        ))}
      </div>
    </CardShell>
  )
}