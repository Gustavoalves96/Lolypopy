import { useState } from 'react'
import { toast } from 'sonner'
import { CardShell } from './CardShell.jsx'
import { Campo } from './ui/Campo.jsx'
import { Icon } from './ui/Icon.jsx'
import { inputClass } from './ui/inputClass.js'
import { carregarConfig, salvarConfig, CONFIG_PADRAO } from '../utils/config.js'

function validar(form) {
  const erros = {}
  if (!form.nomeSalao.trim()) erros.nomeSalao = 'Informe o nome do salão'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    erros.email = 'E-mail inválido'
  return erros
}

export default function Configuracoes() {
  const [form, setForm] = useState(carregarConfig)
  const [erros, setErros] = useState({})
  const [salvo, setSalvo] = useState(true)

  function atualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
    setSalvo(false)
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }))
  }

  function salvar() {
    const e = validar(form)
    setErros(e)
    if (Object.keys(e).some((k) => e[k])) return
    salvarConfig(form)
    setSalvo(true)
    toast.success('Configurações salvas!')
  }

  function restaurar() {
    setForm({ ...CONFIG_PADRAO })
    setErros({})
    setSalvo(false)
    toast.info('Valores padrão restaurados. Clique em salvar para aplicar.')
  }

  return (
    <div className="mx-auto flex w-full max-w-200 flex-col gap-5">
      {/* DADOS DO SALÃO */}
      <CardShell title="Dados do salão" icon={<Icon name="home" size={16} className="text-[#7B5CFA]" />} iconBg="bg-[#EFEAFF]">
        <div className="px-5 py-5">
          <p className="mb-5 max-w-2xl text-sm leading-6 text-[#8B7BAD]">
            Essas informações personalizam o sistema — o nome de exibição aparece na
            saudação da tela inicial.
          </p>

          <div className="grid gap-x-5 md:grid-cols-2">
            <Campo label="Nome do salão" obrigatorio erro={erros.nomeSalao}>
              <input
                className={inputClass(erros.nomeSalao)}
                value={form.nomeSalao}
                onChange={(e) => atualizar('nomeSalao', e.target.value)}
                placeholder="Ex: Lolypopy"
              />
            </Campo>

            <Campo label="Nome de exibição (gestora)">
              <input
                className={inputClass()}
                value={form.nomeGestora}
                onChange={(e) => atualizar('nomeGestora', e.target.value)}
                placeholder="Ex: Sinéia"
              />
            </Campo>

            <Campo label="E-mail de contato" erro={erros.email}>
              <input
                className={inputClass(erros.email)}
                type="email"
                value={form.email}
                onChange={(e) => atualizar('email', e.target.value)}
                placeholder="contato@salao.com"
              />
            </Campo>

            <Campo label="Telefone">
              <input
                className={inputClass()}
                value={form.telefone}
                onChange={(e) => atualizar('telefone', e.target.value)}
                placeholder="(51) 99999-9999"
              />
            </Campo>

            <div className="md:col-span-2">
              <Campo label="Endereço">
                <input
                  className={inputClass()}
                  value={form.endereco}
                  onChange={(e) => atualizar('endereco', e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                />
              </Campo>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={salvar}
              disabled={salvo}
              className="rounded-2xl bg-[#9B5DE5] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1] disabled:cursor-default disabled:opacity-50"
            >
              {salvo ? 'Salvo' : 'Salvar alterações'}
            </button>
            <button
              onClick={restaurar}
              className="rounded-2xl border border-[#F0E6F6] px-5 py-2.5 text-sm font-bold text-[#8B7BAD] transition hover:bg-[#FFF8FB]"
            >
              Restaurar padrão
            </button>
          </div>
        </div>
      </CardShell>

      {/* SEGURANÇA / ACESSO */}
      <CardShell title="Acesso" icon={<Icon name="lock" size={16} className="text-[#E8930C]" />} iconBg="bg-[#FFF3DC]">
        <div className="px-5 py-5">
          <p className="max-w-2xl text-sm leading-6 text-[#8B7BAD]">
            O acesso é protegido por uma senha de administrador definida na
            configuração do servidor. Para alterá-la, atualize a variável de ambiente
            <span className="mx-1 rounded-lg bg-[#F0E6F6] px-1.5 py-0.5 font-mono text-[12px] text-[#6B35C1]">ADMIN_PASSWORD_HASH</span>
            na API. A sessão expira automaticamente após 12 horas.
          </p>
        </div>
      </CardShell>
    </div>
  )
}
