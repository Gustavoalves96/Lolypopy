export const formatarMoeda = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatarData = (dateStr) =>
  new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR')
