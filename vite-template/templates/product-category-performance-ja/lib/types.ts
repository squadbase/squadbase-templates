export type Category =
  | "アパレル"
  | "家電"
  | "ホーム&リビング"
  | "食品"
  | "ビューティー"
  | "スポーツ"

// ── Raw data schema (チケットの期待入力データに準拠) ──
export interface CategoryMonthRow {
  category: Category
  subcategory: string
  month: string
  revenue: number
  is_new_product: boolean
}

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
  yoyChange: number
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

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  category: string | undefined
}
