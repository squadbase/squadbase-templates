/**
 * Shared between the page and `server/api/kpi-summary.ts`.
 *
 * These live in `lib/` rather than `components/` because the client may never
 * import from `server/` (`vantage check` reports `CLIENT_IMPORTS_SERVER`), so
 * anything both sides need has to sit in neutral ground.
 */

export type RangeKey = "7d" | "30d" | "90d"

export type KpiId = "total-revenue" | "active-users" | "conversion-rate" | "aov"

/** Raw numbers only — labels and formatting belong to the page. */
export interface KpiItem {
  id: KpiId
  value: number
  /** Percent change against the preceding window of the same length. */
  change: number
  sparklineData: number[]
}

export interface TrendPoint {
  date: string
  revenue: number
  orders: number
  visitors: number
}

export interface TopItemRow {
  id: string
  name: string
  category: string
  revenue: number
  units: number
  share: number
}

/** The payload `GET /api/kpi-summary` returns. */
export interface KpiSummary {
  range: RangeKey
  kpis: KpiItem[]
  trend: TrendPoint[]
  topItems: TopItemRow[]
}
