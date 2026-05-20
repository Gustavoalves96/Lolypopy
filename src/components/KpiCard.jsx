export function KpiCard({ tone, icon, trend, value, label, onClick }) {
  const toneStyles = {
    pink: {
      bar: 'before:bg-[#FF6B9D]',
      iconBg: 'bg-[#FFE8F1] text-[#FF6B9D]',
    },
    purple: {
      bar: 'before:bg-[#9B5DE5]',
      iconBg: 'bg-[#EEE4FF] text-[#9B5DE5]',
    },
    teal: {
      bar: 'before:bg-[#06D6A0]',
      iconBg: 'bg-[#D7FBF3] text-[#0B9B73]',
    },
    yellow: {
      bar: 'before:bg-[#FFD166]',
      iconBg: 'bg-[#FFF5D6] text-[#A07800]',
    },
  }

  const styles = toneStyles[tone] ?? toneStyles.pink

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[28px] border border-[#F0E6F6] bg-white p-5 text-left shadow-[0_8px_30px_rgba(45,27,78,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(45,27,78,0.12)] ${styles.bar} before:absolute before:left-0 before:top-0 before:h-1 before:w-full before:content-['']`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-2xl text-xl ${styles.iconBg}`}>
          {icon}
        </div>
        <span
          className={`rounded-xl px-2.5 py-1 text-[11px] font-bold ${
            trend.variant === 'up'
              ? 'bg-[#D7FBF3] text-[#0B9B73]'
              : trend.variant === 'down'
                ? 'bg-[#FFE8EE] text-[#C9365A]'
                : 'bg-[#EEE4FF] text-[#6B35C1]'
          }`}
        >
          {trend.label}
        </span>
      </div>

      <div
        className="text-[27px] font-extrabold leading-none text-[#2D1B4E]"
        style={{ fontFamily: '"Baloo 2", cursive' }}
      >
        {value}
      </div>
      <div className="mt-2 text-[12px] font-semibold text-[#8B7BAD]">{label}</div>
    </button>
  )
}