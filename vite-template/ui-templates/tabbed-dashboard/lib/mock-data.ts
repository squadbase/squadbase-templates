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
  { category: "Audio", value: Math.round(totalRev * 0.28), share: 0.28, delta: 5.4 },
  { category: "Wearables", value: Math.round(totalRev * 0.22), share: 0.22, delta: 8.1 },
  { category: "Accessories", value: Math.round(totalRev * 0.20), share: 0.20, delta: -2.3 },
  { category: "Camera", value: Math.round(totalRev * 0.18), share: 0.18, delta: 3.7 },
  { category: "Home", value: Math.round(totalRev * 0.12), share: 0.12, delta: 1.2 },
]

export const detailRows: DetailRow[] = [
  { id: "d-01", name: "Aurora Wireless Headphones", owner: "Alex K.", status: "active", value: 184_320, units: 1_232 },
  { id: "d-02", name: "Halo Smart Watch", owner: "Mei L.", status: "active", value: 162_480, units: 812 },
  { id: "d-03", name: "Vista 4K Action Camera", owner: "Jordan S.", status: "active", value: 138_750, units: 463 },
  { id: "d-04", name: "Nimbus Mechanical Keyboard", owner: "Priya R.", status: "paused", value: 121_900, units: 974 },
  { id: "d-05", name: "Orbit Wireless Mouse", owner: "Devon T.", status: "active", value: 98_640, units: 1_644 },
  { id: "d-06", name: "Pulse Fitness Tracker", owner: "Sam W.", status: "active", value: 87_220, units: 821 },
  { id: "d-07", name: "Echo Bluetooth Speaker", owner: "Alex K.", status: "active", value: 81_540, units: 679 },
  { id: "d-08", name: "Lumen Desk Lamp", owner: "Mei L.", status: "paused", value: 72_410, units: 905 },
  { id: "d-09", name: "Nova Portable SSD", owner: "Jordan S.", status: "active", value: 68_320, units: 412 },
  { id: "d-10", name: "Glide Ergonomic Chair Mat", owner: "Priya R.", status: "active", value: 54_180, units: 720 },
  { id: "d-11", name: "Beacon Smart Bulb 4-pack", owner: "Devon T.", status: "active", value: 49_650, units: 1_103 },
  { id: "d-12", name: "Forge USB-C Hub", owner: "Sam W.", status: "active", value: 42_900, units: 953 },
  { id: "d-13", name: "Crest Noise-Cancelling Earbuds", owner: "Alex K.", status: "paused", value: 38_240, units: 488 },
  { id: "d-14", name: "Spire Standing Desk Riser", owner: "Mei L.", status: "active", value: 31_780, units: 256 },
]

function spark(values: number[], length = 12): number[] {
  const step = Math.max(1, Math.floor(values.length / length))
  const out: number[] = []
  for (let i = 0; i < values.length; i += step) out.push(values[i])
  return out.slice(-length)
}

const orders = Math.round(totalRev / 78)
const users = Math.round(orders * 2.4)
const aov = totalRev / orders

export const overviewKpis: KpiItem[] = [
  {
    id: "revenue",
    label: "Total Revenue",
    value: `$${(totalRev / 1_000_000).toFixed(2)}M`,
    change: 12.4,
    changeLabel: "vs. previous period",
    positiveIsGood: true,
    sparklineData: spark(trendSeries.map((p) => p.value)),
  },
  {
    id: "orders",
    label: "Total Orders",
    value: orders.toLocaleString("en-US"),
    change: 9.6,
    changeLabel: "vs. previous period",
    positiveIsGood: true,
    sparklineData: spark(trendSeries.map((p) => p.value / 78)),
  },
  {
    id: "users",
    label: "Active Users",
    value: users.toLocaleString("en-US"),
    change: 6.8,
    changeLabel: "vs. previous period",
    positiveIsGood: true,
    sparklineData: spark(trendSeries.map((p) => p.value / 30)),
  },
  {
    id: "aov",
    label: "Avg. Order Value",
    value: `$${aov.toFixed(2)}`,
    change: 3.1,
    changeLabel: "vs. previous period",
    positiveIsGood: true,
    sparklineData: spark(trendSeries.map((p) => p.value / Math.max(1, p.value / 78))),
  },
]

