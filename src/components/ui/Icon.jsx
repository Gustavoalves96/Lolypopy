// Biblioteca central de ícones (line icons, traço com currentColor) —
// mesmo estilo da sidebar. Uso: <Icon name="calendar" size={18} className="text-[#FB5E89]" />
// A cor vem de `currentColor`, então defina via className (ex.: text-[#...]).

const PATHS = {
  // Navegação / chrome
  home: <><path d="M3.5 11.3 12 4l8.5 7.3" /><path d="M5.5 10v9.4a.6.6 0 0 0 .6.6h3.9v-5.6h4v5.6h3.9a.6.6 0 0 0 .6-.6V10" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" /></>,
  users: <><circle cx="9" cy="8.2" r="3.2" /><path d="M3.6 19.5c0-3 2.6-4.9 5.4-4.9s5.4 1.9 5.4 4.9" /><path d="M15.6 5.4a3 3 0 0 1 0 5.7M17.4 19.5c0-2.2-.9-3.9-2.5-4.7" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 19.5c0-3.2 3-5 7-5s7 1.8 7 5" /></>,
  box: <><path d="M12 3.4 20 7.5v9L12 20.6 4 16.5v-9z" /><path d="M4 7.5 12 11.6l8-4.1M12 11.6v9" /></>,
  cake: <><rect x="4" y="9.5" width="16" height="11" rx="2" /><path d="M2.8 9.5h18.4M12 9.5v11M12 9.5C12 9.5 9.8 4.8 7.6 5.7 5.9 6.4 9.4 9.5 12 9.5zM12 9.5c0 0 2.2-4.7 4.4-3.8 1.7.7-1.8 3.8-4.4 3.8z" /></>,
  wallet: <><path d="M3.5 8A2 2 0 0 1 5.5 6H16a1.5 1.5 0 0 1 1.5 1.5V8" /><rect x="3.5" y="8" width="17" height="11" rx="2.4" /><path d="M20.5 12h-3a2 2 0 0 0 0 4h3" /></>,
  file: <><path d="M6 3.5h7l5 5v11.4a.6.6 0 0 1-.6.6H6a.6.6 0 0 1-.6-.6V4.1a.6.6 0 0 1 .6-.6z" /><path d="M13 3.5v5h5M8.5 13h7M8.5 16.5h7" /></>,
  chart: <><path d="M4 4v15.5a.5.5 0 0 0 .5.5H20" /><rect x="7.5" y="11" width="3" height="6" rx="1" /><rect x="13" y="7" width="3" height="10" rx="1" /></>,
  bell: <><path d="M6 9.5a6 6 0 0 1 12 0c0 4 1.4 5.4 1.9 6H4.1c.5-.6 1.9-2 1.9-6z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
  logout: <><path d="M14 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 8l-4 4 4 4M6 12h11" /></>,

  // Ações
  plus: <><path d="M12 5v14M5 12h14" /></>,
  x: <><path d="m6 6 12 12M18 6 6 18" /></>,
  check: <><path d="M5 12.5 10 17l9-10" /></>,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20.5 20.5-4-4" /></>,
  edit: <><path d="M4 20h4l10-10-4-4L4 16v4z" /><path d="m13.5 6.5 4 4" /></>,
  trash: <><path d="M5 7h14M9 7V5h6v2M6.5 7l1 12.5a1 1 0 0 0 1 .9h7a1 1 0 0 0 1-.9L18 7M10 11v6M14 11v6" /></>,
  refresh: <><path d="M4.5 12a7.5 7.5 0 1 1 2.2 5.3M4.5 18.5V13h5.5" /></>,
  paperclip: <><path d="M20 11.5 12 19.5a4.5 4.5 0 0 1-6.5-6.5l8-8a3 3 0 0 1 4.3 4.2l-8 8a1.5 1.5 0 0 1-2.2-2.1l7.4-7.4" /></>,
  folder: <><path d="M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /></>,
  clipboard: <><rect x="5" y="5" width="14" height="15.5" rx="2.5" /><rect x="9" y="3.5" width="6" height="3" rx="1.2" /><path d="M8.5 11h7M8.5 14.5h5" /></>,

  // Direção
  chevronLeft: <><path d="m14 6-6 6 6 6" /></>,
  chevronRight: <><path d="m10 6 6 6-6 6" /></>,
  arrowRight: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  arrowUp: <><path d="M12 19V5M6 11l6-6 6 6" /></>,
  arrowDown: <><path d="M12 5v14M6 13l6 6 6-6" /></>,
  cornerDownRight: <><path d="M5 5v6a2 2 0 0 0 2 2h11M14 9l4 4-4 4" /></>,

  // Status / alertas
  alert: <><path d="M12 4.5 21 19.5H3z" /><path d="M12 10v4M12 17h.01" /></>,
  alertCircle: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4.5M12 16h.01" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  activity: <><path d="M13 3 5 13h6l-2 8 8-10h-6z" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  lightbulb: <><path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 1 3.8 10.6c-.5.5-.8 1-.8 1.6v.3h-6v-.3c0-.6-.3-1.1-.8-1.6A6 6 0 0 1 12 3z" /></>,

  // Festa / domínio
  sparkles: <><path d="M12 3.5l1.6 4.4 4.4 1.6-4.4 1.6L12 15.5l-1.6-4.4L6 9.5l4.4-1.6z" /><path d="M18.5 14.5l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" /></>,
  balloon: <><ellipse cx="12" cy="9" rx="5" ry="6" /><path d="M12 15v2.5M10.5 21c0-1.2 3-1.2 3 0" /></>,

  // Financeiro / contato
  cash: <><rect x="3" y="6.5" width="18" height="11" rx="2.5" /><circle cx="12" cy="12" r="2.6" /><path d="M6.5 10v0M17.5 14v0" /></>,
  expense: <><circle cx="12" cy="12" r="9" /><path d="M12 16V8M8.5 11.5 12 8l3.5 3.5" /></>,
  income: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8.5 12.5 12 16l3.5-3.5" /></>,
  phone: <><path d="M6 3.5h3l1.5 4.5L8.5 9.5a11 11 0 0 0 5 5l1.5-2 4.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5A14 14 0 0 1 4.5 5 1.5 1.5 0 0 1 6 3.5z" /></>,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4.5 7.5 7.5 5.5 7.5-5.5" /></>,
  mapPin: <><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /></>,
  idCard: <><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><circle cx="8.5" cy="11" r="2" /><path d="M5.5 16c0-1.7 1.3-2.6 3-2.6s3 .9 3 2.6M14.5 10h4M14.5 13.5h4" /></>,

  // Estoque (categorias mantêm emoji; estes são utilitários)
  plug: <><path d="M9 3v4M15 3v4M7 7h10v3a5 5 0 0 1-10 0V7zM12 15v6" /></>,
  pause: <><rect x="8" y="6" width="2.5" height="12" rx="1" /><rect x="13.5" y="6" width="2.5" height="12" rx="1" /></>,
  inbox: <><path d="M4 13h4l1.5 2.5h5L16 13h4M5.5 6h13L20 13v5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18v-5z" /></>,
}

export function Icon({ name, size = 20, strokeWidth = 1.8, className = '', style }) {
  const path = PATHS[name]
  if (!path) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}
