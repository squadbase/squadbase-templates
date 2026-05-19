// ── Enum / Literal types ──

export type Category =
  | "アパレル"
  | "家電"
  | "ホーム&リビング"
  | "食品"
  | "ビューティー"

export type Channel = "店舗" | "EC" | "卸売" | "直販"

// ── Raw data schema (チケットの期待入力データに準拠) ──
// year_month, amount, budget, category, channel

export interface MonthlySalesRow {
  year_month: string // "2024-03"
  amount: number
  budget: number
  category: Category
  channel: Channel
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

export interface MonthlyTrendPoint {
  yearMonth: string
  revenue: number
  prevYearRevenue: number
  yoyPct: number
}

// 予算 vs 実績ウォーターフォール: 予算 → ドライバー差分 → 実績
export type WaterfallStepType = "base" | "positive" | "negative" | "total"

export interface WaterfallStep {
  label: string
  type: WaterfallStepType
  value: number
  cumulative: number
}

export interface CategoryMonthlyPoint {
  yearMonth: string
  values: Record<Category, number>
}

export interface ChannelMonthlyPoint {
  yearMonth: string
  values: Record<Channel, number>
}

export interface SegmentContribution {
  name: string
  revenue: number
  share: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  category: string | undefined
  channel: string | undefined
}
