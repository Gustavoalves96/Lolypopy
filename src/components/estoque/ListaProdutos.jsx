import { SkeletonRows } from "../ui/Skeleton.jsx";
import { Badge, StatusEstoque } from "./Badge.jsx";

const GRID = "2fr 1fr 80px 80px 100px 120px";

export function ListaProdutos({
  carregando,
  produtos,
  onMovimentar,
  onHistorico,
  onExcluir,
}) {
  if (carregando) return <SkeletonRows />;

  if (produtos.length === 0) {
    return (
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
    );
  }

  return (
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
          gridTemplateColumns: GRID,
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
      {produtos.map((produto, i) => {
        const critico = produto.quantidadeAtual <= produto.estoqueMinimo;
        return (
          <div
            key={produto.id}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              padding: "14px 20px",
              borderBottom:
                i < produtos.length - 1 ? "1px solid #f3f4f6" : "none",
              alignItems: "center",
              background: critico ? "#fff5f5" : "#fff",
              transition: "background 0.15s",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{produto.nome}</div>
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
                onClick={() => onMovimentar(produto)}
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
                onClick={() => onHistorico(produto)}
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
              <button
                title="Excluir produto"
                onClick={() => onExcluir(produto)}
                style={{
                  background: "#fff5f5",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  padding: "5px 10px",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                🗑
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
