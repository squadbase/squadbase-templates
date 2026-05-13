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
  // JS: 日=0..土=6  →  月=0..日=6
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

// 曜日係数 — 国内小売は金土日にピーク
const DOW_FACTOR = [0.94, 0.92, 0.95, 1.03, 1.18, 1.32, 1.21] // 月..日

function dailyPattern(daysAgo: number, baseAmount: number): number {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  const dow = dayOfWeekMonZero(d)
  const trend = 1 + (89 - daysAgo) * 0.0025
  const noise = 0.9 + srand(0, 0.2)
  return baseAmount * DOW_FACTOR[dow] * trend * noise
}

// ── 直近 30 日の日次売上 + 7 日移動平均 ──

const BASE_DAILY = 1_850_000 // 円/日

function generateDailySales(): DailySalesPoint[] {
  const points: { date: string; revenue: number; customers: number }[] = []
  // 36 日分生成 → 直近 30 日に対し 7 日移動平均が day -29 から始められるようにする
  for (let i = 35; i >= 0; i--) {
    const revenue = Math.round(dailyPattern(i, BASE_DAILY))
    const aovNoise = 0.92 + srand(0, 0.16)
    const aov = 6_200 * aovNoise
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

// ── 前年同期オーバーレイ ──

function generateYoYOverlay(): YoYSalesPoint[] {
  return dailySalesTrend.map((point, i) => {
    const daysAgo = 29 - i
    const lastYearNoise = 0.85 + srand(0, 0.18)
    const lastYearDamper = 0.88 // YoY +12% 成長を仮定
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

// ── 曜日別ヒートマップ (シグネチャ要素) ──
// 過去 12 週分、月=0..日=6

const WEEKS = 12

function generateDowHeatmap(): DowHeatmapCell[] {
  const cells: DowHeatmapCell[] = []
  for (let w = 0; w < WEEKS; w++) {
    for (let dow = 0; dow < 7; dow++) {
      // Week 0 = 今週 — 「今日」までの曜日のみ埋める
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

// ── 当日サマリー (売上 / 客数 / 客単価) ──

function computeTodaySnapshot(): SnapshotItem[] {
  const today = dailySalesTrend[dailySalesTrend.length - 1]
  const yesterday = dailySalesTrend[dailySalesTrend.length - 2]
  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10
  return [
    {
      id: "revenue",
      label: "当日売上",
      value: `¥${today.revenue.toLocaleString("ja-JP")}`,
      change: pct(today.revenue, yesterday.revenue),
      changeLabel: "前日比",
      positiveIsGood: true,
    },
    {
      id: "customers",
      label: "客数",
      value: today.customers.toLocaleString("ja-JP"),
      change: pct(today.customers, yesterday.customers),
      changeLabel: "前日比",
      positiveIsGood: true,
    },
    {
      id: "aov",
      label: "客単価",
      value: `¥${today.aov.toLocaleString("ja-JP")}`,
      change: pct(today.aov, yesterday.aov),
      changeLabel: "前日比",
      positiveIsGood: true,
    },
  ]
}

export const todaySnapshot: SnapshotItem[] = computeTodaySnapshot()

// ── 週次累計 ──

function computeWeekToDate(): WeekToDate {
  const today = BASE_DATE
  const todayDow = dayOfWeekMonZero(today)
  const last7 = dailySalesTrend.slice(-7)
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

// ── 月次着地予測 ──

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
  const monthlyTarget = Math.round(dailyAvg * daysInMonth * 0.94) // やや高めの目標
  const pctOfTarget = (paceForecast / monthlyTarget) * 100

  return {
    monthLabel: today.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
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

// ── 主要 KPI (ヘッダー直下に並べる 5 枚) ──

function computeKpis(): KpiItem[] {
  const today = dailySalesTrend[dailySalesTrend.length - 1]
  const yesterday = dailySalesTrend[dailySalesTrend.length - 2]
  const yoyToday = yoyOverlay[yoyOverlay.length - 1]
  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "当日売上",
      value: `¥${today.revenue.toLocaleString("ja-JP")}`,
      change: pct(today.revenue, yesterday.revenue),
      changeLabel: "前日比",
      positiveIsGood: true,
      sparklineData: dailySalesTrend.slice(-14).map((d) => d.revenue),
    },
    {
      label: "前日比",
      value: `${pct(today.revenue, yesterday.revenue) >= 0 ? "+" : ""}${pct(today.revenue, yesterday.revenue).toFixed(1)}%`,
      change: pct(today.revenue, yesterday.revenue),
      changeLabel: "前日比",
      positiveIsGood: true,
      sparklineData: dailySalesTrend
        .slice(-14)
        .map((d, i, arr) =>
          i === 0 ? 0 : ((d.revenue - arr[i - 1].revenue) / arr[i - 1].revenue) * 100,
        ),
    },
    {
      label: "前年同日比",
      value: `${pct(yoyToday.currentRevenue, yoyToday.prevYearRevenue) >= 0 ? "+" : ""}${pct(yoyToday.currentRevenue, yoyToday.prevYearRevenue).toFixed(1)}%`,
      change: pct(yoyToday.currentRevenue, yoyToday.prevYearRevenue),
      changeLabel: "前年比",
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
      label: "週次累計",
      value: `¥${weekToDate.cumulativeRevenue.toLocaleString("ja-JP")}`,
      change: pct(weekToDate.cumulativeRevenue, weekToDate.prevWeekCumulative),
      changeLabel: "前週比",
      positiveIsGood: true,
      sparklineData: dailySalesTrend.slice(-7).map((d) => d.revenue),
    },
    {
      label: "月次着地予測",
      value: `¥${(monthForecast.paceForecast / 10_000).toFixed(1)}万`,
      change: Math.round((monthForecast.pctOfTarget - 100) * 10) / 10,
      changeLabel: "目標比",
      positiveIsGood: true,
      sparklineData: dailySalesTrend
        .slice(-monthForecast.daysElapsed)
        .map((d) => d.revenue),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const channelOptions = [
  { label: "全チャネル", value: "all" },
  { label: "店舗", value: "store" },
  { label: "オンライン", value: "online" },
  { label: "卸売", value: "wholesale" },
]

export const storeOptions = [
  { label: "全店舗", value: "all" },
  { label: "都心店", value: "downtown" },
  { label: "東口店", value: "eastside" },
  { label: "西口店", value: "westside" },
  { label: "空港店", value: "airport" },
]
