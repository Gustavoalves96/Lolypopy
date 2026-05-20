import { useState } from 'react'

import { Sidebar } from './components/Sidebar.jsx'
import { Topbar } from './components/Topbar.jsx'
import { KpiCard } from './components/KpiCard.jsx'
import { UpcomingFestas } from './components/UpcomingFestas.jsx'
import { Pendencias } from './components/Pendencias.jsx'
import { MiniCalendar } from './components/MiniCalendar.jsx'
import { RecentActivity } from './components/RecentActivity.jsx'
import { CardShell } from './components/CardShell.jsx'

const sidebarSections = [
	{
		title: 'Gestão',
		items: [
			{ icon: '📅', label: 'Reservas' },
			{ icon: '👪', label: 'Clientes' },
			{ icon: '🍰', label: 'Buffets' },
		],
	},
	{
		title: 'Financeiro',
		items: [
			{ icon: '💰', label: 'Financeiro' },
			{ icon: '⚠️', label: 'Pendências' },
			{ icon: '📄', label: 'Contratos' },
		],
	},
	{
		title: 'Análise',
		items: [{ icon: '📊', label: 'Relatórios' }],
	},
]

const kpis = [
	{ tone: 'pink', icon: '🎉', trend: { label: '↑ 12%', variant: 'up' }, value: '8', label: 'Festas este mês', view: 'Reservas' },
	{ tone: 'purple', icon: '💵', trend: { label: '↑ 8%', variant: 'up' }, value: 'R$ 24.800', label: 'Faturamento do mês', view: 'Financeiro' },
	{ tone: 'teal', icon: '✅', trend: { label: '↑ 5%', variant: 'up' }, value: '94%', label: 'Taxa de adimplência', view: 'Financeiro' },
	{ tone: 'yellow', icon: '⚠️', trend: { label: '3 em atraso', variant: 'down' }, value: 'R$ 3.200', label: 'Pendências em aberto', view: 'Pendências' },
]

const upcomingEvents = [
	{
		day: '22',
		month: 'Mai',
		name: 'Aniversário da Sofia, 5 anos',
		client: 'Cliente: Maria Souza · 14h–18h',
		tags: [
			{ label: '🦄 Unicórnio', className: 'bg-[#EEE4FF] text-[#6B35C1]' },
			{ label: '60 convidados', className: 'bg-[#D7FBF3] text-[#0B7A5E]' },
			{ label: 'Buffet Premium', className: 'bg-[#FFE8F1] text-[#C9365A]' },
		],
		status: { label: 'Confirmado', className: 'bg-[#D7FBF3] text-[#0B7A5E]' },
	},
	{
		day: '25',
		month: 'Mai',
		name: 'Aniversário do Lucas, 7 anos',
		client: 'Cliente: João Lima · 15h–19h',
		tags: [
			{ label: '🦸 Super-heróis', className: 'bg-[#EEE4FF] text-[#6B35C1]' },
			{ label: '80 convidados', className: 'bg-[#D7FBF3] text-[#0B7A5E]' },
			{ label: 'Buffet Standard', className: 'bg-[#FFE8F1] text-[#C9365A]' },
		],
		status: { label: 'Pgto. pendente', className: 'bg-[#FFF5D6] text-[#A07800]' },
	},
	{
		day: '31',
		month: 'Mai',
		name: 'Aniversário da Isabela, 3 anos',
		client: 'Cliente: Carla Melo · 14h–17h',
		tags: [
			{ label: '🧜 Sereia', className: 'bg-[#EEE4FF] text-[#6B35C1]' },
			{ label: '45 convidados', className: 'bg-[#D7FBF3] text-[#0B7A5E]' },
			{ label: 'Buffet Kids', className: 'bg-[#FFE8F1] text-[#C9365A]' },
		],
		status: { label: 'Em análise', className: 'bg-[#EEE4FF] text-[#6B35C1]' },
	},
]

const pendencias = [
	{ name: 'João Lima', description: '2ª parcela · venceu 10/05', amount: 'R$ 1.200', dotClass: 'bg-[#EF476F]', amountClass: 'text-[#EF476F]' },
	{ name: 'Fernanda Ramos', description: 'Sinal · venceu 08/05', amount: 'R$ 800', dotClass: 'bg-[#EF476F]', amountClass: 'text-[#EF476F]' },
	{ name: 'Carlos Oliveira', description: '3ª parcela · vence 20/05', amount: 'R$ 1.200', dotClass: 'bg-[#FFD166]', amountClass: 'text-[#B48E00]' },
	{ name: 'Patrícia Nunes', description: 'Contrato · aguardando assinatura', amount: 'Contrato', dotClass: 'bg-[#FFD166]', amountClass: 'text-[#8B7BAD]' },
]

const calendar = { label: 'maio', name: 'Maio 2026', weekdays: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] }

const calendarGrid = [
	{ empty: true, label: '', className: 'text-transparent' },
	{ empty: true, label: '', className: 'text-transparent' },
	{ empty: true, label: '', className: 'text-transparent' },
	{ empty: true, label: '', className: 'text-transparent' },
	{ label: '1', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '2', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '3', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '4', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '5', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '6', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '7', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '8', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '9', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '10', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '11', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '12', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '13', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '14', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '15', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '16', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '17', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '18', className: 'bg-[#9B5DE5] text-white shadow-lg shadow-[#9B5DE5]/25' },
	{ label: '19', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '20', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '21', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '22', className: 'bg-[#FF6B9D] text-white shadow-lg shadow-[#FF6B9D]/25' },
	{ label: '23', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '24', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '25', className: 'bg-[#FFD166] text-[#2D1B4E] shadow-lg shadow-[#FFD166]/25' },
	{ label: '26', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '27', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '28', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '29', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '30', className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' },
	{ label: '31', className: 'bg-[#FF6B9D] text-white shadow-lg shadow-[#FF6B9D]/25' },
	{ empty: true, label: '', className: 'text-transparent' },
	{ empty: true, label: '', className: 'text-transparent' },
	{ empty: true, label: '', className: 'text-transparent' },
	{ empty: true, label: '', className: 'text-transparent' },
]

const calendarLegend = [
	{ label: 'Festa confirmada', dotClass: 'bg-[#FF6B9D]' },
	{ label: 'Em análise', dotClass: 'bg-[#FFD166]' },
	{ label: 'Hoje', dotClass: 'bg-[#9B5DE5]' },
]

const activities = [
	{ icon: '📄', iconClass: 'bg-[#FFE8F1] text-[#FF6B9D]', description: 'Contrato de Maria Souza foi assinado e anexado', time: 'Hoje, 10:32' },
	{ icon: '💸', iconClass: 'bg-[#D7FBF3] text-[#0B9B73]', description: 'Pagamento de R$ 1.500 recebido de Carlos Oliveira', time: 'Hoje, 09:14' },
	{ icon: '🎉', iconClass: 'bg-[#EEE4FF] text-[#9B5DE5]', description: 'Nova reserva criada para Isabela Melo · 31/05', time: 'Ontem, 16:45' },
	{ icon: '⚠️', iconClass: 'bg-[#FFF5D6] text-[#A07800]', description: 'Lembrete enviado para João Lima sobre parcela em atraso', time: 'Ontem, 14:20' },
]

const screenMeta = {
	'Tela inicial': { title: 'Bem vinda, Sinéia 👋', subtitle: 'Segunda-feira, 18 de maio de 2026', ctaLabel: 'Nova reserva', ctaTarget: 'Reservas' },
	Reservas: { title: 'Reservas', subtitle: 'Agenda, confirmações e próximos eventos', ctaLabel: 'Nova reserva', ctaTarget: 'Reservas' },
	Clientes: { title: 'Clientes', subtitle: 'Cadastro, histórico e contato dos responsáveis', ctaLabel: 'Novo cliente', ctaTarget: 'Clientes' },
	Financeiro: { title: 'Financeiro', subtitle: 'Recebimentos, faturamento e acompanhamento de caixa', ctaLabel: 'Nova cobrança', ctaTarget: 'Financeiro' },
	Pendências: { title: 'Pendências', subtitle: 'Itens atrasados e contratos aguardando ação', ctaLabel: 'Enviar lembrete', ctaTarget: 'Pendências' },
	Contratos: { title: 'Contratos', subtitle: 'Documentos e assinaturas em andamento', ctaLabel: 'Novo contrato', ctaTarget: 'Contratos' },
	Buffets: { title: 'Buffets', subtitle: 'Pacotes, serviços e disponibilidade de menu', ctaLabel: 'Novo buffet', ctaTarget: 'Buffets' },
	Relatórios: { title: 'Relatórios', subtitle: 'Indicadores consolidados da operação', ctaLabel: 'Exportar PDF', ctaTarget: 'Relatórios' },
	'Configurações': { title: 'Configurações', subtitle: 'Preferências do sistema e da conta', ctaLabel: 'Salvar alterações', ctaTarget: 'Configurações' },
}

function App() {
	const [activeView, setActiveView] = useState('Tela inicial')
	const meta = screenMeta[activeView] ?? screenMeta['Tela inicial']
	const activeSections = sidebarSections.map((section) => ({
		...section,
		items: section.items.map((item) => ({ ...item, active: activeView === item.label })),
	}))

	const goTo = (view) => setActiveView(view)

	return (
		<div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#FFF8FB_0%,#FFFDFE_100%)] text-[#2D1B4E] lg:flex-row">
			<Sidebar sections={activeSections} activeItem={activeView} onSelect={goTo} />

			<main className="flex min-w-0 flex-1 flex-col">
				<Topbar title={meta.title} subtitle={meta.subtitle} ctaLabel={meta.ctaLabel} onCtaClick={() => goTo(meta.ctaTarget)} />

				<div className="flex-1 overflow-y-auto px-5 py-6 lg:px-7">
					{activeView === 'Tela inicial' ? (
						<TelaInicialContent
							onOpen={goTo}
							kpis={kpis}
							upcomingEvents={upcomingEvents}
							pendencias={pendencias}
							calendar={calendar}
							calendarGrid={calendarGrid}
							calendarLegend={calendarLegend}
							activities={activities}
						/>
					) : (
						<SectionScreen view={activeView} onBack={() => goTo('Tela inicial')} onOpen={goTo} />
					)}
				</div>
			</main>
		</div>
	)
}

function TelaInicialContent({ onOpen, kpis, upcomingEvents, pendencias, calendar, calendarGrid, calendarLegend, activities }) {
	return (
		<div className="mx-auto flex w-full max-w-400 flex-col gap-5">
			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{kpis.map((kpi) => (
					<KpiCard key={kpi.label} tone={kpi.tone} icon={kpi.icon} trend={kpi.trend} value={kpi.value} label={kpi.label} onClick={() => onOpen(kpi.view)} />
				))}
			</section>

			<section className="grid gap-4 xl:grid-cols-[1.5fr_0.8fr]">
				<UpcomingFestas events={upcomingEvents} onAction={() => onOpen('Reservas')} />
				<Pendencias items={pendencias} onAction={() => onOpen('Pendências')} />
			</section>

			<section className="grid gap-4 xl:grid-cols-2">
				<MiniCalendar month={calendar} grid={calendarGrid} legend={calendarLegend} />
				<RecentActivity items={activities} />
			</section>
		</div>
	)
}

function SectionScreen({ view, onBack, onOpen }) {
	const sections = {
		Reservas: {
			summary: 'Controle os eventos por data, status e tipo de pacote.',
			items: ['Reserva da Sofia · 22/05 · Confirmada', 'Reserva do Lucas · 25/05 · Pagamento pendente', 'Reserva da Isabela · 31/05 · Em análise'],
			actions: [{ label: 'Ver calendário', next: 'Tela inicial' }, { label: 'Abrir financeiro', next: 'Financeiro' }],
		},
		Clientes: {
			summary: 'Cadastro de responsáveis, aniversariantes e histórico de atendimento.',
			items: ['Maria Souza · cliente ativa', 'João Lima · 2 reservas em aberto', 'Carla Melo · contrato aguardando assinatura'],
			actions: [{ label: 'Ver reservas', next: 'Reservas' }, { label: 'Ir para contratos', next: 'Contratos' }],
		},
		Financeiro: {
			summary: 'Acompanhe entradas, pendências e os repasses do mês.',
			items: ['Faturamento do mês: R$ 24.800', 'Recebimentos confirmados: 94%', 'Pendências abertas: R$ 3.200'],
			actions: [{ label: 'Ver pendências', next: 'Pendências' }, { label: 'Abrir relatórios', next: 'Relatórios' }],
		},
		Pendências: {
			summary: 'Itens atrasados, lembretes e contratos aguardando assinatura.',
			items: ['João Lima · R$ 1.200 · vencido', 'Fernanda Ramos · R$ 800 · vencido', 'Patrícia Nunes · contrato pendente'],
			actions: [{ label: 'Ir para financeiro', next: 'Financeiro' }, { label: 'Voltar à tela inicial', next: 'Tela inicial' }],
		},
		Contratos: {
			summary: 'Acompanhe assinaturas, anexos e contratos aguardando retorno.',
			items: ['Contrato Maria Souza · assinado', 'Contrato João Lima · em revisão', 'Contrato Patrícia Nunes · aguardando assinatura'],
			actions: [{ label: 'Ver clientes', next: 'Clientes' }, { label: 'Voltar à tela inicial', next: 'Tela inicial' }],
		},
		Buffets: {
			summary: 'Gerencie pacotes, temas e serviços adicionais disponíveis.',
			items: ['Buffet Kids · disponível', 'Buffet Premium · limitado', 'Buffet Standard · agenda aberta'],
			actions: [{ label: 'Ver reservas', next: 'Reservas' }, { label: 'Voltar à tela inicial', next: 'Tela inicial' }],
		},
		Relatórios: {
			summary: 'Resumo consolidado de reservas, receita e adimplência.',
			items: ['12 reservas confirmadas', 'R$ 24.800 faturados', '3 pendências em aberto'],
			actions: [{ label: 'Abrir financeiro', next: 'Financeiro' }, { label: 'Voltar à tela inicial', next: 'Tela inicial' }],
		},
		'Configurações': {
			summary: 'Preferências gerais, identidade visual e ajustes da conta.',
			items: ['Perfil da empresa', 'Notificações', 'Permissões da equipe'],
			actions: [{ label: 'Voltar à tela inicial', next: 'Tela inicial' }],
		},
	}

	const content = sections[view] ?? sections.Reservas

	return (
		<div className="mx-auto flex w-full max-w-300 flex-col gap-5">
			<CardShell title={view} icon={screenIcon(view)} actionLabel="Voltar" onAction={onBack}>
				<div className="px-5 py-5">
					<p className="max-w-2xl text-sm leading-6 text-[#8B7BAD]">{content.summary}</p>
					<div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
						<div className="rounded-3xl border border-[#F0E6F6] bg-[#FFF8FB] p-4">
							<div className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#8B7BAD]">Resumo rápido</div>
							<div className="mt-4 grid gap-3">
								{content.items.map((item) => (
									<div key={item} className="rounded-2xl border border-[#F0E6F6] bg-white px-4 py-3 text-sm font-semibold text-[#2D1B4E] shadow-sm">{item}</div>
								))}
							</div>
						</div>
						<div className="rounded-3xl border border-[#F0E6F6] bg-[#FFF8FB] p-4">
							<div className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#8B7BAD]">Próximos passos</div>
							<div className="mt-4 flex flex-col gap-3">
								{content.actions.map((action) => (
									<button key={action.label} type="button" onClick={() => onOpen(action.next)} className="rounded-2xl bg-[#9B5DE5] px-4 py-3 text-left text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1]">
										{action.label}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</CardShell>
		</div>
	)
}

function screenIcon(view) {
	const icons = {
		Reservas: '📅',
		Clientes: '👪',
		Financeiro: '💰',
		Pendências: '⚠️',
		Contratos: '📄',
		Buffets: '🍰',
		Relatórios: '📊',
		'Configurações': '⚙️',
	}

	return icons[view] ?? '✨'
}

export default App
