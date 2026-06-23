export const inputClass = (erro) =>
  `w-full rounded-2xl border ${
    erro ? 'border-[#EF476F] bg-[#FFF5F7]' : 'border-[#F0E6F6] bg-[#FFF8FB]'
  } px-4 py-2.5 text-sm text-[#2D1B4E] outline-none transition focus:border-[#9B5DE5] focus:ring-2 focus:ring-[#9B5DE5]/20`
