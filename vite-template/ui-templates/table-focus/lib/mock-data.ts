import { addDays, format } from "date-fns"
import type {
  DetailRow,
  SummaryRow,
  TrendPoint,
} from "@/types/ui-template-table-focus"

const BASE_DATE = new Date("2024-03-31")
const DAYS = 30
const ROW_COUNT = 24

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const rand = seededRandom(31)

const OWNERS = ["Owner 1", "Owner 2", "Owner 3", "Owner 4", "Owner 5", "Owner 6"]
const CATEGORIES = ["Category 1", "Category 2", "Category 3", "Category 4", "Category 5"]
const STATUSES: DetailRow["status"][] = ["active", "active", "active", "paused", "draft"]

export const detailRows: DetailRow[] = Array.from({ length: ROW_COUNT }, (_, i) => {
  const revenue = Math.round(40_000 + rand() * 160_000)
  const units = Math.round(revenue / (40 + rand() * 220))
  return {
    id: `row-${String(i + 1).padStart(2, "0")}`,
    name: `Item ${i + 1}`,
    owner: OWNERS[i % OWNERS.length],
    status: STATUSES[i % STATUSES.length],
    category: CATEGORIES[i % CATEGORIES.length],
    revenue,
    units,
    margin: Math.round((18 + rand() * 32) * 10) / 10,
    updated: format(addDays(BASE_DATE, -Math.floor(rand() * 14)), "yyyy-MM-dd"),
  }
})

const segmentMap = new Map<string, { count: number; revenue: number; marginSum: number }>()
for (const r of detailRows) {
  const cur = segmentMap.get(r.category) ?? { count: 0, revenue: 0, marginSum: 0 }
  cur.count += 1
  cur.revenue += r.revenue
  cur.marginSum += r.margin
  segmentMap.set(r.category, cur)
}
const totalRev = [...segmentMap.values()].reduce((s, v) => s + v.revenue, 0)
export const summaryRows: SummaryRow[] = [...segmentMap.entries()]
  .map(([segment, v]) => ({
    segment,
    count: v.count,
    revenue: v.revenue,
    avgMargin: Math.round((v.marginSum / v.count) * 10) / 10,
    share: v.revenue / totalRev,
  }))
  .sort((a, b) => b.revenue - a.revenue)

export const trendSeries: TrendPoint[] = Array.from({ length: DAYS }, (_, i) => {
  const date = addDays(BASE_DATE, i - DAYS + 1)
  const base = 22_000 + i * 240 + (rand() - 0.5) * 6_000
  return {
    date: format(date, "yyyy-MM-dd"),
    value: Math.max(10_000, Math.round(base)),
  }
})
