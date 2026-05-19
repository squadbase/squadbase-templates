import type {
  Category,
  Channel,
  MonthlyTrendPoint,
  WaterfallStep,
  CategoryMonthlyPoint,
  ChannelMonthlyPoint,
  KpiItem,
  SegmentContribution,
} from "@/types/monthly-sales-dashboard"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-31")

function ym(monthsAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(23)
function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── 12ヶ月の月次トレンド + YoY ──

const BASE_MONTHLY = 125_000_000 // 月次 1.25 億円ベース
const YOY_GROWTH = 0.12

const MONTHLY_SEASONAL = [
  0.92, 0.85, 0.95, 1.0, 1.02, 1.05, 1.0, 0.98, 1.04, 1.1, 1.18, 1.32,
]

function generateMonthlyTrend(): MonthlyTrendPoint[] {
  const points: MonthlyTrendPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(BASE_DATE)
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const monthIdx = d.getMonth()
    const seasonal = MONTHLY_SEASONAL[monthIdx]
    const trend = 1 + (11 - i) * 0.004
    const noise = 0.94 + srand(0, 0.12)
    const revenue = Math.round(BASE_MONTHLY * seasonal * trend * noise)
    const prevYearNoise = 0.92 + srand(0, 0.14)
    const prevYearRevenue = Math.round(
      (BASE_MONTHLY * seasonal * prevYearNoise) / (1 + YOY_GROWTH),
    )
    const yoyPct =
      Math.round(((revenue - prevYearRevenue) / prevYearRevenue) * 1000) / 10
    points.push({ yearMonth: ym(i), revenue, prevYearRevenue, yoyPct })
  }
  return points
}

export const monthlyTrend: MonthlyTrendPoint[] = generateMonthlyTrend()

// ── 予算 vs 実績ウォーターフォール (直近月) ──

function generateBudgetWaterfall(): WaterfallStep[] {
  const latestActual = monthlyTrend[monthlyTrend.length - 1].revenue
  const budget = Math.round(latestActual / 1.04)
  const drivers: { label: string; value: number }[] = [
    { label: "数量", value: Math.round((latestActual - budget) * 0.55) },
    { label: "ミックス", value: Math.round((latestActual - budget) * 0.32) },
    { label: "価格", value: Math.round((latestActual - budget) * 0.41) },
    { label: "販促", value: -Math.round((latestActual - budget) * 0.18) },
    { label: "為替", value: -Math.round((latestActual - budget) * 0.10) },
  ]
  const steps: WaterfallStep[] = []
  let cum = budget
  steps.push({ label: "予算", type: "base", value: budget, cumulative: budget })
  for (const d of drivers) {
    cum += d.value
    steps.push({
      label: d.label,
      type: d.value >= 0 ? "positive" : "negative",
      value: d.value,
      cumulative: cum,
    })
  }
  const finalDelta = latestActual - cum
  if (finalDelta !== 0) {
    const last = steps[steps.length - 1]
    last.value += finalDelta
    last.cumulative += finalDelta
    cum = latestActual
  }
  steps.push({
    label: "実績",
    type: "total",
    value: latestActual,
    cumulative: latestActual,
  })
  return steps
}

export const budgetWaterfall: WaterfallStep[] = generateBudgetWaterfall()

// ── カテゴリ × 月次スタック ──

const CATEGORIES: Category[] = [
  "アパレル",
  "家電",
  "ホーム&リビング",
  "食品",
  "ビューティー",
]
const CATEGORY_SHARE: Record<Category, number> = {
  アパレル: 0.34,
  家電: 0.22,
  "ホーム&リビング": 0.18,
  食品: 0.14,
  ビューティー: 0.12,
}

function generateCategoryMonthly(): CategoryMonthlyPoint[] {
  return monthlyTrend.map((m) => {
    const values = {} as Record<Category, number>
    for (const cat of CATEGORIES) {
      const noise = 0.88 + srand(0, 0.22)
      values[cat] = Math.round(m.revenue * CATEGORY_SHARE[cat] * noise)
    }
    return { yearMonth: m.yearMonth, values }
  })
}

export const categoryMonthly: CategoryMonthlyPoint[] = generateCategoryMonthly()

// ── チャネル × 月次スタック ──

const CHANNELS: Channel[] = ["店舗", "EC", "卸売", "直販"]
const CHANNEL_SHARE: Record<Channel, number> = {
  店舗: 0.42,
  EC: 0.33,
  卸売: 0.16,
  直販: 0.09,
}

function generateChannelMonthly(): ChannelMonthlyPoint[] {
  return monthlyTrend.map((m, i) => {
    const onlineGrowth = (i - 5) * 0.005
    const shares: Record<Channel, number> = {
      店舗: CHANNEL_SHARE.店舗 - onlineGrowth,
      EC: CHANNEL_SHARE.EC + onlineGrowth,
      卸売: CHANNEL_SHARE.卸売,
      直販: CHANNEL_SHARE.直販,
    }
    const values = {} as Record<Channel, number>
    for (const ch of CHANNELS) {
      const noise = 0.9 + srand(0, 0.18)
      values[ch] = Math.round(m.revenue * shares[ch] * noise)
    }
    return { yearMonth: m.yearMonth, values }
  })
}

export const channelMonthly: ChannelMonthlyPoint[] = generateChannelMonthly()

// ── KPI ──

function computeKpis(): KpiItem[] {
  const latest = monthlyTrend[monthlyTrend.length - 1]
  const prev = monthlyTrend[monthlyTrend.length - 2]
  const budgetTotal = budgetWaterfall[0].value
  const actual = latest.revenue
  const achievementPct = Math.round((actual / budgetTotal) * 1000) / 10
  const grossMargin = 0.382
  const prevGrossMargin = 0.371
  const topSegmentShare = CATEGORY_SHARE.アパレル * 100

  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "月次売上",
      value: `¥${(actual / 100_000_000).toFixed(2)}億`,
      change: pct(actual, prev.revenue),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: monthlyTrend.map((m) => m.revenue),
    },
    {
      label: "予算達成率",
      value: `${achievementPct.toFixed(1)}%`,
      change: Math.round((achievementPct - 100) * 10) / 10,
      changeLabel: "対予算",
      positiveIsGood: true,
      sparklineData: monthlyTrend.map((m) => (m.revenue / budgetTotal) * 100),
    },
    {
      label: "YoY成長率",
      value: `${latest.yoyPct >= 0 ? "+" : ""}${latest.yoyPct.toFixed(1)}%`,
      change: latest.yoyPct,
      changeLabel: "前年同月比",
      positiveIsGood: true,
      sparklineData: monthlyTrend.map((m) => m.yoyPct),
    },
    {
      label: "粗利率",
      value: `${(grossMargin * 100).toFixed(1)}%`,
      change: Math.round((grossMargin - prevGrossMargin) * 1000) / 10,
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: monthlyTrend.map((_, i) => 36 + i * 0.2),
    },
    {
      label: "首位セグメント寄与",
      value: `${topSegmentShare.toFixed(1)}%`,
      change: 1.4,
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: monthlyTrend.map((_, i) => 32 + i * 0.2),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── セグメント寄与度 ──

export function segmentContributions(): SegmentContribution[] {
  const totals = {} as Record<Category, number>
  for (const cat of CATEGORIES) totals[cat] = 0
  for (const point of categoryMonthly) {
    for (const cat of CATEGORIES) totals[cat] += point.values[cat]
  }
  const grand = Object.values(totals).reduce((s, v) => s + v, 0)
  return CATEGORIES.map((cat) => ({
    name: cat,
    revenue: totals[cat],
    share: Math.round((totals[cat] / grand) * 1000) / 10,
  })).sort((a, b) => b.revenue - a.revenue)
}

// ── フィルター選択肢 ──

export const categoryOptions = [
  { label: "全カテゴリ", value: "all" },
  ...CATEGORIES.map((c) => ({ label: c, value: c })),
]

export const channelOptions = [
  { label: "全チャネル", value: "all" },
  ...CHANNELS.map((c) => ({ label: c, value: c })),
]

export const CATEGORY_LIST = CATEGORIES
export const CHANNEL_LIST = CHANNELS
