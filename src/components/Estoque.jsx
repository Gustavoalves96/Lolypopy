import { useState, useEffect } from "react";
import { apiFetch } from '../api.js'

const CATEGORIAS = [
  { value: "salgado", label: "🥟 Salgados", cor: "#f59e0b" },
  { value: "doce", label: "🍬 Doces", cor: "#ec4899" },
  { value: "bebida", label: "🥤 Bebidas", cor: "#3b82f6" },
  { value: "decoracao", label: "🎀 Decoração", cor: "#8b5cf6" },
  { value: "descartavel", label: "🧴 Descartáveis", cor: "#6b7280" },
  { value: "outro", label: "📦 Outros", cor: "#14b8a6" },
];

const getCor = (cat) =>
  CATEGORIAS.find((c) => c.value === cat)?.cor ?? "#6b7280";

const getLabel = (cat) =>
  CATEGORIAS.find((c) => c.value === cat)?.label ?? cat;

function Badge({ cat }) {
  const cor = getCor(cat);
  return (
    <span
      style={{
        background: cor + "22",
        color: cor,
        border: `1px solid ${cor}44`,
        borderRadius: 99,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {getLabel(cat)}
    </span>
  );
}

function StatusEstoque({ atual, minimo }) {
  const pct = minimo > 0 ? Math.min((atual / (minimo * 3)) * 100, 100) : 100;
  const critico = atual <= minimo;
  const baixo = atual <= minimo * 1.5 && !critico;
  const cor = critico ? "#ef4444" : baixo ? "#f59e0b" : "#22c55e";
  return (
    <div style={{ minWidth: 80 }}>
      <div
        style={{
          background: "#e5e7eb",
          borderRadius: 99,
          height: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: cor,
            borderRadius: 99,
            transition: "width 0.4s",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 11,
          marginTop: 3,
          color: cor,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {critico ? "⚠ Crítico" : baixo ? "↓ Baixo" : "✓ OK"}
      </div>
    </div>
  );
}

function Modal({ titulo, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111" }}>
            {titulo}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "#6b7280",
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
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

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function Estoque({ openNewProductKey = 0 }) {
  const [produtos, setProdutos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroBusca, setFiltroBusca] = useState("");

  const [modalNovo, setModalNovo] = useState(false);
  const [modalMovimentacao, setModalMovimentacao] = useState(null); // produto selecionado
  const [modalHistorico, setModalHistorico] = useState(null);
  const [historico, setHistorico] = useState([]);

  const [formProduto, setFormProduto] = useState({
    nome: "",
    categoria: "salgado",
    descricao: "",
    precoCusto: "",
    unidadeMedida: "unidade",
    quantidadeInicial: "",
    estoqueMinimo: "10",
  });

  const [formMov, setFormMov] = useState({
    tipo: "entrada",
    quantidade: "",
    motivo: "",
    precoUnitario: "",
  });

  const [salvando, setSalvando] = useState(false);

  // Simula dados locais se a API não estiver disponível
  const [modoDemo, setModoDemo] = useState(false);

  const produtosDemo = [
    { id: 1, nome: "Coxinha", categoria: "salgado", quantidadeAtual: 150, estoqueMinimo: 50, precoCusto: 1.5, unidadeMedida: "unidade", ativo: true },
    { id: 2, nome: "Brigadeiro", categoria: "doce", quantidadeAtual: 12, estoqueMinimo: 30, precoCusto: 1.2, unidadeMedida: "unidade", ativo: true },
    { id: 3, nome: "Refrigerante 2L", categoria: "bebida", quantidadeAtual: 8, estoqueMinimo: 10, precoCusto: 7.5, unidadeMedida: "unidade", ativo: true },
    { id: 4, nome: "Balão Latex", categoria: "decoracao", quantidadeAtual: 200, estoqueMinimo: 50, precoCusto: 0.5, unidadeMedida: "unidade", ativo: true },
    { id: 5, nome: "Prato Descartável", categoria: "descartavel", quantidadeAtual: 45, estoqueMinimo: 100, precoCusto: 0.3, unidadeMedida: "pacote", ativo: true },
    { id: 6, nome: "Suco de Caixinha", categoria: "bebida", quantidadeAtual: 60, estoqueMinimo: 20, precoCusto: 2.0, unidadeMedida: "unidade", ativo: true },
  ];

  async function carregarProdutos() {
    try {
      setCarregando(true);
      const [rProd, rAlert] = await Promise.all([
        apiFetch(`/estoque/produtos`),
        apiFetch(`/estoque/alertas`),
      ]);
      if (!rProd.ok) throw new Error("Falha");
      setProdutos(await rProd.json());
      setAlertas(await rAlert.json());
      setModoDemo(false);
    } catch {
      // API offline: usa dados de demonstração
      setProdutos(produtosDemo);
      setAlertas(produtosDemo.filter((p) => p.quantidadeAtual <= p.estoqueMinimo));
      setModoDemo(true);
      setErro(null);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    if (!openNewProductKey) return;

    setFormProduto({
      nome: "",
      categoria: "salgado",
      descricao: "",
      precoCusto: "",
      unidadeMedida: "unidade",
      quantidadeInicial: "",
      estoqueMinimo: "10",
    });
    setModalNovo(true);
  }, [openNewProductKey]);

  const produtosFiltrados = produtos.filter((p) => {
    const matchCat = filtroCategoria === "todas" || p.categoria === filtroCategoria;
    const matchBusca = p.nome.toLowerCase().includes(filtroBusca.toLowerCase());
    return matchCat && matchBusca;
  });

  async function criarProduto() {
    if (!formProduto.nome.trim()) return;
    setSalvando(true);
    if (modoDemo) {
      const novo = {
        ...formProduto,
        id: Date.now(),
        quantidadeAtual: Number(formProduto.quantidadeInicial) || 0,
        precoCusto: Number(formProduto.precoCusto) || 0,
        estoqueMinimo: Number(formProduto.estoqueMinimo) || 10,
        ativo: true,
      };
      setProdutos((prev) => [...prev, novo]);
      setModalNovo(false);
      setSalvando(false);
      return;
    }
    try {
      const res = await apiFetch(`/estoque/produtos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formProduto,
          precoCusto: Number(formProduto.precoCusto) || 0,
          quantidadeInicial: Number(formProduto.quantidadeInicial) || 0,
          estoqueMinimo: Number(formProduto.estoqueMinimo) || 10,
        }),
      });
      if (!res.ok) throw new Error();
      await carregarProdutos();
      setModalNovo(false);
    } catch {
      alert("Erro ao salvar produto. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function registrarMovimentacao() {
    if (!formMov.quantidade || Number(formMov.quantidade) < 1) return;
    setSalvando(true);
    if (modoDemo) {
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === modalMovimentacao.id
            ? {
                ...p,
                quantidadeAtual:
                  formMov.tipo === "entrada"
                    ? p.quantidadeAtual + Number(formMov.quantidade)
                    : p.quantidadeAtual - Number(formMov.quantidade),
              }
            : p
        )
      );
      setModalMovimentacao(null);
      setSalvando(false);
      return;
    }
    try {
      const res = await apiFetch(
        `/estoque/produtos/${modalMovimentacao.id}/movimentacao`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formMov,
            quantidade: Number(formMov.quantidade),
            precoUnitario: formMov.precoUnitario
              ? Number(formMov.precoUnitario)
              : undefined,
          }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      await carregarProdutos();
      setModalMovimentacao(null);
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function abrirHistorico(produto) {
    setModalHistorico(produto);
    if (modoDemo) {
      setHistorico([
        { id: 1, tipo: "entrada", quantidade: 100, motivo: "Compra fornecedor", criadoEm: new Date().toISOString() },
        { id: 2, tipo: "saida", quantidade: 20, motivo: "Evento aniversário Ana", criadoEm: new Date(Date.now() - 86400000).toISOString() },
      ]);
      return;
    }
    try {
      const res = await apiFetch(
        `/estoque/produtos/${produto.id}/movimentacoes`
      );
      setHistorico(await res.json());
    } catch {
      setHistorico([]);
    }
  }

  const totalItens = produtos.length;
  const totalAlertas = alertas.length;
  const valorTotal = produtos.reduce(
    (acc, p) => acc + (p.quantidadeAtual * p.precoCusto || 0),
    0
  );

  // --- RENDER ---
  return (
    <div
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#111827",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg,#f472b6,#a855f7)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            📦
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Estoque</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>Lolypopy</div>
          </div>
        </div>
        {modoDemo && (
          <span
            style={{
              background: "#fef3c7",
              color: "#92400e",
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 12px",
              borderRadius: 99,
              border: "1px solid #fcd34d",
            }}
          >
            🔌 Modo demonstração — conecte a API
          </span>
        )}
        <button
          onClick={() => {
            setFormProduto({
              nome: "", categoria: "salgado", descricao: "",
              precoCusto: "", unidadeMedida: "unidade",
              quantidadeInicial: "", estoqueMinimo: "10",
            });
            setModalNovo(true);
          }}
          style={{
            background: "linear-gradient(135deg,#f472b6,#a855f7)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "8px 18px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          + Novo Produto
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* CARDS RESUMO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            { label: "Produtos cadastrados", valor: totalItens, icon: "📦", cor: "#6366f1" },
            {
              label: "Alertas de estoque",
              valor: totalAlertas,
              icon: "⚠️",
              cor: totalAlertas > 0 ? "#ef4444" : "#22c55e",
            },
            {
              label: "Valor em estoque",
              valor: `R$ ${valorTotal.toFixed(2).replace(".", ",")}`,
              icon: "💰",
              cor: "#059669",
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "18px 20px",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: card.cor + "18",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: card.cor }}>
                  {card.valor}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #e5e7eb",
            padding: "14px 16px",
            marginBottom: 20,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          <input
            placeholder="🔍 Buscar produto..."
            value={filtroBusca}
            onChange={(e) => setFiltroBusca(e.target.value)}
            style={{
              ...inputStyle,
              width: "auto",
              flex: "1 1 180px",
              minWidth: 160,
            }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              onClick={() => setFiltroCategoria("todas")}
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                border: "1.5px solid",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                borderColor: filtroCategoria === "todas" ? "#a855f7" : "#e5e7eb",
                background: filtroCategoria === "todas" ? "#a855f722" : "#fff",
                color: filtroCategoria === "todas" ? "#a855f7" : "#374151",
              }}
            >
              Todas
            </button>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFiltroCategoria(cat.value)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 99,
                  border: "1.5px solid",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  borderColor:
                    filtroCategoria === cat.value ? cat.cor : "#e5e7eb",
                  background:
                    filtroCategoria === cat.value ? cat.cor + "22" : "#fff",
                  color:
                    filtroCategoria === cat.value ? cat.cor : "#374151",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* LISTA DE PRODUTOS */}
        {carregando ? (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: "#9ca3af",
              fontSize: 16,
            }}
          >
            Carregando estoque...
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: "#9ca3af",
              fontSize: 16,
            }}
          >
            Nenhum produto encontrado.
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            {/* Cabeçalho da tabela */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 80px 80px 100px 120px",
                padding: "10px 20px",
                background: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                fontSize: 12,
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <div>Produto</div>
              <div>Categoria</div>
              <div style={{ textAlign: "center" }}>Qtd.</div>
              <div style={{ textAlign: "center" }}>Mín.</div>
              <div style={{ textAlign: "center" }}>Status</div>
              <div style={{ textAlign: "right" }}>Ações</div>
            </div>

            {/* Linhas */}
            {produtosFiltrados.map((produto, i) => {
              const critico = produto.quantidadeAtual <= produto.estoqueMinimo;
              return (
                <div
                  key={produto.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 80px 80px 100px 120px",
                    padding: "14px 20px",
                    borderBottom:
                      i < produtosFiltrados.length - 1
                        ? "1px solid #f3f4f6"
                        : "none",
                    alignItems: "center",
                    background: critico ? "#fff5f5" : "#fff",
                    transition: "background 0.15s",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {produto.nome}
                    </div>
                    {produto.descricao && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#9ca3af",
                          marginTop: 2,
                        }}
                      >
                        {produto.descricao}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                      {produto.unidadeMedida}
                      {produto.precoCusto > 0 &&
                        ` · R$ ${Number(produto.precoCusto).toFixed(2).replace(".", ",")}`}
                    </div>
                  </div>
                  <div>
                    <Badge cat={produto.categoria} />
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 16,
                      color: critico ? "#ef4444" : "#111",
                    }}
                  >
                    {produto.quantidadeAtual}
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 14,
                      color: "#6b7280",
                    }}
                  >
                    {produto.estoqueMinimo}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <StatusEstoque
                      atual={produto.quantidadeAtual}
                      minimo={produto.estoqueMinimo}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      title="Registrar entrada/saída"
                      onClick={() => {
                        setFormMov({ tipo: "entrada", quantidade: "", motivo: "", precoUnitario: "" });
                        setModalMovimentacao(produto);
                      }}
                      style={{
                        background: "#f0fdf4",
                        color: "#16a34a",
                        border: "1px solid #bbf7d0",
                        borderRadius: 8,
                        padding: "5px 10px",
                        fontSize: 14,
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      ±
                    </button>
                    <button
                      title="Ver histórico"
                      onClick={() => abrirHistorico(produto)}
                      style={{
                        background: "#f0f9ff",
                        color: "#0284c7",
                        border: "1px solid #bae6fd",
                        borderRadius: 8,
                        padding: "5px 10px",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      📋
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL — NOVO PRODUTO */}
      {modalNovo && (
        <Modal titulo="Novo Produto" onClose={() => setModalNovo(false)}>
          <Campo label="Nome do produto *">
            <input
              style={inputStyle}
              value={formProduto.nome}
              onChange={(e) =>
                setFormProduto((f) => ({ ...f, nome: e.target.value }))
              }
              placeholder="Ex: Coxinha"
              autoFocus
            />
          </Campo>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Campo label="Categoria">
              <select
                style={inputStyle}
                value={formProduto.categoria}
                onChange={(e) =>
                  setFormProduto((f) => ({ ...f, categoria: e.target.value }))
                }
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Unidade de medida">
              <select
                style={inputStyle}
                value={formProduto.unidadeMedida}
                onChange={(e) =>
                  setFormProduto((f) => ({ ...f, unidadeMedida: e.target.value }))
                }
              >
                {["unidade", "kg", "litro", "pacote", "caixa", "dúzia"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </Campo>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Campo label="Qtd. inicial">
              <input
                style={inputStyle}
                type="number"
                min="0"
                value={formProduto.quantidadeInicial}
                onChange={(e) =>
                  setFormProduto((f) => ({ ...f, quantidadeInicial: e.target.value }))
                }
                placeholder="0"
              />
            </Campo>
            <Campo label="Estoque mínimo">
              <input
                style={inputStyle}
                type="number"
                min="0"
                value={formProduto.estoqueMinimo}
                onChange={(e) =>
                  setFormProduto((f) => ({ ...f, estoqueMinimo: e.target.value }))
                }
                placeholder="10"
              />
            </Campo>
            <Campo label="Preço de custo">
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.01"
                value={formProduto.precoCusto}
                onChange={(e) =>
                  setFormProduto((f) => ({ ...f, precoCusto: e.target.value }))
                }
                placeholder="0,00"
              />
            </Campo>
          </div>
          <Campo label="Descrição (opcional)">
            <input
              style={inputStyle}
              value={formProduto.descricao}
              onChange={(e) =>
                setFormProduto((f) => ({ ...f, descricao: e.target.value }))
              }
              placeholder="Ex: Salgado frito, recheio de frango"
            />
          </Campo>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              onClick={() => setModalNovo(false)}
              style={{
                flex: 1,
                padding: "10px",
                border: "1.5px solid #e5e7eb",
                borderRadius: 10,
                background: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={criarProduto}
              disabled={!formProduto.nome.trim() || salvando}
              style={{
                flex: 2,
                padding: "10px",
                border: "none",
                borderRadius: 10,
                background:
                  !formProduto.nome.trim()
                    ? "#e5e7eb"
                    : "linear-gradient(135deg,#f472b6,#a855f7)",
                color: !formProduto.nome.trim() ? "#9ca3af" : "#fff",
                cursor: !formProduto.nome.trim() ? "not-allowed" : "pointer",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {salvando ? "Salvando..." : "Criar Produto"}
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL — MOVIMENTAÇÃO */}
      {modalMovimentacao && (
        <Modal
          titulo={`Movimentação — ${modalMovimentacao.nome}`}
          onClose={() => setModalMovimentacao(null)}
        >
          <div
            style={{
              background: "#f9fafb",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 13,
              color: "#374151",
            }}
          >
            Estoque atual:{" "}
            <strong style={{ fontSize: 16 }}>
              {modalMovimentacao.quantidadeAtual}
            </strong>{" "}
            {modalMovimentacao.unidadeMedida}
          </div>

          <Campo label="Tipo de movimentação">
            <div style={{ display: "flex", gap: 8 }}>
              {["entrada", "saida"].map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setFormMov((f) => ({ ...f, tipo }))}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 10,
                    border: "2px solid",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    borderColor:
                      formMov.tipo === tipo
                        ? tipo === "entrada"
                          ? "#22c55e"
                          : "#ef4444"
                        : "#e5e7eb",
                    background:
                      formMov.tipo === tipo
                        ? tipo === "entrada"
                          ? "#f0fdf4"
                          : "#fff5f5"
                        : "#fff",
                    color:
                      formMov.tipo === tipo
                        ? tipo === "entrada"
                          ? "#16a34a"
                          : "#dc2626"
                        : "#6b7280",
                  }}
                >
                  {tipo === "entrada" ? "↑ Entrada" : "↓ Saída"}
                </button>
              ))}
            </div>
          </Campo>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Campo label="Quantidade *">
              <input
                style={inputStyle}
                type="number"
                min="1"
                value={formMov.quantidade}
                onChange={(e) =>
                  setFormMov((f) => ({ ...f, quantidade: e.target.value }))
                }
                placeholder="0"
                autoFocus
              />
            </Campo>
            {formMov.tipo === "entrada" && (
              <Campo label="Preço unitário (R$)">
                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  step="0.01"
                  value={formMov.precoUnitario}
                  onChange={(e) =>
                    setFormMov((f) => ({ ...f, precoUnitario: e.target.value }))
                  }
                  placeholder="0,00"
                />
              </Campo>
            )}
          </div>

          <Campo label="Motivo (opcional)">
            <input
              style={inputStyle}
              value={formMov.motivo}
              onChange={(e) =>
                setFormMov((f) => ({ ...f, motivo: e.target.value }))
              }
              placeholder={
                formMov.tipo === "entrada"
                  ? "Ex: Compra fornecedor"
                  : "Ex: Evento aniversário da Ana"
              }
            />
          </Campo>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              onClick={() => setModalMovimentacao(null)}
              style={{
                flex: 1,
                padding: "10px",
                border: "1.5px solid #e5e7eb",
                borderRadius: 10,
                background: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={registrarMovimentacao}
              disabled={!formMov.quantidade || salvando}
              style={{
                flex: 2,
                padding: "10px",
                border: "none",
                borderRadius: 10,
                background:
                  !formMov.quantidade
                    ? "#e5e7eb"
                    : formMov.tipo === "entrada"
                    ? "linear-gradient(135deg,#4ade80,#16a34a)"
                    : "linear-gradient(135deg,#f87171,#dc2626)",
                color: !formMov.quantidade ? "#9ca3af" : "#fff",
                cursor: !formMov.quantidade ? "not-allowed" : "pointer",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {salvando
                ? "Registrando..."
                : formMov.tipo === "entrada"
                ? "↑ Confirmar Entrada"
                : "↓ Confirmar Saída"}
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL — HISTÓRICO */}
      {modalHistorico && (
        <Modal
          titulo={`Histórico — ${modalHistorico.nome}`}
          onClose={() => setModalHistorico(null)}
        >
          {historico.length === 0 ? (
            <div
              style={{ textAlign: "center", color: "#9ca3af", padding: "20px 0" }}
            >
              Nenhuma movimentação registrada.
            </div>
          ) : (
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {historico.map((mov) => (
                <div
                  key={mov.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background:
                        mov.tipo === "entrada" ? "#f0fdf4" : "#fff5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {mov.tipo === "entrada" ? "↑" : "↓"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      <span
                        style={{
                          color:
                            mov.tipo === "entrada" ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {mov.tipo === "entrada" ? "+" : "-"}
                        {mov.quantidade}
                      </span>{" "}
                      {modalHistorico.unidadeMedida}
                    </div>
                    {mov.motivo && (
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {mov.motivo}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "right" }}>
                    {new Date(mov.criadoEm).toLocaleDateString("pt-BR")}
                    <br />
                    {new Date(mov.criadoEm).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
