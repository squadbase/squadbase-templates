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

// ── サービス分類とベースコスト (円/月) ──

interface ServiceMeta {
  key: string
  label: string
  baseCost: number
  trend: number
  noise: number
}

const SERVICES: ServiceMeta[] = [
  { key: "compute", label: "Compute (EC2 / GCE)", baseCost: 4_200_000, trend: 0.018, noise: 0.07 },
  { key: "ai-inference", label: "AI推論 (LLM API)", baseCost: 1_420_000, trend: 0.085, noise: 0.12 },
  { key: "storage", label: "ストレージ (S3 / GCS)", baseCost: 1_680_000, trend: 0.012, noise: 0.05 },
  { key: "database", label: "DB (RDS / Cloud SQL)", baseCost: 2_370_000, trend: 0.015, noise: 0.06 },
  { key: "networking", label: "ネットワーク / CDN", baseCost: 1_005_000, trend: 0.008, noise: 0.08 },
  { key: "observability", label: "監視 / オブザーバビリティ", baseCost: 585_000, trend: 0.022, noise: 0.06 },
]

// ── サービス × 月別の積み上げ月次コスト ──

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

// ── AIモデル別のトークンコスト ──

interface ModelMeta {
  name: string
  inputUnitPrice: number // 円 / 1Kトークン
  outputUnitPrice: number
  inputTokens: number
  outputTokens: number
}

const MODELS: ModelMeta[] = [
  {
    name: "gpt-4o",
    inputUnitPrice: 0.375,
    outputUnitPrice: 1.5,
    inputTokens: 142_000_000,
    outputTokens: 38_000_000,
  },
  {
    name: "claude-3-7-sonnet",
    inputUnitPrice: 0.45,
    outputUnitPrice: 2.25,
    inputTokens: 98_500_000,
    outputTokens: 24_300_000,
  },
  {
    name: "gemini-1.5-pro",
    inputUnitPrice: 0.19,
    outputUnitPrice: 0.75,
    inputTokens: 64_200_000,
    outputTokens: 18_100_000,
  },
  {
    name: "claude-3-5-haiku",
    inputUnitPrice: 0.12,
    outputUnitPrice: 0.6,
    inputTokens: 212_000_000,
    outputTokens: 41_600_000,
  },
  {
    name: "gpt-4o-mini",
    inputUnitPrice: 0.023,
    outputUnitPrice: 0.09,
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

// ── リソース別 Top 10 ──

interface ResourceSeed {
  resourceId: string
  resourceName: string
  service: string
  base: number
}

const RESOURCE_SEEDS: ResourceSeed[] = [
  { resourceId: "i-prod-app-01", resourceName: "prod-app-cluster", service: "Compute (EC2 / GCE)", base: 1_260_000 },
  { resourceId: "rds-orders", resourceName: "orders-primary", service: "DB (RDS / Cloud SQL)", base: 1_035_000 },
  { resourceId: "s3-logs", resourceName: "logs-archive", service: "ストレージ (S3 / GCS)", base: 780_000 },
  { resourceId: "llm-gpt-4o", resourceName: "gpt-4o (production)", service: "AI推論 (LLM API)", base: 712_000 },
  { resourceId: "i-batch-gpu", resourceName: "batch-gpu-pool", service: "Compute (EC2 / GCE)", base: 645_000 },
  { resourceId: "rds-analytics", resourceName: "analytics-replica", service: "DB (RDS / Cloud SQL)", base: 570_000 },
  { resourceId: "cdn-edge", resourceName: "edge-cdn-global", service: "ネットワーク / CDN", base: 465_000 },
  { resourceId: "llm-claude-37", resourceName: "claude-3-7-sonnet", service: "AI推論 (LLM API)", base: 443_000 },
  { resourceId: "s3-media", resourceName: "media-bucket", service: "ストレージ (S3 / GCS)", base: 375_000 },
  { resourceId: "obs-datadog", resourceName: "datadog-apm", service: "監視 / オブザーバビリティ", base: 315_000 },
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

// ── ヘッダー KPI ──

function computeKpis(): KpiItem[] {
  const current = serviceMonthly[serviceMonthly.length - 1]
  const prev = serviceMonthly[serviceMonthly.length - 2]
  const pct = (now: number, p: number) =>
    p === 0 ? 0 : Math.round(((now - p) / p) * 1000) / 10

  const topServiceEntry = [...current.series].sort((a, b) => b.cost - a.cost)[0]
  const topShare = (topServiceEntry.cost / current.total) * 100

  const tokenTotal = modelTokenCost.reduce((s, m) => s + m.totalCost, 0)

  const totalSpark = serviceMonthly.map((p) => p.total)
  const topSvcSpark = serviceMonthly.map(
    (p) =>
      p.series.find((s) => s.service === topServiceEntry.service)?.cost ?? 0,
  )
  const aiSpark = serviceMonthly.map(
    (p) => p.series.find((s) => s.service === "AI推論 (LLM API)")?.cost ?? 0,
  )
  const momSpark = serviceMonthly.map((p, i, arr) =>
    i === 0 || arr[i - 1].total === 0
      ? 0
      : ((p.total - arr[i - 1].total) / arr[i - 1].total) * 100,
  )

  return [
    {
      label: "月次クラウドコスト",
      value: `¥${(current.total / 10_000).toFixed(1)}万`,
      change: pct(current.total, prev.total),
      changeLabel: "前月比",
      positiveIsGood: false,
      sparklineData: totalSpark,
    },
    {
      label: "最大サービス比率",
      value: `${topShare.toFixed(1)}%`,
      change: 0,
      changeLabel: topServiceEntry.service,
      positiveIsGood: false,
      sparklineData: topSvcSpark,
    },
    {
      label: "AIトークンコスト",
      value: `¥${(tokenTotal / 10_000).toFixed(1)}万`,
      change: pct(
        current.series.find((s) => s.service === "AI推論 (LLM API)")?.cost ?? 0,
        prev.series.find((s) => s.service === "AI推論 (LLM API)")?.cost ?? 0,
      ),
      changeLabel: "AI 前月比",
      positiveIsGood: false,
      sparklineData: aiSpark,
    },
    {
      label: "前月比",
      value: `${pct(current.total, prev.total) >= 0 ? "+" : ""}${pct(current.total, prev.total).toFixed(1)}%`,
      change: pct(current.total, prev.total),
      changeLabel: "総コスト",
      positiveIsGood: false,
      sparklineData: momSpark,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const serviceOptions = [
  { label: "全サービス", value: "all" },
  ...SERVICES.map((s) => ({ label: s.label, value: s.key })),
]

export const monthOptions = [
  { label: "最新月", value: "all" },
  ...MONTHS.slice()
    .reverse()
    .map((m) => ({ label: m, value: m })),
]
