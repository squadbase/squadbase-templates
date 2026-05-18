import { addDays, format } from "date-fns"
import type { KpiItem, TrendPoint, TopItemRow } from "@/types/ui-template-kpi-chart-simple"

const BASE_DATE = new Date("2024-03-31")
const DAYS = 30

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const rand = seededRandom(42)

export const trendSeries: TrendPoint[] = Array.from({ length: DAYS }, (_, i) => {
  const date = addDays(BASE_DATE, i - DAYS + 1)
  const weekday = date.getDay()
  const weekend = weekday === 0 || weekday === 6
  const base = 42_000 + i * 380
  const noise = (rand() - 0.5) * 9_000
  const weekendDip = weekend ? -7_000 : 0
  const revenue = Math.max(15_000, Math.round(base + noise + weekendDip))
  const orders = Math.round(revenue / 78 + (rand() - 0.5) * 30)
  return {
    date: format(date, "yyyy-MM-dd"),
    revenue,
    orders,
  }
})

function buildSparkline(values: number[], length = 12): number[] {
  const step = Math.max(1, Math.floor(values.length / length))
  const series: number[] = []
  for (let i = 0; i < values.length; i += step) {
    series.push(values[i])
  }
  return series.slice(-length)
}

const totalRevenue = trendSeries.reduce((s, p) => s + p.revenue, 0)
const totalOrders = trendSeries.reduce((s, p) => s + p.orders, 0)
const aov = totalRevenue / totalOrders
const activeUsers = Math.round(totalOrders * 2.4)
const conversionRate = (totalOrders / activeUsers) * 100

export const headerKpis: KpiItem[] = [
  {
    id: "total-revenue",
    label: "Metric 1",
    value: `$${(totalRevenue / 1_000_000).toFixed(2)}M`,
    change: 12.4,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: buildSparkline(trendSeries.map((p) => p.revenue)),
  },
  {
    id: "active-users",
    label: "Metric 2",
    value: activeUsers.toLocaleString("en-US"),
    change: 8.1,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: buildSparkline(
      trendSeries.map((p) => Math.round(p.orders * 2.4)),
    ),
  },
  {
    id: "conversion-rate",
    label: "Metric 3",
    value: `${conversionRate.toFixed(2)}%`,
    change: -0.6,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: buildSparkline(
      trendSeries.map((p) => (p.orders / (p.orders * 2.4)) * 100),
    ),
  },
  {
    id: "aov",
    label: "Metric 4",
    value: `$${aov.toFixed(2)}`,
    change: 3.7,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: buildSparkline(
      trendSeries.map((p) => p.revenue / Math.max(1, p.orders)),
    ),
  },
]

export const topItems: TopItemRow[] = [
  { id: "p-01", name: "Item 1", category: "Category A", revenue: 184_320, units: 1_232, share: 0.142 },
  { id: "p-02", name: "Item 2", category: "Category B", revenue: 162_480, units: 812, share: 0.125 },
  { id: "p-03", name: "Item 3", category: "Category C", revenue: 138_750, units: 463, share: 0.107 },
  { id: "p-04", name: "Item 4", category: "Category D", revenue: 121_900, units: 974, share: 0.094 },
  { id: "p-05", name: "Item 5", category: "Category D", revenue: 98_640, units: 1_644, share: 0.076 },
  { id: "p-06", name: "Item 6", category: "Category B", revenue: 87_220, units: 821, share: 0.067 },
  { id: "p-07", name: "Item 7", category: "Category A", revenue: 81_540, units: 679, share: 0.063 },
  { id: "p-08", name: "Item 8", category: "Category E", revenue: 72_410, units: 905, share: 0.056 },
  { id: "p-09", name: "Item 9", category: "Category E", revenue: 68_900, units: 138, share: 0.053 },
  { id: "p-10", name: "Item 10", category: "Category D", revenue: 54_220, units: 1_356, share: 0.042 },
]
