export type Category =
  | "Apparel"
  | "Electronics"
  | "Home & Living"
  | "Food"
  | "Beauty"
  | "Sports"

// ── Raw data schema (matches ticket's expected input data) ──
// category, subcategory, month, revenue, is_new_product

export interface CategoryMonthRow {
  category: Category
  subcategory: string
  month: string // YYYY-MM
  revenue: number
  is_new_product: boolean
}

// ── Display types ──

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface CategoryMonthPoint {
  yearMonth: string
  values: Record<Category, number>
  total: number
}

export interface NewExistingDecompPoint {
  yearMonth: string
  newRevenue: number
  existingRevenue: number
  newContributionPct: number
}

export interface HeatmapCell {
  category: Category
  yearMonth: string
  yoyChange: number // %
  revenue: number
}

export interface CategorySummary {
  category: Category
  currentRevenue: number
  prevYearRevenue: number
  yoyChange: number
  shareOfTotal: number
  newProductShare: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  category: string | undefined
}
