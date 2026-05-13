// ── Raw data schema (matches ticket's expected input data) ──
// sales_rep, target, actual, month

export interface SalesRepMonthlyRow {
  sales_rep: string
  target: number
  actual: number
  month: string // ISO YYYY-MM-01
}

// ── Display / derived types ──

export type RepPaceStatus = "ahead" | "on-track" | "behind"

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface RepAttainment {
  salesRep: string
  target: number
  actual: number
  remaining: number
  attainmentPct: number
  status: RepPaceStatus
}

export interface RepPaceRow {
  salesRep: string
  target: number
  actual: number
  remaining: number
  attainmentPct: number
  requiredDailyAvg: number
  actualDailyAvg: number
  paceDeltaPct: number
  status: RepPaceStatus
}

export interface RepMonthlyTrendPoint {
  month: string // YYYY-MM
  target: number
  actual: number
}

export interface RepMonthlyTrend {
  salesRep: string
  points: RepMonthlyTrendPoint[]
  latestAttainmentPct: number
  status: RepPaceStatus
}

export interface CurrentMonthMeta {
  monthLabel: string
  businessDaysTotal: number
  businessDaysElapsed: number
  businessDaysRemaining: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  team: string | undefined
  rep: string | undefined
}
