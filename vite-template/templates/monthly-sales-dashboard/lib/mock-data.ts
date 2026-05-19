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

const BASE_DATE = new Date("2024-03-31") // anchor at end of latest closed month

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

// ── 12-month trend with YoY comparison ──

const BASE_MONTHLY = 1_250_000 // USD per month baseline
const YOY_GROWTH = 0.12

const MONTHLY_SEASONAL = [
  // Jan..Dec multiplier (retail-style: Nov/Dec peak, Feb dip)
  0.92, 0.85, 0.95, 1.0, 1.02, 1.05, 1.0, 0.98, 1.04, 1.1, 1.18, 1.32,
]

function generateMonthlyTrend(): MonthlyTrendPoint[] {
  const points: MonthlyTrendPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(BASE_DATE)
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const monthIdx = d.getMonth() // 0..11
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

// ── Budget vs Actual waterfall (latest month) ──
// Budget → Volume + Mix +/- Price - Promo + FX → Actual

function generateBudgetWaterfall(): WaterfallStep[] {
  const latestActual = monthlyTrend[monthlyTrend.length - 1].revenue
  const budget = Math.round(latestActual / 1.04) // ~4% beat
  const drivers: { label: string; value: number }[] = [
    { label: "Volume", value: Math.round((latestActual - budget) * 0.55) },
    { label: "Mix", value: Math.round((latestActual - budget) * 0.32) },
    { label: "Price", value: Math.round((latestActual - budget) * 0.41) },
    { label: "Promo", value: -Math.round((latestActual - budget) * 0.18) },
    { label: "FX", value: -Math.round((latestActual - budget) * 0.10) },
  ]
  const steps: WaterfallStep[] = []
  let cum = budget
  steps.push({ label: "Budget", type: "base", value: budget, cumulative: budget })
  for (const d of drivers) {
    cum += d.value
    steps.push({
      label: d.label,
      type: d.value >= 0 ? "positive" : "negative",
      value: d.value,
      cumulative: cum,
    })
  }
  // Force final cumulative to match actual exactly (rounding adjustment)
  const finalDelta = latestActual - cum
  if (finalDelta !== 0) {
    const last = steps[steps.length - 1]
    last.value += finalDelta
    last.cumulative += finalDelta
    cum = latestActual
  }
  steps.push({
    label: "Actual",
    type: "total",
    value: latestActual,
    cumulative: latestActual,
  })
  return steps
}

export const budgetWaterfall: WaterfallStep[] = generateBudgetWaterfall()

// ── Category × month stacked series ──

const CATEGORIES: Category[] = [
  "Apparel",
  "Electronics",
  "Home & Living",
  "Food",
  "Beauty",
]
const CATEGORY_SHARE: Record<Category, number> = {
  Apparel: 0.34,
  Electronics: 0.22,
  "Home & Living": 0.18,
  Food: 0.14,
  Beauty: 0.12,
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

// ── Channel × month stacked series ──

const CHANNELS: Channel[] = ["Retail", "Online", "Wholesale", "Direct"]
const CHANNEL_SHARE: Record<Channel, number> = {
  Retail: 0.42,
  Online: 0.33,
  Wholesale: 0.16,
  Direct: 0.09,
}

function generateChannelMonthly(): ChannelMonthlyPoint[] {
  return monthlyTrend.map((m, i) => {
    // Online share growing over time, retail slightly declining
    const onlineGrowth = (i - 5) * 0.005
    const shares: Record<Channel, number> = {
      Retail: CHANNEL_SHARE.Retail - onlineGrowth,
      Online: CHANNEL_SHARE.Online + onlineGrowth,
      Wholesale: CHANNEL_SHARE.Wholesale,
      Direct: CHANNEL_SHARE.Direct,
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

// ── KPIs ──

function computeKpis(): KpiItem[] {
  const latest = monthlyTrend[monthlyTrend.length - 1]
  const prev = monthlyTrend[monthlyTrend.length - 2]
  const budgetTotal = budgetWaterfall[0].value
  const actual = latest.revenue
  const achievementPct =
    Math.round((actual / budgetTotal) * 1000) / 10
  const grossMargin = 0.382
  const prevGrossMargin = 0.371
  const topSegmentShare =
    CATEGORY_SHARE.Apparel * 100

  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "Monthly Sales",
      value: `$${(actual / 1_000_000).toFixed(2)}M`,
      change: pct(actual, prev.revenue),
      changeLabel: "MoM",
      positiveIsGood: true,
      sparklineData: monthlyTrend.map((m) => m.revenue),
    },
    {
      label: "Budget Achievement",
      value: `${achievementPct.toFixed(1)}%`,
      change: Math.round((achievementPct - 100) * 10) / 10,
      changeLabel: "vs plan",
      positiveIsGood: true,
      sparklineData: monthlyTrend.map((m) => (m.revenue / budgetTotal) * 100),
    },
    {
      label: "YoY Growth",
      value: `${latest.yoyPct >= 0 ? "+" : ""}${latest.yoyPct.toFixed(1)}%`,
      change: latest.yoyPct,
      changeLabel: "vs last year",
      positiveIsGood: true,
      sparklineData: monthlyTrend.map((m) => m.yoyPct),
    },
    {
      label: "Gross Margin",
      value: `${(grossMargin * 100).toFixed(1)}%`,
      change: Math.round((grossMargin - prevGrossMargin) * 1000) / 10,
      changeLabel: "vs prev month",
      positiveIsGood: true,
      sparklineData: monthlyTrend.map((_, i) => 36 + i * 0.2),
    },
    {
      label: "Top Segment Share",
      value: `${topSegmentShare.toFixed(1)}%`,
      change: 1.4,
      changeLabel: "vs last month",
      positiveIsGood: true,
      sparklineData: monthlyTrend.map((_, i) => 32 + i * 0.2),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Segment contributions (used in derive-insights) ──

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

// ── Filter options ──

export const categoryOptions = [
  { label: "All categories", value: "all" },
  ...CATEGORIES.map((c) => ({ label: c, value: c })),
]

export const channelOptions = [
  { label: "All channels", value: "all" },
  ...CHANNELS.map((c) => ({ label: c, value: c })),
]

export const CATEGORY_LIST = CATEGORIES
export const CHANNEL_LIST = CHANNELS
