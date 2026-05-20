const iconClasses = 'grid h-9 w-9 place-items-center rounded-xl text-[17px]'

export function Sidebar({ sections, activeItem = 'Tela inicial', onSelect }) {
  return (
    <aside className="flex w-full flex-col gap-1 bg-[#2D1B4E] px-4 py-6 text-white lg:min-h-screen lg:w-62.5 lg:min-w-62.5 lg:px-4">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#FF6B9D] text-xl shadow-lg shadow-[#FF6B9D]/30">
          🎈
        </div>
        <div>
          <div
            className="text-[18px] font-extrabold leading-none"
            style={{ fontFamily: '"Baloo 2", cursive' }}
          >
            Loly Popy
          </div>
          <div className="text-xs text-white/45">Gestão de festas</div>
        </div>
      </div>

      <NavItem
        active={activeItem === 'Tela inicial'}
        icon="🏠"
        label="Tela inicial"
        onClick={() => onSelect?.('Tela inicial')}
      />

      {sections.map((section) => (
        <div key={section.title} className="mt-2">
          <div className="px-3 pb-2 pt-4 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/30">
            {section.title}
          </div>

          <div className="flex flex-col gap-1">
            {section.items.map((item) => (
              <NavItem
                key={item.label}
                active={item.active}
                icon={item.icon}
                label={item.label}
                onClick={() => onSelect?.(item.label)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="mt-auto border-t border-white/10 pt-4">
        <NavItem icon="⚙️" label="Configurações" onClick={() => onSelect?.('Configurações')} />
      </div>
    </aside>
  )
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[13px] font-semibold transition ${
        active
          ? 'bg-[#FF6B9D] text-white shadow-lg shadow-[#FF6B9D]/25'
          : 'text-white/65 hover:bg-white/8 hover:text-white'
      }`}
    >
      <span className={iconClasses}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}