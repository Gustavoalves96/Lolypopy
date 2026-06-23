import { useEffect } from 'react'

export function Modal({ titulo, onClose, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full ${maxWidth} overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(45,27,78,0.18)]`}>
        <div className="flex items-center justify-between border-b border-[#F0E6F6] px-6 py-4">
          <h3
            className="text-[16px] font-bold text-[#2D1B4E]"
            style={{ fontFamily: '"Baloo 2", cursive' }}
          >
            {titulo}
          </h3>
          <button onClick={onClose} className="text-xl text-[#8B7BAD] hover:text-[#2D1B4E]">
            ×
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
