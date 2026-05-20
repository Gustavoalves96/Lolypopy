export function Topbar({ title, subtitle, ctaLabel, onCtaClick }) {
  return (
    <header className="sticky top-0 z-10 border-b border-[#F0E6F6] bg-white/85 px-5 py-4 backdrop-blur-xl lg:px-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1
            className="text-[21px] font-extrabold text-[#2D1B4E]"
            style={{ fontFamily: '"Baloo 2", cursive' }}
          >
            {title}
          </h1>
          <p className="mt-1 text-[12px] text-[#8B7BAD]">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCtaClick}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#9B5DE5] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/25 transition hover:bg-[#864fe1]"
          >
            <span>+</span>
            <span>{ctaLabel}</span>
          </button>

          <button
            type="button"
            className="relative grid h-10 w-10 place-items-center rounded-2xl border border-[#F0E6F6] bg-[#FFF8FB] text-[17px] text-[#2D1B4E]"
            aria-label="Notificações"
          >
            🔔
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#EF476F]" />
          </button>

          <div className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-br from-[#FF6B9D] to-[#9B5DE5] text-sm font-extrabold text-white shadow-lg shadow-[#9B5DE5]/20">
            A
          </div>
        </div>
      </div>
    </header>
  )
}