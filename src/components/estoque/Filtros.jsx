import { CATEGORIAS, inputStyle } from "./constants.js";

export function Filtros({
  filtroBusca,
  setFiltroBusca,
  filtroCategoria,
  setFiltroCategoria,
}) {
  return (
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
              borderColor: filtroCategoria === cat.value ? cat.cor : "#e5e7eb",
              background: filtroCategoria === cat.value ? cat.cor + "22" : "#fff",
              color: filtroCategoria === cat.value ? cat.cor : "#374151",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
