// ── Literal types ──

export type Category =
  | "Apparel"
  | "Electronics"
  | "Home & Living"
  | "Food"
  | "Beauty"
  | "Sports"

// ── Raw data schema (matches ticket's expected input data) ──
// product_id, revenue, cogs, category, month

export interface ProductMonthRow {
  product_id: string
  revenue: number
  cogs: number
  category: Category
  month: string // "YYYY-MM"
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

export interface MarginTrendPoint {
  month: string
  revenue: number
  cogs: number
  grossProfit: number
  marginPct: number
}

export interface CategoryMarginRow {
  rank: number
  category: Category
  revenue: number
  cogs: number
  grossProfit: number
  marginPct: number
  vsPrevMonth: number
}

export interface ProductMarginScatterPoint {
  productId: string
  productName: string
  category: Category
  revenue: number
  grossProfit: number
  marginPct: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  category: string | undefined
}
