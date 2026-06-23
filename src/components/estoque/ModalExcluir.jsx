import { Modal } from "../ui/Modal.jsx";

export function ModalExcluir({ produto, onClose, onConfirmar }) {
  return (
    <Modal titulo="Excluir produto" onClose={onClose}>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
        Tem certeza que deseja excluir{" "}
        <strong style={{ color: "#111" }}>{produto.nome}</strong>? Esta ação
        remove o produto permanentemente do banco de dados.
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: 10,
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
          style={{
            flex: 2,
            padding: 10,
            border: "none",
            borderRadius: 10,
            background: "#ef4444",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Sim, excluir
        </button>
      </div>
    </Modal>
  );
}
