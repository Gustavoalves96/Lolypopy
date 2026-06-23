import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiFetch } from "../api.js";
import {
  FORM_PRODUTO_VAZIO,
  FORM_MOV_VAZIO,
  PRODUTOS_DEMO,
} from "./estoque/constants.js";
import { ResumoCards } from "./estoque/ResumoCards.jsx";
import { Filtros } from "./estoque/Filtros.jsx";
import { ListaProdutos } from "./estoque/ListaProdutos.jsx";
import { ModalNovoProduto } from "./estoque/ModalNovoProduto.jsx";
import { ModalMovimentacao } from "./estoque/ModalMovimentacao.jsx";
import { ModalHistorico } from "./estoque/ModalHistorico.jsx";
import { ModalExcluir } from "./estoque/ModalExcluir.jsx";

// ============================================================
// COMPONENTE PRINCIPAL — orquestra estado, dados e os subcomponentes
// de apresentação em ./estoque/*
// ============================================================
export default function Estoque({ openNewProductKey = 0 }) {
  const [produtos, setProdutos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroBusca, setFiltroBusca] = useState("");

  const [modalNovo, setModalNovo] = useState(false);
  const [modalMovimentacao, setModalMovimentacao] = useState(null); // produto selecionado
  const [modalHistorico, setModalHistorico] = useState(null);
  const [historico, setHistorico] = useState([]);

  const [formProduto, setFormProduto] = useState(FORM_PRODUTO_VAZIO);
  const [formMov, setFormMov] = useState(FORM_MOV_VAZIO);

  const [salvando, setSalvando] = useState(false);
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(null);

  // Simula dados locais se a API não estiver disponível
  const [modoDemo, setModoDemo] = useState(false);

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
      setProdutos(PRODUTOS_DEMO);
      setAlertas(PRODUTOS_DEMO.filter((p) => p.quantidadeAtual <= p.estoqueMinimo));
      setModoDemo(true);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    if (!openNewProductKey) return;
    setFormProduto(FORM_PRODUTO_VAZIO);
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
      toast.success("Produto salvo!");
    } catch {
      toast.error("Erro ao salvar produto. Tente novamente.");
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
      toast.success("Movimentação registrada!");
    } catch (e) {
      toast.error("Erro: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProduto(id) {
    if (modoDemo) {
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      setConfirmandoExcluir(null);
      return;
    }
    try {
      const res = await apiFetch(`/estoque/produtos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await carregarProdutos();
      setConfirmandoExcluir(null);
      toast.success("Produto removido.");
    } catch {
      toast.error("Erro ao excluir produto.");
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
      const res = await apiFetch(`/estoque/produtos/${produto.id}/movimentacoes`);
      setHistorico(await res.json());
    } catch {
      setHistorico([]);
    }
  }

  function abrirMovimentacao(produto) {
    setFormMov(FORM_MOV_VAZIO);
    setModalMovimentacao(produto);
  }

  const totalItens = produtos.length;
  const totalAlertas = alertas.length;
  const valorTotal = produtos.reduce(
    (acc, p) => acc + (p.quantidadeAtual * p.precoCusto || 0),
    0
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#111827" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {modoDemo && (
          <div
            style={{
              background: "#fef3c7",
              color: "#92400e",
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 99,
              border: "1px solid #fcd34d",
              display: "inline-block",
              marginBottom: 16,
            }}
          >
            🔌 Modo demonstração — conecte a API
          </div>
        )}
        <ResumoCards
          totalItens={totalItens}
          totalAlertas={totalAlertas}
          valorTotal={valorTotal}
        />

        <Filtros
          filtroBusca={filtroBusca}
          setFiltroBusca={setFiltroBusca}
          filtroCategoria={filtroCategoria}
          setFiltroCategoria={setFiltroCategoria}
        />

        <ListaProdutos
          carregando={carregando}
          produtos={produtosFiltrados}
          onMovimentar={abrirMovimentacao}
          onHistorico={abrirHistorico}
          onExcluir={setConfirmandoExcluir}
        />
      </div>

      {modalNovo && (
        <ModalNovoProduto
          formProduto={formProduto}
          setFormProduto={setFormProduto}
          onClose={() => setModalNovo(false)}
          onSalvar={criarProduto}
          salvando={salvando}
        />
      )}

      {modalMovimentacao && (
        <ModalMovimentacao
          produto={modalMovimentacao}
          formMov={formMov}
          setFormMov={setFormMov}
          onClose={() => setModalMovimentacao(null)}
          onConfirmar={registrarMovimentacao}
          salvando={salvando}
        />
      )}

      {modalHistorico && (
        <ModalHistorico
          produto={modalHistorico}
          historico={historico}
          onClose={() => setModalHistorico(null)}
        />
      )}

      {confirmandoExcluir && (
        <ModalExcluir
          produto={confirmandoExcluir}
          onClose={() => setConfirmandoExcluir(null)}
          onConfirmar={() => excluirProduto(confirmandoExcluir.id)}
        />
      )}
    </div>
  );
}
