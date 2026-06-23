export function Topbar({ title, subtitle, ctaLabel, onCtaClick, onLogout, userName }) {
  const inicial = (userName || 'A').trim().charAt(0).toUpperCase() || 'A'

  return (
    <header className="sticky top-0 z-10 bg-[#F4F3FA]/90 px-8 pb-2 pt-8 backdrop-blur-xl lg:px-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-[-0.4px] text-[#2C2752]">
            {title}
          </h1>
          <p className="mt-1.5 text-[15px] font-medium text-[#8B87A6]">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCtaClick}
            className="inline-flex items-center gap-2.5 rounded-[14px] bg-linear-to-br from-[#9B7BFF] to-[#7B5CFA] px-[22px] py-3.5 text-[15px] font-bold text-white shadow-[0_12px_24px_-8px_rgba(123,92,250,0.6)] transition hover:-translate-y-px hover:brightness-105"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>{ctaLabel}</span>
          </button>

          <button
            type="button"
            className="relative grid h-[46px] w-[46px] place-items-center rounded-[13px] border border-[#ECE9F6] bg-white text-[#615D82] transition hover:bg-[#F6F4FD]"
            aria-label="Notificações"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9.5a6 6 0 0 1 12 0c0 4 1.4 5.4 1.9 6H4.1c.5-.6 1.9-2 1.9-6z" />
              <path d="M10 19a2 2 0 0 0 4 0" />
            </svg>
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-[#FB5E89]" />
          </button>

          <div className="grid h-[46px] w-[46px] place-items-center rounded-[13px] bg-linear-to-br from-[#FF8FB6] to-[#9B7BFF] text-base font-bold text-white">
            {inicial}
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Sair"
            className="grid h-[46px] w-[46px] place-items-center rounded-[13px] border border-[#ECE9F6] bg-white text-[#8B87A6] transition hover:border-[#FFEDF2] hover:bg-[#FFEDF2] hover:text-[#FB5E89]"
            aria-label="Sair"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 8l-4 4 4 4M6 12h11" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
