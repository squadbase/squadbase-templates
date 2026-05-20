import { addDays, format } from "date-fns"
import type {
  KpiItem,
  TrendPoint,
  CategoryRow,
  DetailRow,
} from "@/types/ui-template-tabbed-dashboard"

const BASE_DATE = new Date("2024-03-31")
const DAYS = 30

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const rand = seededRandom(57)

export const trendSeries: TrendPoint[] = Array.from({ length: DAYS }, (_, i) => {
  const date = addDays(BASE_DATE, i - DAYS + 1)
  const base = 38_000 + i * 320 + (rand() - 0.5) * 7_000
  return {
    date: format(date, "yyyy-MM-dd"),
    value: Math.max(15_000, Math.round(base)),
  }
})

const totalRev = trendSeries.reduce((s, p) => s + p.value, 0)

export const categoryRows: CategoryRow[] = [
  { category: "Category 1", value: Math.round(totalRev * 0.28), share: 0.28, delta: 5.4 },
  { category: "Category 2", value: Math.round(totalRev * 0.22), share: 0.22, delta: 8.1 },
  { category: "Category 3", value: Math.round(totalRev * 0.20), share: 0.20, delta: -2.3 },
  { category: "Category 4", value: Math.round(totalRev * 0.18), share: 0.18, delta: 3.7 },
  { category: "Category 5", value: Math.round(totalRev * 0.12), share: 0.12, delta: 1.2 },
]

export const detailRows: DetailRow[] = [
  { id: "d-01", name: "Item 1", owner: "Owner 1", status: "active", value: 184_320, units: 1_232 },
  { id: "d-02", name: "Item 2", owner: "Owner 2", status: "active", value: 162_480, units: 812 },
  { id: "d-03", name: "Item 3", owner: "Owner 3", status: "active", value: 138_750, units: 463 },
  { id: "d-04", name: "Item 4", owner: "Owner 4", status: "paused", value: 121_900, units: 974 },
  { id: "d-05", name: "Item 5", owner: "Owner 5", status: "active", value: 98_640, units: 1_644 },
  { id: "d-06", name: "Item 6", owner: "Owner 6", status: "active", value: 87_220, units: 821 },
  { id: "d-07", name: "Item 7", owner: "Owner 1", status: "active", value: 81_540, units: 679 },
  { id: "d-08", name: "Item 8", owner: "Owner 2", status: "paused", value: 72_410, units: 905 },
  { id: "d-09", name: "Item 9", owner: "Owner 3", status: "active", value: 68_320, units: 412 },
  { id: "d-10", name: "Item 10", owner: "Owner 4", status: "active", value: 54_180, units: 720 },
  { id: "d-11", name: "Item 11", owner: "Owner 5", status: "active", value: 49_650, units: 1_103 },
  { id: "d-12", name: "Item 12", owner: "Owner 6", status: "active", value: 42_900, units: 953 },
  { id: "d-13", name: "Item 13", owner: "Owner 1", status: "paused", value: 38_240, units: 488 },
  { id: "d-14", name: "Item 14", owner: "Owner 2", status: "active", value: 31_780, units: 256 },
]

function spark(values: number[], length = 12): number[] {
  const step = Math.max(1, Math.floor(values.length / length))
  const out: number[] = []
  for (let i = 0; i < values.length; i += step) out.push(values[i])
  return out.slice(-length)
}

export const overviewKpis: KpiItem[] = [
  {
    id: "revenue",
    label: "Metric 1",
    value: "$1.32M",
    change: 12.4,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: spark(trendSeries.map((p) => p.value)),
  },
  {
    id: "orders",
    label: "Metric 2",
    value: "16,900",
    change: 9.6,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: spark(trendSeries.map((p) => p.value / 78)),
  },
  {
    id: "users",
    label: "Metric 3",
    value: "40,600",
    change: 6.8,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: spark(trendSeries.map((p) => p.value / 30)),
  },
  {
    id: "aov",
    label: "Metric 4",
    value: "$78.20",
    change: 3.1,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: spark(trendSeries.map((p) => p.value / Math.max(1, p.value / 78))),
  },
]
