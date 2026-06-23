import { inputClass } from './inputClass.js'
import { Icon } from './Icon.jsx'

// Editor de itens de buffet: lista de linhas com nome + quantidade, com botões
// para adicionar e remover. `itens` é um array de { nome, quantidade }.
export function ItensEditor({ itens, onChange, placeholderNome = 'Ex: Salgados' }) {
  const lista = itens ?? []

  function atualizar(index, campo, valor) {
    onChange(lista.map((it, i) => (i === index ? { ...it, [campo]: valor } : it)))
  }

  function adicionar() {
    onChange([...lista, { nome: '', quantidade: '' }])
  }

  function remover(index) {
    onChange(lista.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      {lista.length === 0 && (
        <p className="rounded-2xl border border-dashed border-[#F0E6F6] px-4 py-3 text-center text-[12px] text-[#8B7BAD]">
          Nenhum item ainda. Adicione os itens do buffet abaixo.
        </p>
      )}

      {lista.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className={`${inputClass()} min-w-0 grow basis-0`}
            value={item.nome}
            onChange={(e) => atualizar(i, 'nome', e.target.value)}
            placeholder={placeholderNome}
          />
          <input
            className={`${inputClass()} shrink-0 grow-0 basis-24`}
            value={item.quantidade ?? ''}
            onChange={(e) => atualizar(i, 'quantidade', e.target.value)}
            placeholder="Qtd."
          />
          <button
            type="button"
            onClick={() => remover(i)}
            className="grid shrink-0 place-items-center rounded-xl border border-[#FFE8F1] bg-white px-3 py-2.5 text-[#C9365A] transition hover:bg-[#FFE8F1]"
            aria-label="Remover item"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={adicionar}
        className="mt-1 self-start rounded-xl border border-[#F0E6F6] px-4 py-2 text-[12px] font-bold text-[#9B5DE5] transition hover:bg-[#EEE4FF]"
      >
        + Adicionar item
      </button>
    </div>
  )
}
