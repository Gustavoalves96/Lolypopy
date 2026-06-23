import { Icon } from "../ui/Icon.jsx";

export function EstoqueHeader({ modoDemo, onNovoProduto }) {
  return (
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
          <Icon name="box" size={20} style={{ color: "#fff" }} />
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
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon name="plug" size={14} /> Modo demonstração — conecte a API
        </span>
      )}
      <button
        onClick={onNovoProduto}
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
  );
}
