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

// JA: 円ベースなので USD のおよそ x100 でスケール調整 (1ドル≒150円相当に近づける)
export const trendSeries: TrendPoint[] = Array.from({ length: DAYS }, (_, i) => {
  const date = addDays(BASE_DATE, i - DAYS + 1)
  const weekday = date.getDay()
  const weekend = weekday === 0 || weekday === 6
  const base = 4_200_000 + i * 38_000
  const noise = (rand() - 0.5) * 900_000
  const weekendDip = weekend ? -700_000 : 0
  const revenue = Math.max(1_500_000, Math.round(base + noise + weekendDip))
  const orders = Math.round(revenue / 7_800 + (rand() - 0.5) * 30)
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
    label: "総売上",
    value: `¥${(totalRevenue / 1_000_000).toFixed(1)}M`,
    change: 12.4,
    changeLabel: "前30日比",
    positiveIsGood: true,
    sparklineData: buildSparkline(trendSeries.map((p) => p.revenue)),
  },
  {
    id: "active-users",
    label: "アクティブユーザー",
    value: activeUsers.toLocaleString("ja-JP"),
    change: 8.1,
    changeLabel: "前30日比",
    positiveIsGood: true,
    sparklineData: buildSparkline(
      trendSeries.map((p) => Math.round(p.orders * 2.4)),
    ),
  },
  {
    id: "conversion-rate",
    label: "コンバージョン率",
    value: `${conversionRate.toFixed(2)}%`,
    change: -0.6,
    changeLabel: "前30日比",
    positiveIsGood: true,
    sparklineData: buildSparkline(
      trendSeries.map((p) => (p.orders / (p.orders * 2.4)) * 100),
    ),
  },
  {
    id: "aov",
    label: "平均注文額",
    value: `¥${Math.round(aov).toLocaleString("ja-JP")}`,
    change: 3.7,
    changeLabel: "前30日比",
    positiveIsGood: true,
    sparklineData: buildSparkline(
      trendSeries.map((p) => p.revenue / Math.max(1, p.orders)),
    ),
  },
]

export const topItems: TopItemRow[] = [
  { id: "p-01", name: "Aurora ワイヤレスヘッドホン", category: "オーディオ", revenue: 18_432_000, units: 1_232, share: 0.142 },
  { id: "p-02", name: "Halo スマートウォッチ", category: "ウェアラブル", revenue: 16_248_000, units: 812, share: 0.125 },
  { id: "p-03", name: "Vista 4K アクションカメラ", category: "カメラ", revenue: 13_875_000, units: 463, share: 0.107 },
  { id: "p-04", name: "Nimbus メカニカルキーボード", category: "周辺機器", revenue: 12_190_000, units: 974, share: 0.094 },
  { id: "p-05", name: "Orbit ワイヤレスマウス", category: "周辺機器", revenue: 9_864_000, units: 1_644, share: 0.076 },
  { id: "p-06", name: "Pulse フィットネストラッカー", category: "ウェアラブル", revenue: 8_722_000, units: 821, share: 0.067 },
  { id: "p-07", name: "Echo Bluetooth スピーカー", category: "オーディオ", revenue: 8_154_000, units: 679, share: 0.063 },
  { id: "p-08", name: "Lumen デスクライト", category: "ホーム", revenue: 7_241_000, units: 905, share: 0.056 },
  { id: "p-09", name: "Drift スタンディングデスク", category: "ホーム", revenue: 6_890_000, units: 138, share: 0.053 },
  { id: "p-10", name: "Quasar USB-C ハブ", category: "周辺機器", revenue: 5_422_000, units: 1_356, share: 0.042 },
]
