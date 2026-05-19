import type {
  ServiceMonthlyPoint,
  ModelTokenCost,
  ResourceCostRow,
  KpiItem,
} from "@/types/ai-cloud-cost-analysis"

// ── Helpers ──

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(73)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// Last 12 months ending at the most recent complete month
const BASE_DATE = new Date("2024-03-15")

function monthsList(count: number): string[] {
  const out: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(BASE_DATE.getFullYear(), BASE_DATE.getMonth() - i, 1)
    out.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    )
  }
  return out
}

const MONTHS = monthsList(12)

// ── Service categories & base spend ──

interface ServiceMeta {
  key: string
  label: string
  baseCost: number // USD/month at month index 0
  trend: number // monthly growth rate
  noise: number
}

const SERVICES: ServiceMeta[] = [
  { key: "compute", label: "Compute (EC2 / GCE)", baseCost: 28_000, trend: 0.018, noise: 0.07 },
  { key: "ai-inference", label: "AI Inference (LLM API)", baseCost: 9_500, trend: 0.085, noise: 0.12 },
  { key: "storage", label: "Storage (S3 / GCS)", baseCost: 11_200, trend: 0.012, noise: 0.05 },
  { key: "database", label: "Database (RDS / Cloud SQL)", baseCost: 15_800, trend: 0.015, noise: 0.06 },
  { key: "networking", label: "Networking / CDN", baseCost: 6_700, trend: 0.008, noise: 0.08 },
  { key: "observability", label: "Observability", baseCost: 3_900, trend: 0.022, noise: 0.06 },
]

// ── Service × month stacked monthly cost ──

function generateServiceMonthly(): ServiceMonthlyPoint[] {
  return MONTHS.map((month, mIdx) => {
    const series = SERVICES.map((svc) => {
      const trendFactor = Math.pow(1 + svc.trend, mIdx)
      const noise = 1 + srand(-svc.noise, svc.noise)
      const cost = Math.round(svc.baseCost * trendFactor * noise)
      return { service: svc.label, cost }
    })
    const total = series.reduce((s, p) => s + p.cost, 0)
    return { month, series, total }
  })
}

export const serviceMonthly: ServiceMonthlyPoint[] = generateServiceMonthly()

export const serviceLabels: string[] = SERVICES.map((s) => s.label)

// ── AI model token cost (input/output × unit price) ──

interface ModelMeta {
  name: string
  inputUnitPrice: number // $ per 1K tokens
  outputUnitPrice: number
  inputTokens: number // last month
  outputTokens: number
}

const MODELS: ModelMeta[] = [
  {
    name: "gpt-4o",
    inputUnitPrice: 0.0025,
    outputUnitPrice: 0.01,
    inputTokens: 142_000_000,
    outputTokens: 38_000_000,
  },
  {
    name: "claude-3-7-sonnet",
    inputUnitPrice: 0.003,
    outputUnitPrice: 0.015,
    inputTokens: 98_500_000,
    outputTokens: 24_300_000,
  },
  {
    name: "gemini-1.5-pro",
    inputUnitPrice: 0.00125,
    outputUnitPrice: 0.005,
    inputTokens: 64_200_000,
    outputTokens: 18_100_000,
  },
  {
    name: "claude-3-5-haiku",
    inputUnitPrice: 0.0008,
    outputUnitPrice: 0.004,
    inputTokens: 212_000_000,
    outputTokens: 41_600_000,
  },
  {
    name: "gpt-4o-mini",
    inputUnitPrice: 0.00015,
    outputUnitPrice: 0.0006,
    inputTokens: 356_000_000,
    outputTokens: 72_500_000,
  },
]

function generateModelTokenCost(): ModelTokenCost[] {
  return MODELS.map((m) => {
    const inputCost = (m.inputTokens / 1_000) * m.inputUnitPrice
    const outputCost = (m.outputTokens / 1_000) * m.outputUnitPrice
    return {
      model: m.name,
      inputTokens: m.inputTokens,
      outputTokens: m.outputTokens,
      inputUnitPrice: m.inputUnitPrice,
      outputUnitPrice: m.outputUnitPrice,
      inputCost: Math.round(inputCost),
      outputCost: Math.round(outputCost),
      totalCost: Math.round(inputCost + outputCost),
    }
  }).sort((a, b) => b.totalCost - a.totalCost)
}

export const modelTokenCost: ModelTokenCost[] = generateModelTokenCost()

// ── Resource Top 10 by monthly cost ──

interface ResourceSeed {
  resourceId: string
  resourceName: string
  service: string
  base: number
}

const RESOURCE_SEEDS: ResourceSeed[] = [
  { resourceId: "i-prod-app-01", resourceName: "prod-app-cluster", service: "Compute (EC2 / GCE)", base: 8_400 },
  { resourceId: "rds-orders", resourceName: "orders-primary", service: "Database (RDS / Cloud SQL)", base: 6_900 },
  { resourceId: "s3-logs", resourceName: "logs-archive", service: "Storage (S3 / GCS)", base: 5_200 },
  { resourceId: "llm-gpt-4o", resourceName: "gpt-4o (production)", service: "AI Inference (LLM API)", base: 4_750 },
  { resourceId: "i-batch-gpu", resourceName: "batch-gpu-pool", service: "Compute (EC2 / GCE)", base: 4_300 },
  { resourceId: "rds-analytics", resourceName: "analytics-replica", service: "Database (RDS / Cloud SQL)", base: 3_800 },
  { resourceId: "cdn-edge", resourceName: "edge-cdn-global", service: "Networking / CDN", base: 3_100 },
  { resourceId: "llm-claude-37", resourceName: "claude-3-7-sonnet", service: "AI Inference (LLM API)", base: 2_950 },
  { resourceId: "s3-media", resourceName: "media-bucket", service: "Storage (S3 / GCS)", base: 2_500 },
  { resourceId: "obs-datadog", resourceName: "datadog-apm", service: "Observability", base: 2_100 },
]

function generateResourceTop(): ResourceCostRow[] {
  return RESOURCE_SEEDS.map((r) => {
    const noiseNow = 1 + srand(-0.05, 0.08)
    const noisePrev = 1 + srand(-0.06, 0.04)
    const monthlyCost = Math.round(r.base * noiseNow)
    const prevMonthCost = Math.round(r.base * 0.93 * noisePrev)
    const changePct =
      prevMonthCost === 0
        ? 0
        : Math.round(((monthlyCost - prevMonthCost) / prevMonthCost) * 1000) / 10
    return {
      resourceId: r.resourceId,
      resourceName: r.resourceName,
      service: r.service,
      monthlyCost,
      prevMonthCost,
      changePct,
    }
  }).sort((a, b) => b.monthlyCost - a.monthlyCost)
}

export const resourceTop: ResourceCostRow[] = generateResourceTop()

// ── Header KPIs ──

function computeKpis(): KpiItem[] {
  const current = serviceMonthly[serviceMonthly.length - 1]
  const prev = serviceMonthly[serviceMonthly.length - 2]
  const pct = (now: number, p: number) =>
    p === 0 ? 0 : Math.round(((now - p) / p) * 1000) / 10

  // Top service share
  const topServiceEntry = [...current.series].sort((a, b) => b.cost - a.cost)[0]
  const topShare = (topServiceEntry.cost / current.total) * 100

  // Total AI token cost
  const tokenTotal = modelTokenCost.reduce((s, m) => s + m.totalCost, 0)

  // Sparkline data (12-month totals)
  const totalSpark = serviceMonthly.map((p) => p.total)
  const topSvcSpark = serviceMonthly.map(
    (p) =>
      p.series.find((s) => s.service === topServiceEntry.service)?.cost ?? 0,
  )
  const aiSpark = serviceMonthly.map(
    (p) =>
      p.series.find((s) => s.service === "AI Inference (LLM API)")?.cost ?? 0,
  )
  const momSpark = serviceMonthly.map((p, i, arr) =>
    i === 0 || arr[i - 1].total === 0
      ? 0
      : ((p.total - arr[i - 1].total) / arr[i - 1].total) * 100,
  )

  return [
    {
      label: "Monthly Cloud Cost",
      value: `$${(current.total / 1_000).toFixed(1)}K`,
      change: pct(current.total, prev.total),
      changeLabel: "vs prev month",
      positiveIsGood: false,
      sparklineData: totalSpark,
    },
    {
      label: "Top Service Share",
      value: `${topShare.toFixed(1)}%`,
      change: 0,
      changeLabel: topServiceEntry.service,
      positiveIsGood: false,
      sparklineData: topSvcSpark,
    },
    {
      label: "AI Token Cost",
      value: `$${(tokenTotal / 1_000).toFixed(1)}K`,
      change: pct(
        current.series.find((s) => s.service === "AI Inference (LLM API)")
          ?.cost ?? 0,
        prev.series.find((s) => s.service === "AI Inference (LLM API)")?.cost ??
          0,
      ),
      changeLabel: "AI svc MoM",
      positiveIsGood: false,
      sparklineData: aiSpark,
    },
    {
      label: "Month-over-Month",
      value: `${pct(current.total, prev.total) >= 0 ? "+" : ""}${pct(current.total, prev.total).toFixed(1)}%`,
      change: pct(current.total, prev.total),
      changeLabel: "total cost",
      positiveIsGood: false,
      sparklineData: momSpark,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const serviceOptions = [
  { label: "All services", value: "all" },
  ...SERVICES.map((s) => ({ label: s.label, value: s.key })),
]

export const monthOptions = [
  { label: "Latest month", value: "all" },
  ...MONTHS.slice()
    .reverse()
    .map((m) => ({ label: m, value: m })),
]
