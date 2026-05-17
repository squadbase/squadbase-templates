import { addDays, format } from "date-fns"
import type {
  KpiItem,
  ComparisonPoint,
  BreakdownSlice,
  TrendPoint,
  CampaignRow,
} from "@/types/ui-template-kpi-chart-advanced"

const BASE_DATE = new Date("2024-03-31")
const DAYS = 30

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const rand = seededRandom(91)

export const trendSeries: TrendPoint[] = Array.from({ length: DAYS }, (_, i) => {
  const date = addDays(BASE_DATE, i - DAYS + 1)
  const base = 2_800_000 + i * 28_000
  const noise = (rand() - 0.5) * 600_000
  const weekday = date.getDay()
  const weekendDip = weekday === 0 || weekday === 6 ? -450_000 : 0
  return {
    date: format(date, "yyyy-MM-dd"),
    value: Math.max(1_000_000, Math.round(base + noise + weekendDip)),
  }
})

const months = [
  "2023-10", "2023-11", "2023-12",
  "2024-01", "2024-02", "2024-03",
]
export const comparisonSeries: ComparisonPoint[] = months.map((m, i) => {
  const current = 32_000_000 + i * 2_800_000 + Math.round((rand() - 0.5) * 3_200_000)
  const previous = Math.round(current / (1 + (0.05 + rand() * 0.18)))
  const growth = ((current - previous) / previous) * 100
  return { period: m, current, previous, growth }
})

export const breakdownSlices: BreakdownSlice[] = [
  { segment: "直接", value: 41_200_000 },
  { segment: "自然検索", value: 31_800_000 },
  { segment: "有料広告", value: 28_700_000 },
  { segment: "リファラル", value: 16_400_000 },
  { segment: "SNS", value: 13_200_000 },
]

const totalRevenue = trendSeries.reduce((s, p) => s + p.value, 0)
const sessions = Math.round(totalRevenue / 640)
const users = Math.round(sessions * 0.62)
const conversions = Math.round(users * 0.0418)
const aov = totalRevenue / Math.max(1, conversions)

function buildSparkline(values: number[], length = 12): number[] {
  const step = Math.max(1, Math.floor(values.length / length))
  const out: number[] = []
  for (let i = 0; i < values.length; i += step) out.push(values[i])
  return out.slice(-length)
}

export const headerKpis: KpiItem[] = [
  {
    id: "revenue",
    label: "総売上",
    value: `¥${(totalRevenue / 100_000_000).toFixed(2)}億`,
    change: 14.2,
    changeLabel: "前期比",
    positiveIsGood: true,
    sparklineData: buildSparkline(trendSeries.map((p) => p.value)),
  },
  {
    id: "users",
    label: "アクティブユーザー",
    value: users.toLocaleString("ja-JP"),
    change: 9.8,
    changeLabel: "前期比",
    positiveIsGood: true,
    sparklineData: buildSparkline(trendSeries.map((p) => Math.round(p.value / 600))),
  },
  {
    id: "sessions",
    label: "セッション数",
    value: sessions.toLocaleString("ja-JP"),
    change: 6.5,
    changeLabel: "前期比",
    positiveIsGood: true,
    sparklineData: buildSparkline(trendSeries.map((p) => Math.round(p.value / 400))),
  },
  {
    id: "conversion",
    label: "コンバージョン率",
    value: `${((conversions / users) * 100).toFixed(2)}%`,
    change: -0.4,
    changeLabel: "前期比",
    positiveIsGood: true,
    sparklineData: buildSparkline(
      trendSeries.map((p) => 4.2 + (p.value / 5_000_000)),
    ),
  },
  {
    id: "aov",
    label: "平均注文額",
    value: `¥${Math.round(aov).toLocaleString("ja-JP")}`,
    change: 5.1,
    changeLabel: "前期比",
    positiveIsGood: true,
    sparklineData: buildSparkline(
      trendSeries.map((p) => p.value / 2_800),
    ),
  },
]

export const campaignRows: CampaignRow[] = [
  { id: "c-01", name: "春の新生活キャンペーン", channel: "リスティング", spend: 4_820_000, conversions: 612, roi: 4.8 },
  { id: "c-02", name: "Q1 ブランド認知", channel: "SNS", spend: 3_460_000, conversions: 421, roi: 3.4 },
  { id: "c-03", name: "ライフサイクルメール", channel: "メール", spend: 1_280_000, conversions: 308, roi: 6.9 },
  { id: "c-04", name: "アフィリエイト強化", channel: "アフィリエイト", spend: 2_210_000, conversions: 254, roi: 4.1 },
  { id: "c-05", name: "リターゲティング", channel: "ディスプレイ", spend: 1_840_000, conversions: 196, roi: 3.2 },
  { id: "c-06", name: "インフルエンサーPilot", channel: "SNS", spend: 1_430_000, conversions: 124, roi: 2.5 },
]
