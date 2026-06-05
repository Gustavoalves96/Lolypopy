import { useState } from 'react'
import Login from './components/Login.jsx'
import { isLogged } from './api.js'
import { Sidebar } from './components/Sidebar.jsx'
import { Topbar } from './components/Topbar.jsx'
import { KpiCard } from './components/KpiCard.jsx'
import { UpcomingFestas } from './components/UpcomingFestas.jsx'
import { Pendencias } from './components/Pendencias.jsx'
import { MiniCalendar } from './components/MiniCalendar.jsx'
import { RecentActivity } from './components/RecentActivity.jsx'
import { CardShell } from './components/CardShell.jsx'
import Estoque from './components/Estoque.jsx'
import Clientes from './components/Clientes.jsx'
import Reservas from './components/Reservas.jsx'
import Contratos from './components/Contratos.jsx'

const sidebarSections = [
	{
		title: 'Gestão',
		items: [
			{ icon: '📅', label: 'Reservas' },
			{ icon: '👪', label: 'Clientes' },
			{ icon: '📦', label: 'Estoque' },
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
		day: '22', month: 'Mai',
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
		day: '25', month: 'Mai',
		name: 'Aniversário do Lucas, 7 anos',
		client: 'Cliente: João Lima · 15h–19h',
		tags: [
			{ label: '🦸 Super-heróis', className: 'bg-[#EEE4FF] text-[#6B35C1]' },
			{ label: '80 convidados', className: 'bg-[#D7FBF3] text-[#0B7A5E]' },
			{ label: 'Buffet Standard', className: 'bg-[#FFE8F1] text-[#C9365A]' },
		],
		status: { label: 'Pgto. pendente', className: 'bg-[#FFF5D6] text-[#A07800]' },
	},
]

const pendencias = [
	{ name: 'João Lima', description: '2ª parcela · venceu 10/05', amount: 'R$ 1.200', dotClass: 'bg-[#EF476F]', amountClass: 'text-[#EF476F]' },
	{ name: 'Fernanda Ramos', description: 'Sinal · venceu 08/05', amount: 'R$ 800', dotClass: 'bg-[#EF476F]', amountClass: 'text-[#EF476F]' },
	{ name: 'Carlos Oliveira', description: '3ª parcela · vence 20/05', amount: 'R$ 1.200', dotClass: 'bg-[#FFD166]', amountClass: 'text-[#B48E00]' },
]

const calendar = { label: 'maio', name: 'Maio 2026', weekdays: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] }
const calendarGrid = [
	{ empty: true, label: '', className: 'text-transparent' },
	{ empty: true, label: '', className: 'text-transparent' },
	{ empty: true, label: '', className: 'text-transparent' },
	{ empty: true, label: '', className: 'text-transparent' },
	...Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), className: 'text-[#2D1B4E] hover:bg-[#F0E6F6]' })),
	{ empty: true, label: '', className: 'text-transparent' },
	{ empty: true, label: '', className: 'text-transparent' },
]
const calendarLegend = [
	{ label: 'Festa confirmada', dotClass: 'bg-[#FF6B9D]' },
	{ label: 'Em análise', dotClass: 'bg-[#FFD166]' },
	{ label: 'Hoje', dotClass: 'bg-[#9B5DE5]' },
]
const activities = [
	{ icon: '📄', iconClass: 'bg-[#FFE8F1] text-[#FF6B9D]', description: 'Contrato de Maria Souza foi assinado', time: 'Hoje, 10:32' },
	{ icon: '💸', iconClass: 'bg-[#D7FBF3] text-[#0B9B73]', description: 'Pagamento de R$ 1.500 recebido de Carlos', time: 'Hoje, 09:14' },
	{ icon: '🎉', iconClass: 'bg-[#EEE4FF] text-[#9B5DE5]', description: 'Nova reserva criada para Isabela · 31/05', time: 'Ontem, 16:45' },
]

const screenMeta = {
	'Tela inicial': { title: 'Bem vinda, Sinéia 👋', subtitle: 'Gestão do salão Lolypopy', ctaLabel: 'Nova reserva', ctaTarget: 'Reservas' },
	Reservas:       { title: 'Reservas', subtitle: 'Agenda, confirmações e próximos eventos', ctaLabel: 'Nova reserva', ctaTarget: 'Reservas' },
	Clientes:       { title: 'Clientes', subtitle: 'Cadastro, histórico e contato dos responsáveis', ctaLabel: 'Novo cliente', ctaTarget: 'Clientes' },
	Estoque:        { title: 'Estoque', subtitle: 'Produtos, quantidades mínimas e movimentações', ctaLabel: 'Novo produto', ctaTarget: 'Estoque' },
	Financeiro:     { title: 'Financeiro', subtitle: 'Recebimentos, faturamento e caixa', ctaLabel: 'Nova cobrança', ctaTarget: 'Financeiro' },
	Pendências:     { title: 'Pendências', subtitle: 'Itens atrasados e contratos aguardando ação', ctaLabel: 'Enviar lembrete', ctaTarget: 'Pendências' },
	Contratos: { title: 'Contratos', subtitle: '...', ctaLabel: 'Novo contrato', ctaTarget: 'Contratos' },
	Buffets:        { title: 'Buffets', subtitle: 'Pacotes, serviços e disponibilidade de menu', ctaLabel: 'Novo buffet', ctaTarget: 'Buffets' },
	Relatórios:     { title: 'Relatórios', subtitle: 'Indicadores consolidados da operação', ctaLabel: 'Exportar PDF', ctaTarget: 'Relatórios' },
}

function App() {
	const [activeView, setActiveView] = useState('Tela inicial')
	const [authenticated, setAuthenticated] = useState(isLogged())
	const [ctaKey, setCtaKey] = useState(0)
	const meta = screenMeta[activeView] ?? screenMeta['Tela inicial']

	const activeSections = sidebarSections.map((section) => ({
		...section,
		items: section.items.map((item) => ({ ...item, active: activeView === item.label })),
	}))

	const goTo = (view) => setActiveView(view)

	const handleCtaClick = () => {
		if (['Estoque', 'Clientes', 'Reservas', 'Contratos'].includes(activeView)) {
			setCtaKey((k) => k + 1)
			return
		}
		goTo(meta.ctaTarget)
	}

	if (!authenticated) {
		return <Login onSuccess={() => setAuthenticated(true)} />
	}

	return (
		<div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#FFF8FB_0%,#FFFDFE_100%)] text-[#2D1B4E] lg:flex-row">
			<Sidebar sections={activeSections} activeItem={activeView} onSelect={goTo} />

			<main className="flex min-w-0 flex-1 flex-col">
				<Topbar title={meta.title} subtitle={meta.subtitle} ctaLabel={meta.ctaLabel} onCtaClick={handleCtaClick} />

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
					) : activeView === 'Estoque' ? (
						<Estoque openNewProductKey={ctaKey} />
					) : activeView === 'Clientes' ? (
						<Clientes onNovoCliente={ctaKey} />
					) : activeView === 'Reservas' ? (
						<Reservas onNovaReserva={ctaKey} />
					) : activeView === 'Contratos' ? (
    					<Contratos onNovoContrato={ctaKey} />
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
				<MiniCalendar />
				<RecentActivity items={activities} />
			</section>
		</div>
	)
}

function SectionScreen({ view, onBack, onOpen }) {
	const sections = {
		Financeiro:  { summary: 'Acompanhe entradas, pendências e os repasses do mês.', items: ['Faturamento do mês: R$ 24.800', 'Recebimentos confirmados: 94%', 'Pendências abertas: R$ 3.200'], actions: [{ label: 'Ver pendências', next: 'Pendências' }, { label: 'Abrir relatórios', next: 'Relatórios' }] },
		Pendências:  { summary: 'Itens atrasados, lembretes e contratos aguardando assinatura.', items: ['João Lima · R$ 1.200 · vencido', 'Fernanda Ramos · R$ 800 · vencido', 'Patrícia Nunes · contrato pendente'], actions: [{ label: 'Ir para financeiro', next: 'Financeiro' }] },
		Contratos:   { summary: 'Acompanhe assinaturas, anexos e contratos aguardando retorno.', items: ['Contrato Maria Souza · assinado', 'Contrato João Lima · em revisão', 'Contrato Patrícia Nunes · aguardando assinatura'], actions: [{ label: 'Ver clientes', next: 'Clientes' }] },
		Buffets:     { summary: 'Gerencie pacotes, temas e serviços adicionais disponíveis.', items: ['Buffet Kids · disponível', 'Buffet Premium · limitado', 'Buffet Standard · agenda aberta'], actions: [{ label: 'Ver estoque', next: 'Estoque' }, { label: 'Ver reservas', next: 'Reservas' }] },
		Relatórios:  { summary: 'Resumo consolidado de reservas, receita e adimplência.', items: ['12 reservas confirmadas', 'R$ 24.800 faturados', '3 pendências em aberto'], actions: [{ label: 'Abrir financeiro', next: 'Financeiro' }] },
	}

	const content = sections[view] ?? sections.Financeiro

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
	const icons = { Reservas: '📅', Clientes: '👪', Financeiro: '💰', Pendências: '⚠️', Contratos: '📄', Buffets: '🍰', Relatórios: '📊', Estoque: '📦' }
	return icons[view] ?? '✨'
}

export default App
