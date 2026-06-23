import { Modal } from "../ui/Modal.jsx";
import { Campo } from "../ui/Campo.jsx";
import { CATEGORIAS, UNIDADES, inputStyle } from "./constants.js";

export function ModalNovoProduto({ formProduto, setFormProduto, onClose, onSalvar, salvando }) {
  const semNome = !formProduto.nome.trim();

  return (
    <Modal titulo="Novo Produto" onClose={onClose}>
      <Campo label="Nome do produto *">
        <input
          style={inputStyle}
          value={formProduto.nome}
          onChange={(e) => setFormProduto((f) => ({ ...f, nome: e.target.value }))}
          placeholder="Ex: Coxinha"
          autoFocus
        />
      </Campo>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Campo label="Categoria">
          <select
            style={inputStyle}
            value={formProduto.categoria}
            onChange={(e) => setFormProduto((f) => ({ ...f, categoria: e.target.value }))}
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
            onChange={(e) => setFormProduto((f) => ({ ...f, unidadeMedida: e.target.value }))}
          >
            {UNIDADES.map((u) => (
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
            onChange={(e) => setFormProduto((f) => ({ ...f, quantidadeInicial: e.target.value }))}
            placeholder="0"
          />
        </Campo>
        <Campo label="Estoque mínimo">
          <input
            style={inputStyle}
            type="number"
            min="0"
            value={formProduto.estoqueMinimo}
            onChange={(e) => setFormProduto((f) => ({ ...f, estoqueMinimo: e.target.value }))}
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
            onChange={(e) => setFormProduto((f) => ({ ...f, precoCusto: e.target.value }))}
            placeholder="0,00"
          />
        </Campo>
      </div>
      <Campo label="Descrição (opcional)">
        <input
          style={inputStyle}
          value={formProduto.descricao}
          onChange={(e) => setFormProduto((f) => ({ ...f, descricao: e.target.value }))}
          placeholder="Ex: Salgado frito, recheio de frango"
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
          onClick={onSalvar}
          disabled={semNome || salvando}
          style={{
            flex: 2,
            padding: "10px",
            border: "none",
            borderRadius: 10,
            background: semNome ? "#e5e7eb" : "linear-gradient(135deg,#f472b6,#a855f7)",
            color: semNome ? "#9ca3af" : "#fff",
            cursor: semNome ? "not-allowed" : "pointer",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {salvando ? "Salvando..." : "Criar Produto"}
        </button>
      </div>
    </Modal>
  );
}
