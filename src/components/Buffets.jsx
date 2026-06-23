import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { CardShell } from './CardShell.jsx'
import { Modal } from './ui/Modal.jsx'
import { Campo } from './ui/Campo.jsx'
import { inputClass } from './ui/inputClass.js'
import { ItensEditor } from './ui/ItensEditor.jsx'
import { Icon } from './ui/Icon.jsx'
import { SkeletonRows } from './ui/Skeleton.jsx'
import { apiFetch } from '../api.js'

const FORM_VAZIO = { nome: '', descricao: '', preco: '', itens: [], ativo: true }

function validar(form) {
  const erros = {}
  if (!form.nome.trim()) erros.nome = 'Nome é obrigatório'
  if (form.preco === '' || Number(form.preco) < 0) erros.preco = 'Informe um valor válido'
  return erros
}

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Remove itens vazios (sem nome) antes de enviar/salvar.
const limparItens = (itens) =>
  (itens ?? [])
    .map((it) => ({ nome: it.nome.trim(), quantidade: (it.quantidade ?? '').trim() }))
    .filter((it) => it.nome)

export default function Buffets({ onNovoBuffet }) {
  const [buffets, setBuffets] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [buffetSelecionado, setBuffetSelecionado] = useState(null)
  const [form, setForm] = useState(FORM_VAZIO)
  const [erros, setErros] = useState({})
  const [tentouSalvar, setTentouSalvar] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [confirmandoDeletar, setConfirmandoDeletar] = useState(null)

  async function carregar() {
    try {
      setCarregando(true)
      const res = await apiFetch('/buffets')
      setBuffets(res.ok ? await res.json() : [])
    } catch { setBuffets([]) }
    finally  { setCarregando(false) }
  }

  useEffect(() => { carregar() }, [])
  useEffect(() => { if (onNovoBuffet) abrirNovo() }, [onNovoBuffet])
  useEffect(() => { if (tentouSalvar) setErros(validar(form)) }, [form, tentouSalvar])

  function abrirNovo() {
    setBuffetSelecionado(null)
    setForm(FORM_VAZIO)
    setErros({})
    setTentouSalvar(false)
    setModalAberto(true)
  }

  function abrirEditar(buffet) {
    setBuffetSelecionado(buffet)
    setForm({
      nome: buffet.nome,
      descricao: buffet.descricao ?? '',
      preco: String(buffet.preco ?? ''),
      itens: buffet.itens ?? [],
      ativo: buffet.ativo,
    })
    setErros({})
    setTentouSalvar(false)
    setModalAberto(true)
  }

  async function salvar() {
    setTentouSalvar(true)
    const e = validar(form)
    setErros(e)
    if (Object.keys(e).length > 0) return

    setSalvando(true)
    try {
      const payload = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        preco: Number(form.preco) || 0,
        itens: limparItens(form.itens),
        ativo: form.ativo,
      }
      const url    = buffetSelecionado ? `/buffets/${buffetSelecionado.id}` : '/buffets'
      const method = buffetSelecionado ? 'PATCH' : 'POST'
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      await carregar()
      setModalAberto(false)
      toast.success(buffetSelecionado ? 'Buffet atualizado!' : 'Buffet cadastrado!')
    } catch { toast.error('Erro ao salvar buffet.') }
    finally  { setSalvando(false) }
  }

  async function deletar(id) {
    try {
      const res = await apiFetch(`/buffets/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      await carregar()
      setConfirmandoDeletar(null)
      toast.success('Buffet removido.')
    } catch { toast.error('Erro ao remover buffet.') }
  }

  async function toggleAtivo(buffet) {
    try {
      const res = await apiFetch(`/buffets/${buffet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !buffet.ativo }),
      })
      if (!res.ok) throw new Error()
      await carregar()
    } catch { toast.error('Erro ao atualizar disponibilidade.') }
  }

  const ativos = buffets.filter((b) => b.ativo).length

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-5">

      {/* RESUMO */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { label: 'Pacotes cadastrados', valor: buffets.length, icon: 'cake', cor: '#9B5DE5' },
          { label: 'Disponíveis',         valor: ativos,          icon: 'checkCircle', cor: '#059669' },
          { label: 'Indisponíveis',       valor: buffets.length - ativos, icon: 'pause', cor: '#f59e0b' },
        ].map((card) => (
          <div key={card.label} className="flex items-center gap-3 rounded-[20px] border border-[#F0E6F6] bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: card.cor + '18' }}>
              <Icon name={card.icon} size={22} style={{ color: card.cor }} />
            </div>
            <div>
              <div className="text-[22px] font-extrabold leading-tight" style={{ color: card.cor }}>{card.valor}</div>
              <div className="text-[11px] text-[#8B7BAD]">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* LISTA */}
      <CardShell title="Pacotes de Buffet" icon={<Icon name="cake" size={16} className="text-[#7B5CFA]" />} iconBg="bg-[#EFEAFF]">
        {carregando ? (
          <SkeletonRows />
        ) : buffets.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Icon name="cake" size={36} className="mx-auto text-[#C4C0D8]" />
            <p className="mt-3 text-sm text-[#8B7BAD]">Nenhum pacote cadastrado ainda.</p>
            <button onClick={abrirNovo} className="mt-4 rounded-2xl bg-[#9B5DE5] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1]">
              + Cadastrar primeiro pacote
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#F0E6F6]">
            {buffets.map((buffet) => (
              <div key={buffet.id} className="flex items-start gap-4 px-5 py-4 transition hover:bg-[#FFF8FB]">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${buffet.ativo ? 'bg-[#EEE4FF]' : 'bg-[#F0E6F6]'}`}>
                  <Icon name="cake" size={20} className={buffet.ativo ? 'text-[#9B5DE5]' : 'text-[#8B7BAD]'} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-bold text-[#2D1B4E]">{buffet.nome}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${buffet.ativo ? 'bg-[#D7FBF3] text-[#0B7A5E]' : 'bg-[#F0E6F6] text-[#8B7BAD]'}`}>
                      {buffet.ativo ? 'Disponível' : 'Indisponível'}
                    </span>
                    <span className="text-[15px] font-extrabold text-[#9B5DE5]">{fmt(buffet.preco)}</span>
                  </div>

                  {buffet.descricao && (
                    <p className="mt-0.5 text-[12px] text-[#8B7BAD]">{buffet.descricao}</p>
                  )}

                  {buffet.itens?.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {buffet.itens.map((item, i) => (
                        <span key={i} className="rounded-lg bg-[#F0E6F6] px-2 py-0.5 text-[11px] font-semibold text-[#6B35C1]">
                          {item.nome}{item.quantidade ? ` · ${item.quantidade}` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-1.5">
                  <button onClick={() => abrirEditar(buffet)} className="rounded-xl border border-[#F0E6F6] bg-white px-3 py-1.5 text-xs font-bold text-[#9B5DE5] transition hover:bg-[#EEE4FF]">
                    Editar
                  </button>
                  <button onClick={() => toggleAtivo(buffet)} className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${buffet.ativo ? 'border-[#FFF5D6] bg-white text-[#A07800] hover:bg-[#FFF5D6]' : 'border-[#D7FBF3] bg-white text-[#0B7A5E] hover:bg-[#D7FBF3]'}`}>
                    {buffet.ativo ? 'Pausar' : 'Ativar'}
                  </button>
                  <button onClick={() => setConfirmandoDeletar(buffet)} className="rounded-xl border border-[#FFE8F1] bg-white px-3 py-1.5 text-xs font-bold text-[#C9365A] transition hover:bg-[#FFE8F1]">
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardShell>

      {/* MODAL — FORMULÁRIO */}
      {modalAberto && (
        <Modal titulo={buffetSelecionado ? `Editar — ${buffetSelecionado.nome}` : 'Novo Pacote de Buffet'} onClose={() => setModalAberto(false)}>
          <Campo label="Nome do pacote" obrigatorio erro={erros.nome}>
            <input
              className={inputClass(erros.nome)}
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Buffet 1, Buffet 2"
              autoFocus
            />
          </Campo>

          <Campo label="Descrição">
            <input
              className={inputClass()}
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              placeholder="Breve descrição do pacote"
            />
          </Campo>

          <Campo label="Preço (R$)" obrigatorio erro={erros.preco}>
            <input
              className={inputClass(erros.preco)}
              type="number"
              min="0"
              step="0.01"
              value={form.preco}
              onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
              placeholder="0,00"
            />
          </Campo>

          <Campo label="Itens inclusos">
            <ItensEditor itens={form.itens} onChange={(itens) => setForm((f) => ({ ...f, itens }))} />
          </Campo>

          <Campo label="Disponibilidade">
            <label className="flex cursor-pointer items-center gap-3">
              <div
                onClick={() => setForm((f) => ({ ...f, ativo: !f.ativo }))}
                className={`relative h-6 w-11 rounded-full transition-colors ${form.ativo ? 'bg-[#9B5DE5]' : 'bg-[#D1D5DB]'}`}
              >
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-semibold text-[#2D1B4E]">{form.ativo ? 'Disponível' : 'Indisponível'}</span>
            </label>
          </Campo>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalAberto(false)} className="flex-1 rounded-2xl border border-[#F0E6F6] py-2.5 text-sm font-bold text-[#8B7BAD] transition hover:bg-[#FFF8FB]">
              Cancelar
            </button>
            <button onClick={salvar} disabled={salvando} className="flex-2 rounded-2xl bg-[#9B5DE5] py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1] disabled:opacity-50">
              {salvando ? 'Salvando...' : buffetSelecionado ? 'Salvar alterações' : 'Cadastrar pacote'}
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL — CONFIRMAR REMOÇÃO */}
      {confirmandoDeletar && (
        <Modal titulo="Remover pacote" onClose={() => setConfirmandoDeletar(null)}>
          <p className="text-sm text-[#8B7BAD]">
            Tem certeza que deseja remover o pacote <strong className="text-[#2D1B4E]">{confirmandoDeletar.nome}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="mt-5 flex gap-3">
            <button onClick={() => setConfirmandoDeletar(null)} className="flex-1 rounded-2xl border border-[#F0E6F6] py-2.5 text-sm font-bold text-[#8B7BAD] transition hover:bg-[#FFF8FB]">
              Cancelar
            </button>
            <button onClick={() => deletar(confirmandoDeletar.id)} className="flex-2 rounded-2xl bg-[#EF476F] py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#d63860]">
              Sim, remover
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
