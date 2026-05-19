import type {
  DealStage,
  DealPriority,
  StageFunnelStep,
  DealRecord,
  ForecastPoint,
  KpiItem,
} from "@/types/deal-pipeline"

const BASE_DATE = new Date("2024-03-15")

function isoDate(daysAhead: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString().slice(0, 10)
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(149)
function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

const STAGE_ORDER: DealStage[] = [
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Closed Won",
]

const STAGE_WEIGHTS: Record<DealStage, number> = {
  Lead: 0.1,
  Qualified: 0.3,
  Proposal: 0.5,
  Negotiation: 0.75,
  "Closed Won": 1.0,
}

const OWNERS = [
  "Alex Kim",
  "Brooke Tanaka",
  "Casey Yamada",
  "Devon Park",
  "Eli Sato",
  "Farah Wong",
]

const DEAL_NAMES = [
  "Northwind Co. — Enterprise Plan",
  "Adventure Works — Renewal",
  "Contoso Foods — Expansion",
  "Fabrikam Retail — Pilot",
  "Tailspin Toys — Mobile Add-on",
  "Wide World Importers — Integration",
  "Fourth Coffee — Multi-site",
  "Litware Mart — Premium Tier",
  "Lucerne Trading — Renewal",
  "Wingtip Toys — POC",
  "Margie's Travel — Custom Build",
  "Proseware Inc. — Annual Contract",
  "Relecloud Goods — Trial Conversion",
  "VanArsdel Ltd. — Renewal",
  "Coho Vineyard — Distributor",
  "Trey Research — Lab Bundle",
  "School of Fine Art — Bulk License",
  "Lamna Healthcare — Compliance Pack",
  "Adatum Corp — Add-on",
  "First Up Consultants — Renewal",
]

// ── Deals (40) ──

function generateDeals(): DealRecord[] {
  const stageDistribution: Record<DealStage, number> = {
    Lead: 14,
    Qualified: 11,
    Proposal: 8,
    Negotiation: 5,
    "Closed Won": 4,
  }
  const out: DealRecord[] = []
  let nameIdx = 0
  for (const stage of STAGE_ORDER) {
    const count = stageDistribution[stage]
    for (let i = 0; i < count; i++) {
      const amount = Math.round(srand(8_000, 95_000))
      const daysToClose = Math.round(srand(-8, 95))
      const priorityRoll = rng()
      const priority: DealPriority =
        priorityRoll > 0.78 ? "high" : priorityRoll > 0.4 ? "medium" : "low"
      out.push({
        dealId: `D-${String(out.length + 1).padStart(4, "0")}`,
        dealName: DEAL_NAMES[nameIdx % DEAL_NAMES.length],
        stage,
        amount,
        weightedAmount: Math.round(amount * STAGE_WEIGHTS[stage]),
        expectedCloseDate: isoDate(daysToClose),
        daysToClose,
        owner: OWNERS[Math.floor(srand(0, OWNERS.length))],
        priority,
      })
      nameIdx += 1
    }
  }
  return out
}

export const deals: DealRecord[] = generateDeals()

// ── Stage funnel ──

function generateFunnel(): StageFunnelStep[] {
  const steps: StageFunnelStep[] = []
  let prevCount = 0
  for (const stage of STAGE_ORDER) {
    const stageDeals = deals.filter((d) => d.stage === stage)
    const count = stageDeals.length
    const amount = stageDeals.reduce((s, d) => s + d.amount, 0)
    const weighted = stageDeals.reduce((s, d) => s + d.weightedAmount, 0)
    const conversionFromPrev =
      prevCount === 0
        ? 100
        : Math.round((count / prevCount) * 1000) / 10
    steps.push({
      stage,
      count,
      amount,
      weightedAmount: weighted,
      conversionFromPrev,
    })
    prevCount = count
  }
  return steps
}

export const stageFunnel: StageFunnelStep[] = generateFunnel()

// ── Forecast (last 3 months actual + next 6 months projection) ──

function generateForecast(): ForecastPoint[] {
  const points: ForecastPoint[] = []
  for (let i = -3; i <= 6; i++) {
    const month = new Date(BASE_DATE)
    month.setDate(1)
    month.setMonth(month.getMonth() + i)
    const monthLabel = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`
    const base = 240_000 + i * 18_000 * (1 + srand(-0.1, 0.1))
    const variance = base * 0.12
    points.push({
      month: monthLabel,
      weightedForecast: Math.round(base),
      commitForecast: Math.round(base * 0.78),
      bestCase: Math.round(base + variance),
      worstCase: Math.round(base - variance),
      closedActual: i < 0 ? Math.round(base * (0.85 + srand(0, 0.2))) : null,
    })
  }
  return points
}

export const forecastTrend: ForecastPoint[] = generateForecast()

// ── KPIs ──

function computeKpis(): KpiItem[] {
  const totalCount = deals.length
  const totalAmount = deals.reduce((s, d) => s + d.amount, 0)
  const weightedAmount = deals.reduce((s, d) => s + d.weightedAmount, 0)
  const advancedCount = deals.filter((d) =>
    ["Proposal", "Negotiation", "Closed Won"].includes(d.stage),
  ).length

  return [
    {
      label: "Open Deals",
      value: `${totalCount}`,
      change: 6.4,
      changeLabel: "vs prev month",
      positiveIsGood: true,
      sparklineData: stageFunnel.map((s) => s.count),
    },
    {
      label: "Pipeline Value",
      value: `$${(totalAmount / 1_000_000).toFixed(2)}M`,
      change: 8.1,
      changeLabel: "vs prev month",
      positiveIsGood: true,
      sparklineData: stageFunnel.map((s) => s.amount),
    },
    {
      label: "Weighted Pipeline",
      value: `$${(weightedAmount / 1000).toFixed(0)}K`,
      change: 4.6,
      changeLabel: "vs prev month",
      positiveIsGood: true,
      sparklineData: stageFunnel.map((s) => s.weightedAmount),
    },
    {
      label: "Advanced-Stage Deals",
      value: `${advancedCount}`,
      change: 12.4,
      changeLabel: "Proposal+",
      positiveIsGood: true,
      sparklineData: STAGE_ORDER.slice(2).map(
        (s) => deals.filter((d) => d.stage === s).length,
      ),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const ownerOptions = [
  { label: "All owners", value: "all" },
  ...OWNERS.map((o) => ({ label: o, value: o })),
]

export const stageOptions = [
  { label: "All stages", value: "all" },
  ...STAGE_ORDER.map((s) => ({ label: s, value: s })),
]

export const STAGE_LIST = STAGE_ORDER
