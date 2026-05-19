import type {
  DailySalesPoint,
  YoYSalesPoint,
  DowHeatmapCell,
  KpiItem,
  SnapshotItem,
  MonthForecast,
  WeekToDate,
} from "@/types/daily-sales-monitoring"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-15")

function dateStr(daysAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function dayOfWeekMonZero(d: Date): number {
  // JS: Sun=0..Sat=6  →  Mon=0..Sun=6
  return (d.getDay() + 6) % 7
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(11)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// Base daily-pattern multipliers — weekends and Fridays peak for retail
const DOW_FACTOR = [0.94, 0.92, 0.95, 1.03, 1.18, 1.32, 1.21] // Mon..Sun

function dailyPattern(daysAgo: number, baseAmount: number): number {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  const dow = dayOfWeekMonZero(d)
  const trend = 1 + (89 - daysAgo) * 0.0025
  const noise = 0.9 + srand(0, 0.2)
  return baseAmount * DOW_FACTOR[dow] * trend * noise
}

// ── Daily Sales Trend (last 30 days + 7-day moving average) ──

const BASE_DAILY = 18_500

function generateDailySales(): DailySalesPoint[] {
  const points: { date: string; revenue: number; customers: number }[] = []
  // Generate 36 days so the first 7-day moving avg point starts at day -29
  for (let i = 35; i >= 0; i--) {
    const revenue = Math.round(dailyPattern(i, BASE_DAILY))
    const aovNoise = 0.92 + srand(0, 0.16)
    const aov = 62 * aovNoise
    const customers = Math.round(revenue / aov)
    points.push({ date: dateStr(i), revenue, customers })
  }
  const trimmed = points.slice(-30)
  return trimmed.map((p, i) => {
    const start = Math.max(0, points.length - 30 - 6 + i)
    const window = points.slice(start, points.length - 30 + i + 1)
    const sum = window.reduce((s, w) => s + w.revenue, 0)
    const movingAvg7 = window.length === 7 ? Math.round(sum / 7) : null
    const aov = p.customers > 0 ? Math.round(p.revenue / p.customers) : 0
    return {
      date: p.date,
      revenue: p.revenue,
      movingAvg7,
      customers: p.customers,
      aov,
    }
  })
}

export const dailySalesTrend: DailySalesPoint[] = generateDailySales()

// ── YoY overlay (last 30 days vs same days previous year) ──

function generateYoYOverlay(): YoYSalesPoint[] {
  return dailySalesTrend.map((point, i) => {
    const daysAgo = 29 - i
    const lastYearNoise = 0.85 + srand(0, 0.18)
    const lastYearDamper = 0.88 // assume ~12% YoY growth on average
    return {
      date: point.date,
      currentRevenue: point.revenue,
      prevYearRevenue: Math.round(
        dailyPattern(daysAgo, BASE_DAILY) * lastYearDamper * lastYearNoise,
      ),
    }
  })
}

export const yoyOverlay: YoYSalesPoint[] = generateYoYOverlay()

// ── Day-of-week × week heatmap (signature element) ──
// 12 weeks back, Mon=0..Sun=6

const WEEKS = 12

function generateDowHeatmap(): DowHeatmapCell[] {
  const cells: DowHeatmapCell[] = []
  for (let w = 0; w < WEEKS; w++) {
    for (let dow = 0; dow < 7; dow++) {
      // Week 0 = current week — only fill days up through "today"
      const today = BASE_DATE
      const todayDow = dayOfWeekMonZero(today)
      if (w === 0 && dow > todayDow) continue
      const daysAgo = w * 7 + (todayDow - dow)
      const revenue = Math.round(dailyPattern(daysAgo, BASE_DAILY))
      cells.push({
        dayOfWeek: dow,
        weekIndex: w,
        date: dateStr(daysAgo),
        revenue,
      })
    }
  }
  return cells
}

export const dowHeatmap: DowHeatmapCell[] = generateDowHeatmap()

// ── Today snapshot (Revenue / Customers / AOV) ──

function computeTodaySnapshot(): SnapshotItem[] {
  const today = dailySalesTrend[dailySalesTrend.length - 1]
  const yesterday = dailySalesTrend[dailySalesTrend.length - 2]
  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10
  return [
    {
      id: "revenue",
      label: "Today's Revenue",
      value: `$${today.revenue.toLocaleString("en-US")}`,
      change: pct(today.revenue, yesterday.revenue),
      changeLabel: "vs yesterday",
      positiveIsGood: true,
    },
    {
      id: "customers",
      label: "Customers",
      value: today.customers.toLocaleString("en-US"),
      change: pct(today.customers, yesterday.customers),
      changeLabel: "vs yesterday",
      positiveIsGood: true,
    },
    {
      id: "aov",
      label: "Average Order Value",
      value: `$${today.aov.toLocaleString("en-US")}`,
      change: pct(today.aov, yesterday.aov),
      changeLabel: "vs yesterday",
      positiveIsGood: true,
    },
  ]
}

export const todaySnapshot: SnapshotItem[] = computeTodaySnapshot()

// ── Week-to-date ──

function computeWeekToDate(): WeekToDate {
  const today = BASE_DATE
  const todayDow = dayOfWeekMonZero(today)
  const last7 = dailySalesTrend.slice(-7)
  // From the last 7 days, the first `todayDow + 1` entries form the current
  // week-to-date (Mon..today). Days before that form the previous week tail.
  const wtdSlice = last7.slice(last7.length - (todayDow + 1))
  const prevWeekSlice = dailySalesTrend.slice(
    -(7 + todayDow + 1),
    -(todayDow + 1),
  )
  const cumulativeRevenue = wtdSlice.reduce((s, d) => s + d.revenue, 0)
  const prevWeekCumulative = prevWeekSlice
    .slice(0, todayDow + 1)
    .reduce((s, d) => s + d.revenue, 0)
  return {
    weekStartDate: wtdSlice[0]?.date ?? dailySalesTrend[0].date,
    cumulativeRevenue,
    prevWeekCumulative,
  }
}

export const weekToDate: WeekToDate = computeWeekToDate()

// ── Month forecast (run-rate projection) ──

function computeMonthForecast(): MonthForecast {
  const today = BASE_DATE
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysElapsed = today.getDate()

  const monthTrend = dailySalesTrend.slice(-daysElapsed)
  const actualToDate = monthTrend.reduce((s, d) => s + d.revenue, 0)
  const dailyAvg = actualToDate / daysElapsed
  const paceForecast = Math.round(dailyAvg * daysInMonth)
  const monthlyTarget = Math.round(dailyAvg * daysInMonth * 0.94) // gentle stretch goal
  const pctOfTarget = (paceForecast / monthlyTarget) * 100

  return {
    monthLabel: today.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    daysElapsed,
    daysInMonth,
    actualToDate,
    paceForecast,
    monthlyTarget,
    pctOfTarget,
  }
}

export const monthForecast: MonthForecast = computeMonthForecast()

// ── Top-line KPIs (header summary) ──

function computeKpis(): KpiItem[] {
  const today = dailySalesTrend[dailySalesTrend.length - 1]
  const yesterday = dailySalesTrend[dailySalesTrend.length - 2]
  const yoyToday = yoyOverlay[yoyOverlay.length - 1]
  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "Today's Sales",
      value: `$${today.revenue.toLocaleString("en-US")}`,
      change: pct(today.revenue, yesterday.revenue),
      changeLabel: "vs yesterday",
      positiveIsGood: true,
      sparklineData: dailySalesTrend.slice(-14).map((d) => d.revenue),
    },
    {
      label: "Day-over-Day",
      value: `${pct(today.revenue, yesterday.revenue) >= 0 ? "+" : ""}${pct(today.revenue, yesterday.revenue).toFixed(1)}%`,
      change: pct(today.revenue, yesterday.revenue),
      changeLabel: "vs yesterday",
      positiveIsGood: true,
      sparklineData: dailySalesTrend
        .slice(-14)
        .map((d, i, arr) =>
          i === 0 ? 0 : ((d.revenue - arr[i - 1].revenue) / arr[i - 1].revenue) * 100,
        ),
    },
    {
      label: "YoY (same day)",
      value: `${pct(yoyToday.currentRevenue, yoyToday.prevYearRevenue) >= 0 ? "+" : ""}${pct(yoyToday.currentRevenue, yoyToday.prevYearRevenue).toFixed(1)}%`,
      change: pct(yoyToday.currentRevenue, yoyToday.prevYearRevenue),
      changeLabel: "vs last year",
      positiveIsGood: true,
      sparklineData: yoyOverlay
        .slice(-14)
        .map((p) =>
          p.prevYearRevenue === 0
            ? 0
            : ((p.currentRevenue - p.prevYearRevenue) / p.prevYearRevenue) * 100,
        ),
    },
    {
      label: "Week-to-Date",
      value: `$${weekToDate.cumulativeRevenue.toLocaleString("en-US")}`,
      change: pct(weekToDate.cumulativeRevenue, weekToDate.prevWeekCumulative),
      changeLabel: "vs prev week",
      positiveIsGood: true,
      sparklineData: dailySalesTrend.slice(-7).map((d) => d.revenue),
    },
    {
      label: "Month Forecast",
      value: `$${(monthForecast.paceForecast / 1000).toFixed(1)}K`,
      change:
        Math.round((monthForecast.pctOfTarget - 100) * 10) / 10,
      changeLabel: "vs target",
      positiveIsGood: true,
      sparklineData: dailySalesTrend
        .slice(-monthForecast.daysElapsed)
        .map((d) => d.revenue),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const channelOptions = [
  { label: "All channels", value: "all" },
  { label: "Store", value: "store" },
  { label: "Online", value: "online" },
  { label: "Wholesale", value: "wholesale" },
]

export const storeOptions = [
  { label: "All stores", value: "all" },
  { label: "Downtown", value: "downtown" },
  { label: "Eastside", value: "eastside" },
  { label: "Westside", value: "westside" },
  { label: "Airport", value: "airport" },
]
