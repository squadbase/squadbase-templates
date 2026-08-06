import type { ApiContext } from "@squadbase/vantage/server"
import { HttpError } from "@squadbase/vantage/server"

import type {
  KpiItem,
  KpiSummary,
  RangeKey,
  TopItemRow,
  TrendPoint,
} from "../../src/lib/kpi-chart-simple/types"

/**
 * `GET /api/kpi-summary?range=7d|30d|90d`
 *
 * 実データに繋ぐときに書き換えるのはこのファイルだけ。「サンプルデータ」以下はクエリの
 * 代役なので、データウェアハウスのクライアント呼び出しに差し替える(認証情報は `ctx.env`
 * から読む。クライアントバンドルには決して入らない)。`KpiSummary` の形さえ保てば
 * ページ側は変更不要。
 */

const RANGE_DAYS: Record<RangeKey, number> = { "7d": 7, "30d": 30, "90d": 90 }

function isRangeKey(value: string): value is RangeKey {
  return Object.hasOwn(RANGE_DAYS, value)
}

// ── サンプルデータ ───────────────────────────────────────────────────────────
// リクエストごとに揺れないよう決定的に生成する。

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
  { id: "p-01", name: "項目1", category: "カテゴリA", revenue: 184_320, units: 1_232, share: 0.142 },
  { id: "p-02", name: "項目2", category: "カテゴリB", revenue: 162_480, units: 812, share: 0.125 },
  { id: "p-03", name: "項目3", category: "カテゴリC", revenue: 138_750, units: 463, share: 0.107 },
  { id: "p-04", name: "項目4", category: "カテゴリD", revenue: 121_900, units: 974, share: 0.094 },
  { id: "p-05", name: "項目5", category: "カテゴリD", revenue: 98_640, units: 1_644, share: 0.076 },
  { id: "p-06", name: "項目6", category: "カテゴリB", revenue: 87_220, units: 821, share: 0.067 },
  { id: "p-07", name: "項目7", category: "カテゴリA", revenue: 81_540, units: 679, share: 0.063 },
  { id: "p-08", name: "項目8", category: "カテゴリE", revenue: 72_410, units: 905, share: 0.056 },
  { id: "p-09", name: "項目9", category: "カテゴリE", revenue: 68_900, units: 138, share: 0.053 },
  { id: "p-10", name: "項目10", category: "カテゴリD", revenue: 54_220, units: 1_356, share: 0.042 },
]

// ── 集計 ─────────────────────────────────────────────────────────────────────

function total(rows: TrendPoint[], field: "revenue" | "orders" | "visitors"): number {
  return rows.reduce((acc, row) => acc + row[field], 0)
}

/** 直前の同じ長さの期間に対する変化率(小数第1位まで)。 */
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

// ── ハンドラ ─────────────────────────────────────────────────────────────────

export async function GET({ request }: ApiContext) {
  const range = new URL(request.url).searchParams.get("range") ?? "30d"

  // クライアントに見せたいエラーは `HttpError` を throw する。それ以外の throw は
  // ログに記録され、汎用の 500 に丸められる。
  if (!isRangeKey(range)) {
    throw new HttpError(400, `range "${range}" は未対応です。7d / 30d / 90d のいずれかを指定してください。`)
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
