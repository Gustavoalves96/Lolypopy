import { Modal } from "../ui/Modal.jsx";

export function ModalHistorico({ produto, historico, onClose }) {
  return (
    <Modal titulo={`Histórico — ${produto.nome}`} onClose={onClose}>
      {historico.length === 0 ? (
        <div style={{ textAlign: "center", color: "#9ca3af", padding: "20px 0" }}>
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
                  background: mov.tipo === "entrada" ? "#f0fdf4" : "#fff5f5",
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
                      color: mov.tipo === "entrada" ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {mov.tipo === "entrada" ? "+" : "-"}
                    {mov.quantidade}
                  </span>{" "}
                  {produto.unidadeMedida}
                </div>
                {mov.motivo && (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{mov.motivo}</div>
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
  );
}
