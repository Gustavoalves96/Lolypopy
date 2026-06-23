export const CATEGORIAS = [
  { value: "salgado", label: "🥟 Salgados", cor: "#f59e0b" },
  { value: "doce", label: "🍬 Doces", cor: "#ec4899" },
  { value: "bebida", label: "🥤 Bebidas", cor: "#3b82f6" },
  { value: "decoracao", label: "🎀 Decoração", cor: "#8b5cf6" },
  { value: "descartavel", label: "🧴 Descartáveis", cor: "#6b7280" },
  { value: "outro", label: "📦 Outros", cor: "#14b8a6" },
];

export const UNIDADES = ["unidade", "kg", "litro", "pacote", "caixa", "dúzia"];

export const getCor = (cat) =>
  CATEGORIAS.find((c) => c.value === cat)?.cor ?? "#6b7280";

export const getLabel = (cat) =>
  CATEGORIAS.find((c) => c.value === cat)?.label ?? cat;

export const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1.5px solid #e5e7eb",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
  color: "#111",
  transition: "border 0.15s",
};

export const FORM_PRODUTO_VAZIO = {
  nome: "",
  categoria: "salgado",
  descricao: "",
  precoCusto: "",
  unidadeMedida: "unidade",
  quantidadeInicial: "",
  estoqueMinimo: "10",
};

export const FORM_MOV_VAZIO = {
  tipo: "entrada",
  quantidade: "",
  motivo: "",
  precoUnitario: "",
};

export const PRODUTOS_DEMO = [
  { id: 1, nome: "Coxinha", categoria: "salgado", quantidadeAtual: 150, estoqueMinimo: 50, precoCusto: 1.5, unidadeMedida: "unidade", ativo: true },
  { id: 2, nome: "Brigadeiro", categoria: "doce", quantidadeAtual: 12, estoqueMinimo: 30, precoCusto: 1.2, unidadeMedida: "unidade", ativo: true },
  { id: 3, nome: "Refrigerante 2L", categoria: "bebida", quantidadeAtual: 8, estoqueMinimo: 10, precoCusto: 7.5, unidadeMedida: "unidade", ativo: true },
  { id: 4, nome: "Balão Latex", categoria: "decoracao", quantidadeAtual: 200, estoqueMinimo: 50, precoCusto: 0.5, unidadeMedida: "unidade", ativo: true },
  { id: 5, nome: "Prato Descartável", categoria: "descartavel", quantidadeAtual: 45, estoqueMinimo: 100, precoCusto: 0.3, unidadeMedida: "pacote", ativo: true },
  { id: 6, nome: "Suco de Caixinha", categoria: "bebida", quantidadeAtual: 60, estoqueMinimo: 20, precoCusto: 2.0, unidadeMedida: "unidade", ativo: true },
];
