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
  const base = 28_000 + i * 280
  const noise = (rand() - 0.5) * 6_000
  const weekday = date.getDay()
  const weekendDip = weekday === 0 || weekday === 6 ? -4_500 : 0
  return {
    date: format(date, "yyyy-MM-dd"),
    value: Math.max(10_000, Math.round(base + noise + weekendDip)),
  }
})

const months = [
  "2023-10", "2023-11", "2023-12",
  "2024-01", "2024-02", "2024-03",
]
export const comparisonSeries: ComparisonPoint[] = months.map((m, i) => {
  const current = 320_000 + i * 28_000 + Math.round((rand() - 0.5) * 32_000)
  const previous = Math.round(current / (1 + (0.05 + rand() * 0.18)))
  const growth = ((current - previous) / previous) * 100
  return { period: m, current, previous, growth }
})

export const breakdownSlices: BreakdownSlice[] = [
  { segment: "Segment 1", value: 412_000 },
  { segment: "Segment 2", value: 318_000 },
  { segment: "Segment 3", value: 287_000 },
  { segment: "Segment 4", value: 164_000 },
  { segment: "Segment 5", value: 132_000 },
]

function buildSparkline(values: number[], length = 12): number[] {
  const step = Math.max(1, Math.floor(values.length / length))
  const out: number[] = []
  for (let i = 0; i < values.length; i += step) out.push(values[i])
  return out.slice(-length)
}

export const headerKpis: KpiItem[] = [
  {
    id: "revenue",
    label: "Metric 1",
    value: "$1.04M",
    change: 14.2,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: buildSparkline(trendSeries.map((p) => p.value)),
  },
  {
    id: "users",
    label: "Metric 2",
    value: "82,400",
    change: 9.8,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: buildSparkline(trendSeries.map((p) => Math.round(p.value / 6))),
  },
  {
    id: "sessions",
    label: "Metric 3",
    value: "132,900",
    change: 6.5,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: buildSparkline(trendSeries.map((p) => Math.round(p.value / 4))),
  },
  {
    id: "conversion",
    label: "Metric 4",
    value: "4.18%",
    change: -0.4,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: buildSparkline(
      trendSeries.map((p) => 4.2 + (p.value / 50_000)),
    ),
  },
  {
    id: "aov",
    label: "Metric 5",
    value: "$12.62",
    change: 5.1,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: buildSparkline(
      trendSeries.map((p) => p.value / 28),
    ),
  },
]

export const campaignRows: CampaignRow[] = [
  { id: "c-01", name: "Item 1", channel: "Group A", spend: 48_200, conversions: 612, roi: 4.8 },
  { id: "c-02", name: "Item 2", channel: "Group B", spend: 34_600, conversions: 421, roi: 3.4 },
  { id: "c-03", name: "Item 3", channel: "Group C", spend: 12_800, conversions: 308, roi: 6.9 },
  { id: "c-04", name: "Item 4", channel: "Group D", spend: 22_100, conversions: 254, roi: 4.1 },
  { id: "c-05", name: "Item 5", channel: "Group E", spend: 18_400, conversions: 196, roi: 3.2 },
  { id: "c-06", name: "Item 6", channel: "Group B", spend: 14_300, conversions: 124, roi: 2.5 },
]
