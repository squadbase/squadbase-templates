import { addDays, format } from "date-fns"
import type {
  DetailRow,
  SummaryRow,
  TrendPoint,
} from "@/types/ui-template-table-focus"

const BASE_DATE = new Date("2024-03-31")
const DAYS = 30

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const rand = seededRandom(31)

const NAMES = [
  "Aurora Wireless Headphones", "Halo Smart Watch", "Vista 4K Action Camera",
  "Nimbus Mechanical Keyboard", "Orbit Wireless Mouse", "Pulse Fitness Tracker",
  "Echo Bluetooth Speaker", "Lumen Desk Lamp", "Drift Standing Desk", "Quasar USB-C Hub",
  "Beacon Webcam HD", "Stratus Cooling Pad", "Comet Power Bank 20K", "Solar Solar Charger",
  "Nova Ergonomic Chair", "Apex Monitor Arm", "Glide Vertical Mouse", "Zenith Headset",
  "Tide Ergonomic Mat", "Crest Wireless Charger", "Forge Cable Organizer", "Pulse Smart Plug",
  "Wave Noise Filter", "Atlas Travel Adapter",
]
const OWNERS = ["Alex K.", "Mei L.", "Jordan S.", "Priya R.", "Devon T.", "Sam W."]
const CATEGORIES = ["Audio", "Wearables", "Camera", "Accessories", "Home"]
const STATUSES: DetailRow["status"][] = ["active", "active", "active", "paused", "draft"]

export const detailRows: DetailRow[] = NAMES.map((name, i) => {
  const revenue = Math.round(40_000 + rand() * 160_000)
  const units = Math.round(revenue / (40 + rand() * 220))
  return {
    id: `row-${String(i + 1).padStart(2, "0")}`,
    name,
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

