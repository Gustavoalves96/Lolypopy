import { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import Login from './components/Login.jsx'
import { isLogged, apiFetch, clearToken } from './api.js'
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
import Financeiro from './components/Financeiro.jsx'
import Buffets from './components/Buffets.jsx'
import Relatorios from './components/Relatorios.jsx'

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
			{ icon: '📄', label: 'Contratos' },
		],
	},
	{
		title: 'Análise',
		items: [{ icon: '📊', label: 'Relatórios' }],
	},
]

const screenMeta = {
	'Tela inicial': { title: 'Bem vinda, Sinéia 👋', subtitle: 'Gestão do salão Lolypopy', ctaLabel: 'Nova reserva', ctaTarget: 'Reservas' },
	Reservas:       { title: 'Reservas',   subtitle: 'Agenda, confirmações e próximos eventos',          ctaLabel: 'Nova reserva',      ctaTarget: 'Reservas'   },
	Clientes:       { title: 'Clientes',   subtitle: 'Cadastro, histórico e contato dos responsáveis',   ctaLabel: 'Novo cliente',      ctaTarget: 'Clientes'   },
	Estoque:        { title: 'Estoque',    subtitle: 'Produtos, quantidades mínimas e movimentações',    ctaLabel: 'Novo produto',      ctaTarget: 'Estoque'    },
	Financeiro:     { title: 'Financeiro', subtitle: 'Recebimentos, faturamento e caixa',                ctaLabel: 'Novo lançamento',   ctaTarget: 'Financeiro' },
	Contratos:      { title: 'Contratos',  subtitle: 'Assinaturas, anexos e contratos em andamento',    ctaLabel: 'Novo contrato',     ctaTarget: 'Contratos'  },
	Buffets:        { title: 'Buffets',    subtitle: 'Pacotes, serviços e disponibilidade de menu',      ctaLabel: 'Novo buffet',       ctaTarget: 'Buffets'    },
	Relatórios:     { title: 'Relatórios', subtitle: 'Indicadores consolidados da operação',             ctaLabel: 'Exportar PDF',      ctaTarget: 'Relatórios' },
}

const KPI_SKELETON = [
	{ tone: 'pink',   icon: '🎉', trend: { label: '...', variant: 'up'   }, value: '—', label: 'Festas este mês',      view: 'Reservas'   },
	{ tone: 'purple', icon: '💵', trend: { label: '...', variant: 'up'   }, value: '—', label: 'Faturamento do mês',   view: 'Financeiro' },
	{ tone: 'teal',   icon: '✅', trend: { label: '...', variant: 'up'   }, value: '—', label: 'Taxa de adimplência',  view: 'Financeiro' },
	{ tone: 'yellow', icon: '⚠️', trend: { label: '...', variant: 'down' }, value: '—', label: 'Pendências em aberto', view: 'Financeiro' },
]

const fmt = (v) =>
	Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function App() {
	const [activeView, setActiveView]     = useState('Tela inicial')
	const [authenticated, setAuthenticated] = useState(isLogged())
	const [ctaKey, setCtaKey]             = useState(0)
	const [acaoCalendario, setAcaoCalendario] = useState(null)

	const [kpis, setKpis]                 = useState(KPI_SKELETON)
	const [upcomingEvents, setUpcomingEvents] = useState([])
	const [pendencias, setPendencias]     = useState([])
	const [activities, setActivities]     = useState([])

	const meta = screenMeta[activeView] ?? screenMeta['Tela inicial']

	useEffect(() => {
		if (authenticated) carregarDashboard()
	}, [authenticated])

	async function carregarDashboard() {
		try {
			const [rResumo, rProximos, rPend, rAtiv] = await Promise.all([
				apiFetch('/financeiro/resumo-geral'),
				apiFetch('/eventos/proximos'),
				apiFetch('/financeiro/pendencias'),
				apiFetch('/financeiro/atividade-recente'),
			])

			// ── KPIs ────────────────────────────────────────────────────────
			if (rResumo.ok) {
				const r = await rResumo.json()
				setKpis([
					{
						tone: 'pink', icon: '🎉',
						trend: { label: `${r.festasDoMes} confirmada${r.festasDoMes !== 1 ? 's' : ''}`, variant: 'up' },
						value: String(r.festasDoMes),
						label: 'Festas este mês', view: 'Reservas',
					},
					{
						tone: 'purple', icon: '💵',
						trend: { label: `${r.taxaAdimplencia}% adimplência`, variant: 'up' },
						value: fmt(r.totalReceitas),
						label: 'Faturamento do mês', view: 'Financeiro',
					},
					{
						tone: 'teal', icon: '✅',
						trend: { label: fmt(r.receitasPagas) + ' recebido', variant: 'up' },
						value: `${r.taxaAdimplencia}%`,
						label: 'Taxa de adimplência', view: 'Financeiro',
					},
					{
						tone: 'yellow', icon: '⚠️',
						trend: { label: `${r.qtdPendencias} item${r.qtdPendencias !== 1 ? 's' : ''}`, variant: r.qtdPendencias > 0 ? 'down' : 'up' },
						value: fmt(r.totalPendencias),
						label: 'Pendências em aberto', view: 'Financeiro',
					},
				])
			}

			// ── Próximas festas ──────────────────────────────────────────────
			if (rProximos.ok) {
				const evs = await rProximos.json()
				setUpcomingEvents(
					evs.slice(0, 3).map((e) => {
						const d = new Date(e.data + 'T12:00:00')
						return {
							day:   String(d.getDate()).padStart(2, '0'),
							month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
							name:  e.temaFesta
								? `${e.temaFesta}${e.cliente?.nomeFilho ? ` — ${e.cliente.nomeFilho}` : ''}`
								: `Evento de ${e.cliente?.nome ?? 'cliente'}`,
							client: `${e.cliente ? `Cliente: ${e.cliente.nome}` : ''}${e.horario ? ` · ${e.horario.slice(0, 5)}` : ''}`,
							tags: [
								...(e.temaFesta        ? [{ label: `🎉 ${e.temaFesta}`,            className: 'bg-[#EEE4FF] text-[#6B35C1]' }] : []),
								...(e.numeroCriancas>0 ? [{ label: `${e.numeroCriancas} crianças`, className: 'bg-[#D7FBF3] text-[#0B7A5E]' }] : []),
								...(e.buffet           ? [{ label: e.buffet,                        className: 'bg-[#FFE8F1] text-[#C9365A]' }] : []),
							],
							status: e.status === 'confirmado'
								? { label: 'Confirmado',    className: 'bg-[#D7FBF3] text-[#0B7A5E]' }
								: e.status === 'pendente'
								? { label: 'Pgto. pendente', className: 'bg-[#FFF5D6] text-[#A07800]' }
								: { label: e.status,         className: 'bg-[#F0E6F6] text-[#8B7BAD]' },
						}
					}),
				)
			}

			// ── Widget pendências ────────────────────────────────────────────
			if (rPend.ok) {
				const p = await rPend.json()

				// Lançamentos atrasados
				const atrasados = (p.lancamentosAtrasados ?? []).slice(0, 2).map((l) => ({
					name:        l.cliente?.nome ?? l.descricao ?? 'Lançamento',
					description: `Venceu ${new Date(l.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}`,
					amount:      fmt(l.valor),
					dotClass:    'bg-[#EF476F]',
					amountClass: 'text-[#EF476F]',
				}))

				// Eventos com saldo devedor
				const comDebt = (p.eventosComDebt ?? []).slice(0, 2).map((e) => ({
					name:        e.cliente?.nome ?? 'Evento',
					description: `Saldo em aberto · ${new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR')}`,
					amount:      fmt(Number(e.valorTotal) - Number(e.valorPago)),
					dotClass:    'bg-[#FFD166]',
					amountClass: 'text-[#B48E00]',
				}))

				// Parcelas futuras próximas
				const parcelas = (p.parcelasFuturas ?? []).slice(0, 2).map((l) => ({
					name:        l.cliente?.nome ?? l.descricao ?? 'Parcela',
					description: `Parcela · vence ${new Date(l.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}`,
					amount:      fmt(l.valor),
					dotClass:    'bg-[#9B5DE5]',
					amountClass: 'text-[#6B35C1]',
				}))

				setPendencias([...atrasados, ...comDebt, ...parcelas].slice(0, 5))
			}

			// ── Atividade recente ────────────────────────────────────────────
			if (rAtiv.ok) {
				setActivities(await rAtiv.json())
			}

		} catch (err) {
			console.error('Erro ao carregar dashboard:', err)
		}
	}

	const activeSections = sidebarSections.map((s) => ({
		...s,
		items: s.items.map((item) => ({ ...item, active: activeView === item.label })),
	}))

	const goTo = (view) => setActiveView(view)

	function handleDiaCalendario(dataStr, eventos) {
		setActiveView('Reservas')
		if (eventos.length > 0) {
			setAcaoCalendario({ tipo: 'editar', eventoId: eventos[0].id, mes: Number(dataStr.split('-')[1]), ano: Number(dataStr.split('-')[0]), _k: Date.now() })
		} else {
			setAcaoCalendario({ tipo: 'nova', data: dataStr, _k: Date.now() })
		}
	}

	const handleLogout = () => {
		clearToken()
		setAuthenticated(false)
		setActiveView('Tela inicial')
	}

	const handleCtaClick = () => {
		if (['Estoque', 'Clientes', 'Reservas', 'Contratos', 'Financeiro'].includes(activeView)) {
			setCtaKey((k) => k + 1)
		} else {
			goTo(meta.ctaTarget)
		}
	}

	if (!authenticated) return <Login onSuccess={() => setAuthenticated(true)} />

	return (
		<div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#FFF8FB_0%,#FFFDFE_100%)] text-[#2D1B4E] lg:flex-row">
			<Toaster position="top-right" richColors />
			<Sidebar sections={activeSections} activeItem={activeView} onSelect={goTo} />

			<main className="flex min-w-0 flex-1 flex-col">
				<Topbar title={meta.title} subtitle={meta.subtitle} ctaLabel={meta.ctaLabel} onCtaClick={handleCtaClick} onLogout={handleLogout} />

				<div className="flex-1 overflow-y-auto px-5 py-6 lg:px-7">
					{activeView === 'Tela inicial' ? (
						<TelaInicialContent onOpen={goTo} kpis={kpis} upcomingEvents={upcomingEvents} pendencias={pendencias} activities={activities} onDiaCalendario={handleDiaCalendario} />
					) : activeView === 'Estoque'    ? <Estoque openNewProductKey={ctaKey} />
					  : activeView === 'Clientes'   ? <Clientes onNovoCliente={ctaKey} />
					  : activeView === 'Reservas'   ? <Reservas onNovaReserva={ctaKey} acaoCalendario={acaoCalendario} />
					  : activeView === 'Contratos'  ? <Contratos onNovoContrato={ctaKey} />
					  : activeView === 'Financeiro' ? <Financeiro onNovoLancamento={ctaKey} />
					  : activeView === 'Buffets'    ? <Buffets onNovoBuffet={ctaKey} />
					  : activeView === 'Relatórios' ? <Relatorios />
					  : <SectionScreen view={activeView} onBack={() => goTo('Tela inicial')} onOpen={goTo} />}
				</div>
			</main>
		</div>
	)
}

function TelaInicialContent({ onOpen, kpis, upcomingEvents, pendencias, activities, onDiaCalendario }) {
	return (
		<div className="mx-auto flex w-full max-w-400 flex-col gap-5">
			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{kpis.map((kpi) => (
					<KpiCard key={kpi.label} tone={kpi.tone} icon={kpi.icon} trend={kpi.trend} value={kpi.value} label={kpi.label} onClick={() => onOpen(kpi.view)} />
				))}
			</section>
			<section className="grid gap-4 xl:grid-cols-[1.5fr_0.8fr]">
				<UpcomingFestas events={upcomingEvents} onAction={() => onOpen('Reservas')} />
				<Pendencias items={pendencias} onAction={() => onOpen('Financeiro')} />
			</section>
			<section className="grid gap-4 xl:grid-cols-2">
				<MiniCalendar onDiaClick={onDiaCalendario} />
				<RecentActivity items={activities} />
			</section>
		</div>
	)
}

function SectionScreen({ view, onBack, onOpen }) {
	const sections = {
		Buffets:    { summary: 'Gerencie pacotes, temas e serviços adicionais disponíveis.', items: ['Buffet Kids · disponível', 'Buffet Premium · limitado', 'Buffet Standard · agenda aberta'], actions: [{ label: 'Ver estoque', next: 'Estoque' }, { label: 'Ver reservas', next: 'Reservas' }] },
		Relatórios: { summary: 'Resumo consolidado de reservas, receita e adimplência.',     items: ['Acesse Financeiro para ver o faturamento', 'Veja reservas do mês em Reservas'],                actions: [{ label: 'Abrir financeiro', next: 'Financeiro' }, { label: 'Ver reservas', next: 'Reservas' }] },
	}
	const content = sections[view] ?? sections.Relatórios
	const icons   = { Buffets: '🍰', Relatórios: '📊' }

	return (
		<div className="mx-auto flex w-full max-w-300 flex-col gap-5">
			<CardShell title={view} icon={icons[view] ?? '✨'} actionLabel="Voltar" onAction={onBack}>
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
								{content.actions.map((a) => (
									<button key={a.label} onClick={() => onOpen(a.next)} className="rounded-2xl bg-[#9B5DE5] px-4 py-3 text-left text-sm font-bold text-white shadow-lg shadow-[#9B5DE5]/20 transition hover:bg-[#864fe1]">
										{a.label}
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
