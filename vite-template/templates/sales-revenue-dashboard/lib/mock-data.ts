import type {
  KpiItem,
  SalesTrendPoint,
  ChannelBreakdown,
  CategoryRankingItem,
  HourlyCumulativePoint,
  LiveOrder,
  AlertEvent,
  FunnelStep,
  ProductCategory,
  Channel,
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
    const weekendFactor = isWeekend(i) ? 1.15 : 1.0 // E-commerce typically peaks on weekends
    const trendFactor = 1 + (89 - i) * 0.004
    const noise = 0.85 + srand(0, 30) / 100
    const baseRevenue = 28_000 * weekendFactor * trendFactor * noise
    const revenue = Math.round(baseRevenue)
    const target = Math.round(30_000 * (1 + (89 - i) * 0.002))
    const aovNoise = 0.9 + srand(0, 20) / 100
    const aov = 85 * aovNoise
    const orders = Math.round(revenue / aov)
    data.push({ date: dateStr(i), revenue, target, orders })
  }
  return data
}

export const dailySalesTrend: SalesTrendPoint[] = generateDailySales()

// ── Sales KPIs (trailing 30 days) ──

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
      label: "GMV",
      value: `$${(revNow / 1_000_000).toFixed(2)}M`,
      change: pct(revNow, revPrev),
      changeLabel: "YoY",
      positiveIsGood: true,
      sparklineData: recent.map((d) => d.revenue),
    },
    {
      label: "Orders",
      value: ordNow.toLocaleString("en-US"),
      change: pct(ordNow, ordPrev),
      changeLabel: "MoM",
      positiveIsGood: true,
      sparklineData: recent.map((d) => d.orders),
    },
    {
      label: "AOV",
      value: `$${Math.round(aovNow).toLocaleString("en-US")}`,
      change: pct(aovNow, aovPrev),
      changeLabel: "MoM",
      positiveIsGood: true,
      sparklineData: recent.map((d) => Math.round(d.revenue / d.orders)),
    },
    {
      label: "Conversion Rate",
      value: `${cvrNow.toFixed(2)}%`,
      change: Math.round((cvrNow - cvrPrev) * 100) / 100,
      changeLabel: "MoM",
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
  { channel: "Organic Search", revenue: 328_000, percentage: 34.8 },
  { channel: "Direct", revenue: 196_000, percentage: 20.8 },
  { channel: "Paid Search", revenue: 142_000, percentage: 15.1 },
  { channel: "Social", revenue: 115_000, percentage: 12.2 },
  { channel: "Email", revenue: 98_000, percentage: 10.4 },
  { channel: "Affiliate", revenue: 63_000, percentage: 6.7 },
]

// ── Category Ranking ──

export const categoryRanking: CategoryRankingItem[] = [
  {
    rank: 1,
    category: "Apparel",
    revenue: 284_500,
    orders: 3320,
    aov: 86,
    shareOfTotal: 30.2,
    yoyChange: 14.2,
  },
  {
    rank: 2,
    category: "Electronics",
    revenue: 221_800,
    orders: 1250,
    aov: 177,
    shareOfTotal: 23.6,
    yoyChange: 8.5,
  },
  {
    rank: 3,
    category: "Beauty",
    revenue: 159_200,
    orders: 2840,
    aov: 56,
    shareOfTotal: 16.9,
    yoyChange: 22.7,
  },
  {
    rank: 4,
    category: "Food & Beverage",
    revenue: 124_800,
    orders: 3910,
    aov: 32,
    shareOfTotal: 13.3,
    yoyChange: -3.1,
  },
  {
    rank: 5,
    category: "Household",
    revenue: 93_400,
    orders: 2150,
    aov: 43,
    shareOfTotal: 9.9,
    yoyChange: 5.8,
  },
  {
    rank: 6,
    category: "Sports",
    revenue: 57_800,
    orders: 640,
    aov: 90,
    shareOfTotal: 6.1,
    yoyChange: 18.4,
  },
]

// ── Hourly Cumulative (today, 0-23h) ──

function generateHourlyCumulative(): HourlyCumulativePoint[] {
  const data: HourlyCumulativePoint[] = []
  let cum = 0
  let prev = 0
  const dailyTarget = 32_000

  // Hourly sales pattern (low overnight → midday peak → evening peak)
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

// Current simulation time = 14:00 of today
export const CURRENT_HOUR = 14
export const hourlyCumulative: HourlyCumulativePoint[] =
  generateHourlyCumulative()

// ── Realtime KPIs ──

function computeRealtimeKpis(): KpiItem[] {
  const current = hourlyCumulative[CURRENT_HOUR]
  const previousHour =
    CURRENT_HOUR > 0 ? hourlyCumulative[CURRENT_HOUR - 1] : null
  const lastHourRevenue = previousHour
    ? current.cumulativeRevenue - previousHour.cumulativeRevenue
    : current.cumulativeRevenue

  const prevDaySameHour = current.prevDayCumulative
  const prevDayHourDelta =
    ((current.cumulativeRevenue - prevDaySameHour) / prevDaySameHour) * 100

  const targetAchievementRate =
    (current.cumulativeRevenue / current.target) * 100

  return [
    {
      label: "Last Hour Revenue",
      value: `$${Math.round(lastHourRevenue).toLocaleString("en-US")}`,
      change: 12.4,
      changeLabel: "vs previous hour",
      positiveIsGood: true,
      sparklineData: hourlyCumulative.slice(0, CURRENT_HOUR + 1).map((h, i, a) => {
        if (i === 0) return h.cumulativeRevenue
        return h.cumulativeRevenue - a[i - 1].cumulativeRevenue
      }),
    },
    {
      label: "vs Previous Day (same hour)",
      value: `${prevDayHourDelta > 0 ? "+" : ""}${prevDayHourDelta.toFixed(1)}%`,
      change: prevDayHourDelta,
      changeLabel: "vs yesterday",
      positiveIsGood: true,
      sparklineData: hourlyCumulative
        .slice(0, CURRENT_HOUR + 1)
        .map((h) => h.cumulativeRevenue - h.prevDayCumulative),
    },
    {
      label: "Target Achievement",
      value: `${targetAchievementRate.toFixed(1)}%`,
      change: targetAchievementRate - 100,
      changeLabel: "vs hourly target",
      positiveIsGood: true,
      sparklineData: hourlyCumulative
        .slice(0, CURRENT_HOUR + 1)
        .map((h) => (h.cumulativeRevenue / h.target) * 100),
    },
    {
      label: "Active Alerts",
      value: "2",
      change: 2,
      changeLabel: "last hour",
      positiveIsGood: false,
      sparklineData: [0, 0, 1, 1, 2, 1, 2, 3, 2, 2],
    },
  ]
}

export const realtimeKpis: KpiItem[] = computeRealtimeKpis()

// ── Live Orders (seed 20 records — more are appended by the UI) ──

const firstNames = [
  "James",
  "Olivia",
  "Liam",
  "Emma",
  "Noah",
  "Ava",
  "Ethan",
  "Sophia",
  "Mason",
  "Isabella",
  "Lucas",
  "Mia",
]
const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
]
const regions = [
  "New York",
  "California",
  "Texas",
  "Florida",
  "Illinois",
  "Washington",
]
const categories: ProductCategory[] = [
  "Apparel",
  "Food & Beverage",
  "Electronics",
  "Household",
  "Beauty",
  "Sports",
]
const channels: Channel[] = [
  "direct",
  "organic",
  "paid_search",
  "social",
  "email",
  "affiliate",
]

function generateSeedLiveOrders(): LiveOrder[] {
  const orders: LiveOrder[] = []
  for (let i = 0; i < 20; i++) {
    const fn = firstNames[srand(0, firstNames.length - 1)]
    const ln = lastNames[srand(0, lastNames.length - 1)]
    const category = categories[srand(0, categories.length - 1)]
    const baseAmount =
      category === "Electronics"
        ? 150 + srand(0, 450)
        : category === "Apparel"
          ? 40 + srand(0, 160)
          : 20 + srand(0, 80)

    // Starting at 14:00 (current time) and stepping backward in seconds
    const secondsAgo = i * srand(15, 90)
    const now = new Date(BASE_DATE)
    now.setHours(CURRENT_HOUR, 0, 0, 0)
    now.setSeconds(now.getSeconds() - secondsAgo)

    orders.push({
      orderId: `ORD-${String(100000 + srand(0, 899999))}`,
      orderedAt: now.toISOString(),
      customerName: `${fn} ${ln}`,
      region: regions[srand(0, regions.length - 1)],
      category,
      channel: channels[srand(0, channels.length - 1)],
      amount: baseAmount,
    })
  }
  return orders
}

export const seedLiveOrders: LiveOrder[] = generateSeedLiveOrders()

/** Order generator used by the pseudo-stream on the UI side (non-seeded) */
export function generateRandomLiveOrder(): LiveOrder {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
  const category = pick(categories)
  const baseAmount =
    category === "Electronics"
      ? 150 + Math.floor(Math.random() * 450)
      : category === "Apparel"
        ? 40 + Math.floor(Math.random() * 160)
        : 20 + Math.floor(Math.random() * 80)

  return {
    orderId: `ORD-${String(100000 + Math.floor(Math.random() * 899999))}`,
    orderedAt: new Date().toISOString(),
    customerName: `${pick(firstNames)} ${pick(lastNames)}`,
    region: pick(regions),
    category,
    channel: pick(channels),
    amount: baseAmount,
  }
}

// ── Alerts ──

export const alertEvents: AlertEvent[] = [
  {
    id: "alert-1",
    firedAt: "2024-03-15T13:42:15",
    severity: "warning",
    title: "Conversion rate below target",
    description: "30-minute CVR fell to 2.1% (threshold 2.5%)",
    metric: "cvr_drop",
    threshold: 2.5,
    observed: 2.1,
  },
  {
    id: "alert-2",
    firedAt: "2024-03-15T13:15:08",
    severity: "critical",
    title: "Sharp revenue drop on Social channel",
    description: "-45% vs previous hour — recommend reviewing ad delivery",
    metric: "revenue_drop",
    threshold: -30,
    observed: -45,
  },
  {
    id: "alert-3",
    firedAt: "2024-03-15T11:08:44",
    severity: "info",
    title: "AOV trending above average",
    description: "Large orders continue in Electronics category (AOV $124)",
    metric: "aov_drop",
    threshold: 90,
    observed: 124,
  },
]

// ── Filter options ──

export const granularityOptions = [
  { label: "Daily", value: "day" },
  { label: "Weekly", value: "week" },
  { label: "Monthly", value: "month" },
]

export const channelOptions = [
  { label: "All channels", value: "all" },
  { label: "Organic Search", value: "organic" },
  { label: "Direct", value: "direct" },
  { label: "Paid Search", value: "paid_search" },
  { label: "Social", value: "social" },
  { label: "Email", value: "email" },
  { label: "Affiliate", value: "affiliate" },
]

export const categoryOptions: { label: string; value: string }[] = [
  { label: "All categories", value: "all" },
  { label: "Apparel", value: "Apparel" },
  { label: "Food & Beverage", value: "Food & Beverage" },
  { label: "Electronics", value: "Electronics" },
  { label: "Household", value: "Household" },
  { label: "Beauty", value: "Beauty" },
  { label: "Sports", value: "Sports" },
]

export const DAILY_REVENUE_TARGET = 32_000

// ── Monthly target / progress (Tab 1: Goal Achievement Card) ──

export const MONTHLY_REVENUE_TARGET = DAILY_REVENUE_TARGET * 30 // $960,000

function computeMonthProgress() {
  const today = BASE_DATE
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate()
  const dayOfMonth = today.getDate()
  const remainingDays = Math.max(0, daysInMonth - dayOfMonth)

  // Treat the last `dayOfMonth` days of revenue as the current month's accumulated total
  const currentRevenue = dailySalesTrend
    .slice(-dayOfMonth)
    .reduce((s, d) => s + d.revenue, 0)

  const achievementRate = (currentRevenue / MONTHLY_REVENUE_TARGET) * 100
  const expectedRate = (dayOfMonth / daysInMonth) * 100 // Pro-rated expected achievement

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

// ── Conversion Funnel (Tab 1: Purchase Funnel) ──
//
// Site visit → Product view → Add to cart → Checkout → Purchase complete
// The final purchase rate is aligned with the CVR (2.84%) in salesKpis.

function computeConversionFunnel(): FunnelStep[] {
  const rates = [100, 58.4, 14.8, 5.7, 2.84]
  const stepLabels = [
    "Site Visit",
    "Product View",
    "Add to Cart",
    "Checkout",
    "Purchase Complete",
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
