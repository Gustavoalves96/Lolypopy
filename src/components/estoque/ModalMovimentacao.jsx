import { Modal } from "../ui/Modal.jsx";
import { Campo } from "../ui/Campo.jsx";
import { Icon } from "../ui/Icon.jsx";
import { inputStyle } from "./constants.js";

const Selo = ({ tipo, children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
    <Icon name={tipo === "entrada" ? "arrowUp" : "arrowDown"} size={15} />
    {children}
  </span>
);

export function ModalMovimentacao({ produto, formMov, setFormMov, onClose, onConfirmar, salvando }) {
  const semQtd = !formMov.quantidade;

  return (
    <Modal titulo={`Movimentação — ${produto.nome}`} onClose={onClose}>
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
        <strong style={{ fontSize: 16 }}>{produto.quantidadeAtual}</strong>{" "}
        {produto.unidadeMedida}
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
              <Selo tipo={tipo}>{tipo === "entrada" ? "Entrada" : "Saída"}</Selo>
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
            onChange={(e) => setFormMov((f) => ({ ...f, quantidade: e.target.value }))}
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
              onChange={(e) => setFormMov((f) => ({ ...f, precoUnitario: e.target.value }))}
              placeholder="0,00"
            />
          </Campo>
        )}
      </div>

      <Campo label="Motivo (opcional)">
        <input
          style={inputStyle}
          value={formMov.motivo}
          onChange={(e) => setFormMov((f) => ({ ...f, motivo: e.target.value }))}
          placeholder={
            formMov.tipo === "entrada"
              ? "Ex: Compra fornecedor"
              : "Ex: Evento aniversário da Ana"
          }
        />
      </Campo>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button
          onClick={onClose}
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
          onClick={onConfirmar}
          disabled={semQtd || salvando}
          style={{
            flex: 2,
            padding: "10px",
            border: "none",
            borderRadius: 10,
            background: semQtd
              ? "#e5e7eb"
              : formMov.tipo === "entrada"
              ? "linear-gradient(135deg,#4ade80,#16a34a)"
              : "linear-gradient(135deg,#f87171,#dc2626)",
            color: semQtd ? "#9ca3af" : "#fff",
            cursor: semQtd ? "not-allowed" : "pointer",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {salvando ? (
            "Registrando..."
          ) : (
            <Selo tipo={formMov.tipo}>
              {formMov.tipo === "entrada" ? "Confirmar Entrada" : "Confirmar Saída"}
            </Selo>
          )}
        </button>
      </div>
    </Modal>
  );
}
