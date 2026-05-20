export function CardShell({ title, icon, actionLabel, onAction, children, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-[28px] border border-[#F0E6F6] bg-white/95 shadow-[0_8px_30px_rgba(45,27,78,0.06)] ${className}`}>
      <header className="flex items-center justify-between gap-4 border-b border-[#F0E6F6] px-5 py-4">
        <div className="flex items-center gap-2">
          <h2
            className="text-[15px] font-bold text-[#2D1B4E]"
            style={{ fontFamily: '"Baloo 2", cursive' }}
          >
            {icon ? `${icon} ${title}` : title}
          </h2>
        </div>

        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="text-sm font-bold text-[#9B5DE5] transition hover:text-[#7b3fe0]"
          >
            {actionLabel}
          </button>
        ) : null}
      </header>

      {children}
    </section>
  )
}