import type { ApiContext } from "@squadbase/vantage/server"
import { HttpError } from "@squadbase/vantage/server"

import type {
  KpiItem,
  KpiSummary,
  RangeKey,
  TopItemRow,
  TrendPoint,
} from "../../lib/kpi-chart-simple/types"

/**
 * `GET /api/kpi-summary?range=7d|30d|90d`
 *
 * The one file to rewrite when you connect real data. Everything below the
 * "sample data" banner is a stand-in for a query — swap it for your warehouse
 * client (credentials come from `ctx.env`, never from the client bundle) and
 * the page keeps working as long as the `KpiSummary` shape holds.
 */

const RANGE_DAYS: Record<RangeKey, number> = { "7d": 7, "30d": 30, "90d": 90 }

function isRangeKey(value: string): value is RangeKey {
  return Object.hasOwn(RANGE_DAYS, value)
}

// ── sample data ──────────────────────────────────────────────────────────────
// Deterministic so the dashboard looks the same on every request.

const HISTORY_DAYS = 180
const DAY_MS = 86_400_000

const HISTORY: TrendPoint[] = Array.from({ length: HISTORY_DAYS }, (_, i) => {
  const weekly = Math.sin((i / 7) * Math.PI * 2) * 4_200
  const monthly = Math.sin((i / 30) * Math.PI * 2) * 2_600
  const revenue = Math.round(34_000 + i * 95 + weekly + monthly)
  const orders = Math.round(revenue / (74 + Math.sin(i / 11) * 6))
  const visitors = Math.round(orders * (28 + Math.sin(i / 9) * 4))
  return {
    date: new Date(Date.UTC(2024, 0, 1) + i * DAY_MS).toISOString().slice(0, 10),
    revenue,
    orders,
    visitors,
  }
})

const TOP_ITEMS: TopItemRow[] = [
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

// ── aggregation ──────────────────────────────────────────────────────────────

function total(rows: TrendPoint[], field: "revenue" | "orders" | "visitors"): number {
  return rows.reduce((acc, row) => acc + row[field], 0)
}

/** Percent change vs. the preceding window, rounded to one decimal. */
function delta(current: number, prior: number): number {
  if (prior === 0) return 0
  return Math.round(((current - prior) / prior) * 1_000) / 10
}

function sparkline(rows: TrendPoint[], project: (row: TrendPoint) => number): number[] {
  const step = Math.max(1, Math.floor(rows.length / 12))
  return rows.filter((_, i) => i % step === 0).map(project)
}

function buildKpis(current: TrendPoint[], prior: TrendPoint[]): KpiItem[] {
  const revenue = total(current, "revenue")
  const orders = total(current, "orders")
  const visitors = total(current, "visitors")
  const priorRevenue = total(prior, "revenue")
  const priorOrders = total(prior, "orders")
  const priorVisitors = total(prior, "visitors")

  const conversion = visitors === 0 ? 0 : (orders / visitors) * 100
  const priorConversion = priorVisitors === 0 ? 0 : (priorOrders / priorVisitors) * 100
  const aov = orders === 0 ? 0 : revenue / orders
  const priorAov = priorOrders === 0 ? 0 : priorRevenue / priorOrders

  return [
    {
      id: "total-revenue",
      value: revenue,
      change: delta(revenue, priorRevenue),
      sparklineData: sparkline(current, (row) => row.revenue),
    },
    {
      id: "active-users",
      value: visitors,
      change: delta(visitors, priorVisitors),
      sparklineData: sparkline(current, (row) => row.visitors),
    },
    {
      id: "conversion-rate",
      value: Math.round(conversion * 100) / 100,
      change: delta(conversion, priorConversion),
      sparklineData: sparkline(current, (row) => (row.orders / row.visitors) * 100),
    },
    {
      id: "aov",
      value: Math.round(aov * 100) / 100,
      change: delta(aov, priorAov),
      sparklineData: sparkline(current, (row) => row.revenue / row.orders),
    },
  ]
}

// ── handler ──────────────────────────────────────────────────────────────────

export async function GET({ request }: ApiContext) {
  const range = new URL(request.url).searchParams.get("range") ?? "30d"

  // Errors the client should see must be `HttpError`; anything else is logged
  // and flattened to a generic 500.
  if (!isRangeKey(range)) {
    throw new HttpError(400, `Unknown range "${range}". Expected one of 7d, 30d, 90d.`)
  }

  const days = RANGE_DAYS[range]
  const current = HISTORY.slice(-days)
  const prior = HISTORY.slice(-days * 2, -days)

  const payload: KpiSummary = {
    range,
    kpis: buildKpis(current, prior),
    trend: current,
    topItems: TOP_ITEMS,
  }

  return Response.json(payload)
}
