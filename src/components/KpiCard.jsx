import { Icon } from './ui/Icon.jsx'

export function KpiCard({ tone, icon, trend, value, label, onClick }) {
  const toneStyles = {
    pink: {
      bar: 'from-[#FF7AA8] to-[#FB5E89]',
      iconBg: 'bg-[#FFEDF2] text-[#FB5E89]',
      badge: 'bg-[#FFEDF2] text-[#FB5E89]',
      hover: 'hover:shadow-[0_1px_2px_rgba(44,39,82,0.04),0_22px_40px_-20px_rgba(251,94,137,0.4)]',
    },
    purple: {
      bar: 'from-[#9B7BFF] to-[#7B5CFA]',
      iconBg: 'bg-[#EFEAFF] text-[#7B5CFA]',
      badge: 'bg-[#EFEAFF] text-[#7B5CFA]',
      hover: 'hover:shadow-[0_1px_2px_rgba(44,39,82,0.04),0_22px_40px_-20px_rgba(123,92,250,0.4)]',
    },
    teal: {
      bar: 'from-[#2BD49B] to-[#13B98A]',
      iconBg: 'bg-[#E2F7F0] text-[#13B98A]',
      badge: 'bg-[#E2F7F0] text-[#13B98A]',
      hover: 'hover:shadow-[0_1px_2px_rgba(44,39,82,0.04),0_22px_40px_-20px_rgba(19,185,138,0.4)]',
    },
    yellow: {
      bar: 'from-[#FFC24B] to-[#F5A623]',
      iconBg: 'bg-[#FFF3DC] text-[#E8930C]',
      badge: 'bg-[#FFF3DC] text-[#E8930C]',
      hover: 'hover:shadow-[0_1px_2px_rgba(44,39,82,0.04),0_22px_40px_-20px_rgba(245,166,35,0.4)]',
    },
  }

  const styles = toneStyles[tone] ?? toneStyles.pink

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-[20px] border border-[#ECE9F6] bg-white p-[22px] text-left shadow-[0_1px_2px_rgba(44,39,82,0.04),0_14px_34px_-18px_rgba(44,39,82,0.16)] transition hover:-translate-y-0.5 ${styles.hover}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${styles.bar}`} />

      <div className="mb-[18px] flex items-start justify-between gap-3">
        <div className={`grid h-[46px] w-[46px] place-items-center rounded-[14px] ${styles.iconBg}`}>
          <Icon name={icon} size={23} />
        </div>
        <span className={`rounded-full px-[11px] py-[5px] text-[12px] font-bold ${styles.badge}`}>
          {trend.label}
        </span>
      </div>

      <div className="text-[34px] font-extrabold leading-none tracking-[-1px] text-[#2C2752]">
        {value}
      </div>
      <div className="mt-2 text-[14px] font-medium text-[#8B87A6]">{label}</div>
    </button>
  )
}
