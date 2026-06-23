// Ícones de navegação (line icons) — extraídos do design Loly Pop.
// Mapeados por label do item; usa o emoji como fallback se não houver SVG.
const NAV_ICONS = {
  'Tela inicial': (
    <><path d="M3.5 11.3 12 4l8.5 7.3" /><path d="M5.5 10v9.4a.6.6 0 0 0 .6.6h3.9v-5.6h4v5.6h3.9a.6.6 0 0 0 .6-.6V10" /></>
  ),
  Reservas: (
    <><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" /></>
  ),
  Clientes: (
    <><circle cx="9" cy="8.2" r="3.2" /><path d="M3.6 19.5c0-3 2.6-4.9 5.4-4.9s5.4 1.9 5.4 4.9" /><path d="M15.6 5.4a3 3 0 0 1 0 5.7M17.4 19.5c0-2.2-.9-3.9-2.5-4.7" /></>
  ),
  Estoque: (
    <><path d="M12 3.4 20 7.5v9L12 20.6 4 16.5v-9z" /><path d="M4 7.5 12 11.6l8-4.1M12 11.6v9" /></>
  ),
  Buffets: (
    <><rect x="4" y="9.5" width="16" height="11" rx="2" /><path d="M2.8 9.5h18.4M12 9.5v11M12 9.5C12 9.5 9.8 4.8 7.6 5.7 5.9 6.4 9.4 9.5 12 9.5zM12 9.5c0 0 2.2-4.7 4.4-3.8 1.7.7-1.8 3.8-4.4 3.8z" /></>
  ),
  Financeiro: (
    <><path d="M3.5 8A2 2 0 0 1 5.5 6H16a1.5 1.5 0 0 1 1.5 1.5V8" /><rect x="3.5" y="8" width="17" height="11" rx="2.4" /><path d="M20.5 12h-3a2 2 0 0 0 0 4h3" /></>
  ),
  Contratos: (
    <><path d="M6 3.5h7l5 5v11.4a.6.6 0 0 1-.6.6H6a.6.6 0 0 1-.6-.6V4.1a.6.6 0 0 1 .6-.6z" /><path d="M13 3.5v5h5M8.5 13h7M8.5 16.5h7" /></>
  ),
  Relatórios: (
    <><path d="M4 4v15.5a.5.5 0 0 0 .5.5H20" /><rect x="7.5" y="11" width="3" height="6" rx="1" /><rect x="13" y="7" width="3" height="10" rx="1" /></>
  ),
}

export function Sidebar({ sections, activeItem = 'Tela inicial', onSelect, userName }) {
  const nome = userName || 'Administradora'
  const inicial = nome.trim().charAt(0).toUpperCase() || 'A'

  return (
    <aside className="flex w-full flex-col gap-1.5 border-b border-[#ECE9F6] bg-white px-4 py-6 lg:sticky lg:top-0 lg:h-screen lg:min-h-screen lg:w-66 lg:min-w-66 lg:border-b-0 lg:border-r">
      {/* LOGO */}
      <div className="mb-4 flex items-center gap-3 px-2 pb-2">
        <div className="grid h-[46px] w-[46px] place-items-center rounded-[15px] bg-linear-to-br from-[#FF8FB6] to-[#7B5CFA] text-[23px] shadow-[0_8px_18px_-6px_rgba(123,92,250,0.5)]">
          🍭
        </div>
        <div className="leading-tight">
          <div className="text-[19px] font-extrabold tracking-[0.2px] text-[#2C2752]" style={{ fontFamily: '"Baloo 2", sans-serif' }}>
            Loly Pop
          </div>
          <div className="text-xs font-medium text-[#9A96B4]">Gestão de festas</div>
        </div>
      </div>

      <NavItem
        active={activeItem === 'Tela inicial'}
        label="Tela inicial"
        onClick={() => onSelect?.('Tela inicial')}
      />

      {sections.map((section) => (
        <div key={section.title} className="mt-1">
          <div className="px-3.5 pb-2 pt-4 text-[11px] font-bold uppercase tracking-[0.13em] text-[#B7B3CE]">
            {section.title}
          </div>
          <div className="flex flex-col gap-1.5">
            {section.items.map((item) => (
              <NavItem
                key={item.label}
                active={item.active}
                label={item.label}
                emoji={item.icon}
                onClick={() => onSelect?.(item.label)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* CARTÃO DE USUÁRIO → Configurações */}
      <button
        type="button"
        onClick={() => onSelect?.('Configurações')}
        className={`mt-auto flex items-center gap-3 rounded-2xl p-3 text-left transition ${
          activeItem === 'Configurações' ? 'bg-[#EFEAFF] ring-1 ring-[#7B5CFA]/20' : 'bg-[#F7F5FD] hover:bg-[#EFEAFF]'
        }`}
      >
        <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[11px] bg-linear-to-br from-[#9B7BFF] to-[#FB5E89] text-[15px] font-bold text-white">
          {inicial}
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-bold text-[#2C2752]">{nome}</span>
          <span className="truncate text-xs text-[#9A96B4]">Administradora</span>
        </div>
      </button>
    </aside>
  )
}

function NavItem({ label, emoji, active = false, onClick }) {
  const icon = NAV_ICONS[label]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3.5 rounded-[13px] px-3.5 py-3 text-left text-[15px] font-semibold transition ${
        active
          ? 'bg-linear-to-br from-[#FF7AA8] to-[#FB5E89] text-white shadow-[0_10px_22px_-8px_rgba(251,94,137,0.7)]'
          : 'text-[#615D82] hover:bg-[#F6F4FD] hover:text-[#2C2752]'
      }`}
    >
      {icon ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      ) : (
        <span className="grid h-5 w-5 place-items-center text-[17px]">{emoji}</span>
      )}
      <span>{label}</span>
    </button>
  )
}
