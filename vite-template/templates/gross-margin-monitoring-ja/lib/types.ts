// ── Literal types ──

export type Category =
  | "アパレル"
  | "家電"
  | "ホーム&リビング"
  | "食品"
  | "ビューティー"
  | "スポーツ"

// ── Raw data schema (チケットの期待入力データに準拠) ──
// product_id, revenue, cogs, category, month

export interface ProductMonthRow {
  product_id: string
  revenue: number
  cogs: number
  category: Category
  month: string
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
