export type QuoteStatus = "issued" | "won" | "lost"

export type LossReason =
  | "Price"
  | "Timing"
  | "Competitor"
  | "Spec Mismatch"
  | "No Decision"
  | "Other"

// ── Raw schema (matches ticket's expected input data) ──
export interface QuoteRow {
  quote_id: string
  status: QuoteStatus
  issued_date: string
  won_date: string | null
  lost_reason: LossReason | null
}

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface FunnelStep {
  step: string
  count: number
  rate: number
  conversionFromPrev: number
}

export interface ConversionTrendPoint {
  month: string
  issued: number
  won: number
  conversionPct: number
  avgLeadTimeDays: number
}

export interface LossReasonItem {
  reason: LossReason
  count: number
  amount: number
  share: number
}

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
}
