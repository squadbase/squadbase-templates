import type {
  KpiItem,
  SalesTrendPoint,
  ChannelBreakdown,
  CategoryRankingItem,
  HourlyCumulativePoint,
  TodayCategoryItem,
  AlertEvent,
  FunnelStep,
} from "@/types/sales-revenue"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-15")

function dateStr(daysAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function isWeekend(daysAgo: number): boolean {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  const day = d.getDay()
  return day === 0 || day === 6
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(97)

function srand(min: number, max: number): number {
  return Math.round(min + rng() * (max - min))
}

// ── Daily Sales Trend (90 days) ──

function generateDailySales(): SalesTrendPoint[] {
  const data: SalesTrendPoint[] = []
  for (let i = 89; i >= 0; i--) {
    const weekendFactor = isWeekend(i) ? 1.15 : 1.0 // EC は週末が伸びやすい
    const trendFactor = 1 + (89 - i) * 0.004
    const noise = 0.85 + srand(0, 30) / 100
    const baseRevenue = 2_800_000 * weekendFactor * trendFactor * noise
    const revenue = Math.round(baseRevenue)
    const target = Math.round(3_000_000 * (1 + (89 - i) * 0.002))
    const aovNoise = 0.9 + srand(0, 20) / 100
    const aov = 8500 * aovNoise
    const orders = Math.round(revenue / aov)
    data.push({ date: dateStr(i), revenue, target, orders })
  }
  return data
}

export const dailySalesTrend: SalesTrendPoint[] = generateDailySales()

// ── Sales KPIs (直近30日) ──

function computeSalesKpis(): KpiItem[] {
  const recent = dailySalesTrend.slice(-30)
  const previous = dailySalesTrend.slice(-60, -30)

  const sumRevenue = (arr: SalesTrendPoint[]) =>
    arr.reduce((s, d) => s + d.revenue, 0)
  const sumOrders = (arr: SalesTrendPoint[]) =>
    arr.reduce((s, d) => s + d.orders, 0)

  const revNow = sumRevenue(recent)
  const revPrev = sumRevenue(previous)
  const ordNow = sumOrders(recent)
  const ordPrev = sumOrders(previous)
  const aovNow = revNow / ordNow
  const aovPrev = revPrev / ordPrev

  const cvrNow = 2.84
  const cvrPrev = 2.61

  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "累計売上 (GMV)",
      value: `¥${(revNow / 100_000_000).toFixed(2)}億`,
      change: pct(revNow, revPrev),
      changeLabel: "前年同期比",
      positiveIsGood: true,
      sparklineData: recent.map((d) => d.revenue),
    },
    {
      label: "注文数",
      value: ordNow.toLocaleString("ja-JP"),
      change: pct(ordNow, ordPrev),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: recent.map((d) => d.orders),
    },
    {
      label: "客単価 (AOV)",
      value: `¥${Math.round(aovNow).toLocaleString("ja-JP")}`,
      change: pct(aovNow, aovPrev),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: recent.map((d) => Math.round(d.revenue / d.orders)),
    },
    {
      label: "コンバージョン率",
      value: `${cvrNow.toFixed(2)}%`,
      change: Math.round((cvrNow - cvrPrev) * 100) / 100,
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: recent.map(
        (_, i) => 2.55 + i * 0.01 + srand(-5, 5) / 100,
      ),
    },
  ]
}

export const salesKpis: KpiItem[] = computeSalesKpis()

// ── Channel Breakdown ──

export const channelBreakdown: ChannelBreakdown[] = [
  { channel: "自然検索", revenue: 32_800_000, percentage: 34.8 },
  { channel: "直接アクセス", revenue: 19_600_000, percentage: 20.8 },
  { channel: "有料検索", revenue: 14_200_000, percentage: 15.1 },
  { channel: "ソーシャル", revenue: 11_500_000, percentage: 12.2 },
  { channel: "メール", revenue: 9_800_000, percentage: 10.4 },
  { channel: "アフィリエイト", revenue: 6_300_000, percentage: 6.7 },
]

// ── Category Ranking ──

export const categoryRanking: CategoryRankingItem[] = [
  {
    rank: 1,
    category: "ファッション",
    revenue: 28_450_000,
    orders: 3320,
    aov: 8570,
    shareOfTotal: 30.2,
    yoyChange: 14.2,
  },
  {
    rank: 2,
    category: "家電",
    revenue: 22_180_000,
    orders: 1250,
    aov: 17744,
    shareOfTotal: 23.6,
    yoyChange: 8.5,
  },
  {
    rank: 3,
    category: "コスメ",
    revenue: 15_920_000,
    orders: 2840,
    aov: 5606,
    shareOfTotal: 16.9,
    yoyChange: 22.7,
  },
  {
    rank: 4,
    category: "食品",
    revenue: 12_480_000,
    orders: 3910,
    aov: 3192,
    shareOfTotal: 13.3,
    yoyChange: -3.1,
  },
  {
    rank: 5,
    category: "日用品",
    revenue: 9_340_000,
    orders: 2150,
    aov: 4344,
    shareOfTotal: 9.9,
    yoyChange: 5.8,
  },
  {
    rank: 6,
    category: "スポーツ",
    revenue: 5_780_000,
    orders: 640,
    aov: 9031,
    shareOfTotal: 6.1,
    yoyChange: 18.4,
  },
]

// ── Hourly Cumulative (当日 0-23時) ──

function generateHourlyCumulative(): HourlyCumulativePoint[] {
  const data: HourlyCumulativePoint[] = []
  let cum = 0
  let prev = 0
  const dailyTarget = 3_200_000

  // 時間帯別売上傾向 (深夜低→昼ピーク→夜再ピーク)
  const hourlyWeights = [
    0.5, 0.3, 0.2, 0.2, 0.3, 0.5, 0.8, 1.2, 1.8, 2.2, 2.5, 2.8, 3.0, 2.7, 2.4,
    2.3, 2.5, 3.0, 3.6, 4.1, 3.8, 3.2, 2.4, 1.5,
  ]
  const totalWeight = hourlyWeights.reduce((s, w) => s + w, 0)

  for (let h = 0; h < 24; h++) {
    const hourlyShare = hourlyWeights[h] / totalWeight
    const noise = 0.92 + srand(0, 16) / 100
    const todayRev = dailyTarget * 1.08 * hourlyShare * noise
    const prevRev = dailyTarget * hourlyShare * (0.9 + srand(0, 20) / 100)
    cum += todayRev
    prev += prevRev
    data.push({
      hour: `${String(h).padStart(2, "0")}:00`,
      cumulativeRevenue: Math.round(cum),
      target: Math.round((dailyTarget * (h + 1)) / 24),
      prevDayCumulative: Math.round(prev),
    })
  }
  return data
}

// 現時点のシミュレーション = 当日の14時まで進行している想定
export const CURRENT_HOUR = 14
export const hourlyCumulative: HourlyCumulativePoint[] =
  generateHourlyCumulative()

export const DAILY_REVENUE_TARGET = 3_200_000

// ── Today KPIs (CURRENT_HOUR 時点) ──

function computeTodayKpis(): KpiItem[] {
  const current = hourlyCumulative[CURRENT_HOUR]
  const todayRevenue = current.cumulativeRevenue
  const prevDayRevenue = current.prevDayCumulative

  const todayAov = 8800
  const prevDayAov = 8500
  const todayOrders = Math.round(todayRevenue / todayAov)
  const prevDayOrders = Math.round(prevDayRevenue / prevDayAov)

  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  const hourlyRevenueDeltas = hourlyCumulative
    .slice(0, CURRENT_HOUR + 1)
    .map((h, i, a) => (i === 0 ? h.cumulativeRevenue : h.cumulativeRevenue - a[i - 1].cumulativeRevenue))

  const expectedAtHour = DAILY_REVENUE_TARGET * ((CURRENT_HOUR + 1) / 24)
  const paceVsTarget = (todayRevenue / expectedAtHour) * 100

  return [
    {
      label: "本日売上",
      value: `¥${Math.round(todayRevenue).toLocaleString("ja-JP")}`,
      change: pct(todayRevenue, prevDayRevenue),
      changeLabel: "前日同時刻比",
      positiveIsGood: true,
      sparklineData: hourlyRevenueDeltas,
    },
    {
      label: "本日注文数",
      value: todayOrders.toLocaleString("ja-JP"),
      change: pct(todayOrders, prevDayOrders),
      changeLabel: "前日同時刻比",
      positiveIsGood: true,
      sparklineData: hourlyRevenueDeltas.map((r) => Math.round(r / todayAov)),
    },
    {
      label: "本日 AOV",
      value: `¥${Math.round(todayAov).toLocaleString("ja-JP")}`,
      change: pct(todayAov, prevDayAov),
      changeLabel: "前日比",
      positiveIsGood: true,
      sparklineData: hourlyCumulative
        .slice(0, CURRENT_HOUR + 1)
        .map((_, i) => todayAov + (i - CURRENT_HOUR / 2) * 40),
    },
    {
      label: "目標ペース",
      value: `${paceVsTarget.toFixed(1)}%`,
      change: Math.round((paceVsTarget - 100) * 10) / 10,
      changeLabel: `${String(CURRENT_HOUR).padStart(2, "0")}:00 時点`,
      positiveIsGood: true,
      sparklineData: hourlyCumulative
        .slice(0, CURRENT_HOUR + 1)
        .map((h, i) => {
          const expected = DAILY_REVENUE_TARGET * ((i + 1) / 24)
          return (h.cumulativeRevenue / expected) * 100
        }),
    },
  ]
}

export const todayKpis: KpiItem[] = computeTodayKpis()

// ── 本日のチャネル別売上 (CURRENT_HOUR 時点) ──

export const todayChannelBreakdown: ChannelBreakdown[] = [
  { channel: "自然検索", revenue: 784_000, percentage: 35.2 },
  { channel: "直接アクセス", revenue: 451_000, percentage: 20.3 },
  { channel: "有料検索", revenue: 332_000, percentage: 14.9 },
  { channel: "ソーシャル", revenue: 278_000, percentage: 12.5 },
  { channel: "メール", revenue: 239_000, percentage: 10.7 },
  { channel: "アフィリエイト", revenue: 143_000, percentage: 6.4 },
]

// ── 本日の Top5 カテゴリ (直近30日の1日平均との比較) ──

export const todayCategoryTop5: TodayCategoryItem[] = [
  { rank: 1, category: "ファッション", revenue: 682_000, orders: 79, vsAverage: 12.8 },
  { rank: 2, category: "家電", revenue: 534_000, orders: 30, vsAverage: 18.4 },
  { rank: 3, category: "コスメ", revenue: 396_000, orders: 71, vsAverage: -4.2 },
  { rank: 4, category: "食品", revenue: 291_000, orders: 91, vsAverage: 2.1 },
  { rank: 5, category: "日用品", revenue: 220_000, orders: 51, vsAverage: 6.7 },
]

// ── Alerts ──

export const alertEvents: AlertEvent[] = [
  {
    id: "alert-1",
    firedAt: "2024-03-15T13:42:15",
    severity: "warning",
    title: "コンバージョン率が目標を下回っています",
    description: "直近30分の CVR が 2.1% (閾値 2.5%) に低下",
    metric: "cvr_drop",
    threshold: 2.5,
    observed: 2.1,
  },
  {
    id: "alert-2",
    firedAt: "2024-03-15T13:15:08",
    severity: "critical",
    title: "ソーシャル経由の売上が急落",
    description: "前時間比 -45%、広告配信のチェックを推奨",
    metric: "revenue_drop",
    threshold: -30,
    observed: -45,
  },
  {
    id: "alert-3",
    firedAt: "2024-03-15T11:08:44",
    severity: "info",
    title: "AOV が平均を上回る水準で推移",
    description: "家電カテゴリの大口注文が続いています (AOV ¥12,400)",
    metric: "aov_drop",
    threshold: 9000,
    observed: 12400,
  },
]

// ── Filter options ──

export const granularityOptions = [
  { label: "日次", value: "day" },
  { label: "週次", value: "week" },
  { label: "月次", value: "month" },
]

export const channelOptions = [
  { label: "すべてのチャネル", value: "all" },
  { label: "自然検索", value: "organic" },
  { label: "直接アクセス", value: "direct" },
  { label: "有料検索", value: "paid_search" },
  { label: "ソーシャル", value: "social" },
  { label: "メール", value: "email" },
  { label: "アフィリエイト", value: "affiliate" },
]

export const categoryOptions: { label: string; value: string }[] = [
  { label: "すべてのカテゴリ", value: "all" },
  { label: "ファッション", value: "ファッション" },
  { label: "食品", value: "食品" },
  { label: "家電", value: "家電" },
  { label: "日用品", value: "日用品" },
  { label: "コスメ", value: "コスメ" },
  { label: "スポーツ", value: "スポーツ" },
]

// ── 月次目標 / 進捗 (タブ1: 目標達成カード) ──

export const MONTHLY_REVENUE_TARGET = DAILY_REVENUE_TARGET * 30 // ¥96,000,000

function computeMonthProgress() {
  const today = BASE_DATE
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate()
  const dayOfMonth = today.getDate()
  const remainingDays = Math.max(0, daysInMonth - dayOfMonth)

  // 直近 dayOfMonth 日分の売上を当月累積とみなす
  const currentRevenue = dailySalesTrend
    .slice(-dayOfMonth)
    .reduce((s, d) => s + d.revenue, 0)

  const achievementRate = (currentRevenue / MONTHLY_REVENUE_TARGET) * 100
  const expectedRate = (dayOfMonth / daysInMonth) * 100 // 日割りの想定達成率

  return {
    currentRevenue,
    achievementRate,
    expectedRate,
    dayOfMonth,
    daysInMonth,
    remainingDays,
  }
}

export const monthProgress = computeMonthProgress()

// ── Conversion Funnel (タブ1: 購買ファネル) ──
//
// サイト訪問 → 商品閲覧 → カート追加 → 決済開始 → 購入完了
// 購入完了率は salesKpis の CVR (2.84%) と整合させる

function computeConversionFunnel(): FunnelStep[] {
  const rates = [100, 58.4, 14.8, 5.7, 2.84]
  const stepLabels = [
    "サイト訪問",
    "商品閲覧",
    "カート追加",
    "決済開始",
    "購入完了",
  ]
  const baseVisitors = 125_400
  return rates.map((rate, i) => ({
    step: stepLabels[i],
    users: Math.round((baseVisitors * rate) / 100),
    rate,
    conversionFromPrev: i === 0 ? 100 : Math.round((rate / rates[i - 1]) * 1000) / 10,
  }))
}

export const conversionFunnel: FunnelStep[] = computeConversionFunnel()
