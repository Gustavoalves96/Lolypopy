export function ResumoCards({ totalItens, totalAlertas, valorTotal }) {
  const cards = [
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
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
        gap: 16,
        marginBottom: 24,
      }}
    >
      {cards.map((card) => (
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
  );
}
