export function CardShell({ title, icon, iconBg = 'bg-[#F1EFF8]', actionLabel, onAction, children, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-[20px] border border-[#ECE9F6] bg-white shadow-[0_1px_2px_rgba(44,39,82,0.04),0_14px_34px_-18px_rgba(44,39,82,0.14)] ${className}`}>
      <header className="flex items-center justify-between gap-4 border-b border-[#F2F0FA] px-6 py-5">
        <div className="flex items-center gap-2.5">
          {icon ? (
            <span className={`grid h-[30px] w-[30px] place-items-center rounded-[9px] text-[15px] ${iconBg}`}>{icon}</span>
          ) : null}
          <h2 className="text-[17px] font-bold text-[#2C2752]">{title}</h2>
        </div>

        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="text-[14px] font-bold text-[#7B5CFA] transition hover:text-[#6344e8]"
          >
            {actionLabel}
          </button>
        ) : null}
      </header>

      {children}
    </section>
  )
}
