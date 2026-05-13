export type AbcClass = "A" | "B" | "C"

export type Quadrant = "star" | "workhorse" | "niche" | "deadstock"

// ── Raw data schema (チケットの期待入力データに準拠) ──
export interface ProductRow {
  product_id: string
  product_name: string
  category: string
  revenue: number
  units_sold: number
  stock_qty: number
}

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
  turnoverRate: number
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

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  category: string | undefined
}
