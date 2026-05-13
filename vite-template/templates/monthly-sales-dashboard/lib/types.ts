// ── Enum / Literal types ──

export type Category =
  | "Apparel"
  | "Electronics"
  | "Home & Living"
  | "Food"
  | "Beauty"

export type Channel = "Retail" | "Online" | "Wholesale" | "Direct"

// ── Raw data schema (matches ticket's expected input data) ──
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

// Budget variance waterfall: Budget → +/- driver variances → Actual
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
