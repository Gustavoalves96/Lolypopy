export function Campo({ label, obrigatorio, erro, children }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 flex items-center gap-1 text-[13px] font-semibold text-[#2D1B4E]">
        {label}
        {obrigatorio && <span className="text-[#EF476F]">*</span>}
      </label>
      {children}
      {erro && <p className="mt-1 text-[11px] font-semibold text-[#EF476F]">{erro}</p>}
    </div>
  )
}
