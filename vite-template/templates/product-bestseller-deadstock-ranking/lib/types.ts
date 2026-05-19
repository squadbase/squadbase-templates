// ── Literal types ──

export type AbcClass = "A" | "B" | "C"

export type Quadrant = "star" | "workhorse" | "niche" | "deadstock"

// ── Raw data schema (matches ticket's expected input data) ──
// product_id, product_name, revenue, units_sold, stock_qty

export interface ProductRow {
  product_id: string
  product_name: string
  category: string
  revenue: number
  units_sold: number
  stock_qty: number
}

// ── Display / derived types ──

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface ProductRankingItem {
  rank: number
  productId: string
  productName: string
  category: string
  revenue: number
  unitsSold: number
  stockQty: number
  turnoverRate: number // units sold / avg stock
  prevPeriodRevenue: number
  yoyChange: number
  abcClass: AbcClass
  quadrant: Quadrant
}

export interface ParetoPoint {
  productId: string
  productName: string
  revenue: number
  cumulativeRevenue: number
  cumulativePct: number
  abcClass: AbcClass
}

export interface QuadrantPoint {
  productId: string
  productName: string
  category: string
  revenue: number
  turnoverRate: number
  unitsSold: number
  quadrant: Quadrant
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  category: string | undefined
}
