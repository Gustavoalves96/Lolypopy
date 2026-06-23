import { useState, useEffect, lazy, Suspense } from 'react'
import { Toaster, toast } from 'sonner'
import Login from './components/Login.jsx'
import { isLogged, apiFetch, clearToken } from './api.js'
import { Sidebar } from './components/Sidebar.jsx'
import { Topbar } from './components/Topbar.jsx'
import { KpiCard } from './components/KpiCard.jsx'
import { UpcomingFestas } from './components/UpcomingFestas.jsx'
import { Pendencias } from './components/Pendencias.jsx'
import { MiniCalendar } from './components/MiniCalendar.jsx'
import { RecentActivity } from './components/RecentActivity.jsx'
import { SkeletonRows } from './components/ui/Skeleton.jsx'
import { carregarConfig, CONFIG_EVENTO } from './utils/config.js'

// Páginas carregadas sob demanda (code-splitting) — reduz o bundle inicial.
// Em especial, isola o recharts (usado só em Relatórios) do carregamento inicial.
const Estoque = lazy(() => import('./components/Estoque.jsx'))
const Clientes = lazy(() => import('./components/Clientes.jsx'))
const Reservas = lazy(() => import('./components/Reservas.jsx'))
const Contratos = lazy(() => import('./components/Contratos.jsx'))
const Financeiro = lazy(() => import('./components/Financeiro.jsx'))
const Buffets = lazy(() => import('./components/Buffets.jsx'))
const Relatorios = lazy(() => import('./components/Relatorios.jsx'))
const Configuracoes = lazy(() => import('./components/Configuracoes.jsx'))

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
	'Tela inicial': { title: 'Bem vinda', subtitle: 'Gestão do salão', ctaLabel: 'Nova reserva', ctaTarget: 'Reservas' },
	Reservas:       { title: 'Reservas',   subtitle: 'Agenda, confirmações e próximos eventos',          ctaLabel: 'Nova reserva',      ctaTarget: 'Reservas'   },
	Clientes:       { title: 'Clientes',   subtitle: 'Cadastro, histórico e contato dos responsáveis',   ctaLabel: 'Novo cliente',      ctaTarget: 'Clientes'   },
	Estoque:        { title: 'Estoque',    subtitle: 'Produtos, quantidades mínimas e movimentações',    ctaLabel: 'Novo produto',      ctaTarget: 'Estoque'    },
	Financeiro:     { title: 'Financeiro', subtitle: 'Recebimentos, faturamento e caixa',                ctaLabel: 'Novo lançamento',   ctaTarget: 'Financeiro' },
	Contratos:      { title: 'Contratos',  subtitle: 'Assinaturas, anexos e contratos em andamento',    ctaLabel: 'Novo contrato',     ctaTarget: 'Contratos'  },
	Buffets:        { title: 'Buffets',    subtitle: 'Pacotes, serviços e disponibilidade de menu',      ctaLabel: 'Novo buffet',       ctaTarget: 'Buffets'    },
	Relatórios:     { title: 'Relatórios', subtitle: 'Indicadores consolidados da operação',             ctaLabel: 'Exportar PDF',      ctaTarget: 'Relatórios' },
	Configurações:  { title: 'Configurações', subtitle: 'Dados do salão e preferências do sistema' },
}

const KPI_SKELETON = [
	{ tone: 'pink',   icon: 'sparkles',    trend: { label: '...', variant: 'up'   }, value: '—', label: 'Festas este mês',      view: 'Reservas'   },
	{ tone: 'purple', icon: 'cash',        trend: { label: '...', variant: 'up'   }, value: '—', label: 'Faturamento do mês',   view: 'Financeiro' },
	{ tone: 'teal',   icon: 'checkCircle', trend: { label: '...', variant: 'up'   }, value: '—', label: 'Taxa de adimplência',  view: 'Financeiro' },
	{ tone: 'yellow', icon: 'alert',       trend: { label: '...', variant: 'down' }, value: '—', label: 'Pendências em aberto', view: 'Financeiro' },
]

const fmt = (v) =>
	Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function App() {
	const [activeView, setActiveView]     = useState('Tela inicial')
	const [authenticated, setAuthenticated] = useState(isLogged())
	const [ctaKey, setCtaKey]             = useState(0)
	const [acaoCalendario, setAcaoCalendario] = useState(null)
	const [config, setConfig]             = useState(carregarConfig)

	const [kpis, setKpis]                 = useState(KPI_SKELETON)
	const [upcomingEvents, setUpcomingEvents] = useState([])
	const [pendencias, setPendencias]     = useState([])
	const [activities, setActivities]     = useState([])

	const baseMeta = screenMeta[activeView] ?? screenMeta['Tela inicial']
	const meta = activeView === 'Tela inicial'
		? {
			...baseMeta,
			title: config.nomeGestora ? `Bem vinda, ${config.nomeGestora} !` : baseMeta.title,
			subtitle: `Gestão do salão ${config.nomeSalao}`.trim(),
		}
		: baseMeta

	// Desloga automaticamente quando a API responde 401 (token expirado/inválido).
	useEffect(() => {
		function onUnauthorized() {
			setAuthenticated(false)
			setActiveView('Tela inicial')
			toast.error('Sessão expirada. Faça login novamente.')
		}
		window.addEventListener('auth:unauthorized', onUnauthorized)
		return () => window.removeEventListener('auth:unauthorized', onUnauthorized)
	}, [])

	// Mantém a saudação/título em sincronia quando as configurações são salvas.
	useEffect(() => {
		function onConfig(e) { setConfig(e.detail) }
		window.addEventListener(CONFIG_EVENTO, onConfig)
		return () => window.removeEventListener(CONFIG_EVENTO, onConfig)
	}, [])

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
						tone: 'pink', icon: 'sparkles',
						trend: { label: `${r.festasDoMes} confirmada${r.festasDoMes !== 1 ? 's' : ''}`, variant: 'up' },
						value: String(r.festasDoMes),
						label: 'Festas este mês', view: 'Reservas',
					},
					{
						tone: 'purple', icon: 'cash',
						trend: { label: `${r.taxaAdimplencia}% adimplência`, variant: 'up' },
						value: fmt(r.totalReceitas),
						label: 'Faturamento do mês', view: 'Financeiro',
					},
					{
						tone: 'teal', icon: 'checkCircle',
						trend: { label: fmt(r.receitasPagas) + ' recebido', variant: 'up' },
						value: `${r.taxaAdimplencia}%`,
						label: 'Taxa de adimplência', view: 'Financeiro',
					},
					{
						tone: 'yellow', icon: 'alert',
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
								...(e.temaFesta        ? [{ icon: 'balloon', label: e.temaFesta,             className: 'bg-[#EFEAFF] text-[#7B5CFA]' }] : []),
								...(e.numeroCriancas>0 ? [{ icon: 'users',   label: `${e.numeroCriancas} crianças`, className: 'bg-[#E2F7F0] text-[#13B98A]' }] : []),
								...(e.buffet           ? [{ icon: 'cake',    label: e.buffet,                       className: 'bg-[#F1EFF8] text-[#8B87A6]' }] : []),
							],
							status: e.status === 'confirmado'
								? { label: 'Confirmado',    className: 'bg-[#E2F7F0] text-[#13B98A]' }
								: e.status === 'pendente'
								? { label: 'Pgto. pendente', className: 'bg-[#FFF3DC] text-[#E8930C]' }
								: { label: e.status,         className: 'bg-[#F1EFF8] text-[#8B87A6]' },
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
					dotClass:    'bg-[#F5A623]',
					amountClass: 'text-[#E8930C]',
				}))

				// Eventos com saldo devedor
				const comDebt = (p.eventosComDebt ?? []).slice(0, 2).map((e) => ({
					name:        e.cliente?.nome ?? 'Evento',
					description: `Saldo em aberto · ${new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR')}`,
					amount:      fmt(Number(e.valorTotal) - Number(e.valorPago)),
					dotClass:    'bg-[#F5A623]',
					amountClass: 'text-[#E8930C]',
				}))

				// Parcelas futuras próximas
				const parcelas = (p.parcelasFuturas ?? []).slice(0, 2).map((l) => ({
					name:        l.cliente?.nome ?? l.descricao ?? 'Parcela',
					description: `Parcela · vence ${new Date(l.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}`,
					amount:      fmt(l.valor),
					dotClass:    'bg-[#7B5CFA]',
					amountClass: 'text-[#7B5CFA]',
				}))

				setPendencias([...atrasados, ...comDebt, ...parcelas].slice(0, 5))
			}

			// ── Atividade recente ────────────────────────────────────────────
			if (rAtiv.ok) {
				const lista = await rAtiv.json()
				// A API manda emojis; mapeamos para ícone SVG + cor da paleta por tipo.
				const mapaIcone = {
					'💵': { name: 'cash',     iconClass: 'bg-[#E2F7F0] text-[#13B98A]' }, // receita recebida
					'📤': { name: 'expense',  iconClass: 'bg-[#FFEDF2] text-[#FB5E89]' }, // despesa/lançamento
					'🎉': { name: 'sparkles', iconClass: 'bg-[#EFEAFF] text-[#7B5CFA]' }, // reserva
					'👪': { name: 'users',    iconClass: 'bg-[#EFEAFF] text-[#7B5CFA]' }, // novo cliente
				}
				setActivities(
					lista.map((a) => {
						const m = mapaIcone[a.icon]
						return { ...a, icon: m?.name ?? 'activity', iconClass: m?.iconClass ?? a.iconClass }
					}),
				)
			}

		} catch (err) {
			console.error('Erro ao carregar dashboard:', err)
		}
	}

	useEffect(() => {
		if (authenticated) carregarDashboard()
	}, [authenticated])

	const activeSections = sidebarSections.map((s) => ({
		...s,
		items: s.items.map((item) => ({ ...item, active: activeView === item.label })),
	}))

	const goTo = (view) => setActiveView(view)
	const userName = config.nomeGestora || ''

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
		<div className="flex min-h-screen flex-col bg-[#F4F3FA] text-[#2C2752] lg:flex-row">
			<Toaster position="top-right" richColors />
			<Sidebar sections={activeSections} activeItem={activeView} onSelect={goTo} userName={userName} />

			<main className="flex min-w-0 flex-1 flex-col">
				<Topbar title={meta.title} subtitle={meta.subtitle} ctaLabel={meta.ctaLabel} onCtaClick={handleCtaClick} onLogout={handleLogout} userName={userName} />

				<div className="flex-1 overflow-y-auto px-8 pb-12 pt-4 lg:px-10">
					<Suspense fallback={<div className="mx-auto w-full max-w-400"><SkeletonRows count={6} /></div>}>
					{activeView === 'Tela inicial' ? (
						<TelaInicialContent onOpen={goTo} kpis={kpis} upcomingEvents={upcomingEvents} pendencias={pendencias} activities={activities} onDiaCalendario={handleDiaCalendario} />
					) : activeView === 'Estoque'    ? <Estoque openNewProductKey={ctaKey} />
					  : activeView === 'Clientes'   ? <Clientes onNovoCliente={ctaKey} />
					  : activeView === 'Reservas'   ? <Reservas onNovaReserva={ctaKey} acaoCalendario={acaoCalendario} />
					  : activeView === 'Contratos'  ? <Contratos onNovoContrato={ctaKey} />
					  : activeView === 'Financeiro' ? <Financeiro onNovoLancamento={ctaKey} />
					  : activeView === 'Buffets'    ? <Buffets onNovoBuffet={ctaKey} />
					  : activeView === 'Relatórios' ? <Relatorios />
					  : activeView === 'Configurações' ? <Configuracoes />
					  : null}
					</Suspense>
				</div>
			</main>
		</div>
	)
}

function TelaInicialContent({ onOpen, kpis, upcomingEvents, pendencias, activities, onDiaCalendario }) {
	return (
		<div className="mx-auto flex w-full max-w-400 flex-col gap-6">
			<section className="grid gap-[22px] md:grid-cols-2 xl:grid-cols-4">
				{kpis.map((kpi) => (
					<KpiCard key={kpi.label} tone={kpi.tone} icon={kpi.icon} trend={kpi.trend} value={kpi.value} label={kpi.label} onClick={() => onOpen(kpi.view)} />
				))}
			</section>
			<section className="grid items-start gap-6 xl:grid-cols-[1.55fr_1fr]">
				<div className="flex min-w-0 flex-col gap-6">
					<UpcomingFestas events={upcomingEvents} onAction={() => onOpen('Reservas')} />
					<MiniCalendar onDiaClick={onDiaCalendario} />
				</div>
				<div className="flex min-w-0 flex-col gap-6">
					<Pendencias items={pendencias} onAction={() => onOpen('Financeiro')} />
					<RecentActivity items={activities} />
				</div>
			</section>
		</div>
	)
}

