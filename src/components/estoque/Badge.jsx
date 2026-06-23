import { getCor, getLabel } from "./constants.js";
import { Icon } from "../ui/Icon.jsx";

export function Badge({ cat }) {
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

export function StatusEstoque({ atual, minimo }) {
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
        }}
      >
        <Icon name={critico ? "alert" : baixo ? "arrowDown" : "check"} size={12} />
        {critico ? "Crítico" : baixo ? "Baixo" : "OK"}
      </div>
    </div>
  );
}
