// Configurações do salão — persistidas no navegador (localStorage), seguindo o
// mesmo padrão usado em Buffets.jsx. Centraliza leitura/escrita para que outras
// telas (ex.: saudação do dashboard) consumam os mesmos dados.

const STORAGE_KEY = 'lolypopy:config'

export const CONFIG_PADRAO = {
  nomeSalao: 'Lolypopy',
  nomeGestora: '',
  email: '',
  telefone: '',
  endereco: '',
}

// Evento disparado sempre que as configurações mudam, para que telas já montadas
// (como o dashboard) possam reagir sem precisar de reload.
const EVENTO = 'config:atualizada'

export function carregarConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...CONFIG_PADRAO, ...JSON.parse(raw) } : { ...CONFIG_PADRAO }
  } catch {
    return { ...CONFIG_PADRAO }
  }
}

export function salvarConfig(config) {
  const merge = { ...CONFIG_PADRAO, ...config }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merge))
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: merge }))
  return merge
}

export const CONFIG_EVENTO = EVENTO
