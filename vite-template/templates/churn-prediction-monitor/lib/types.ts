// ── Enum / Literal types ──

export type RiskTier = "critical" | "high" | "medium" | "low"
export type Segment = "enterprise" | "mid" | "smb"

// ── Raw data schema (matches ticket's expected input data) ──
// customer_id, last_order_date, order_freq, support_tickets

export interface CustomerRow {
  customer_id: string
  last_order_date: string
  order_freq: number // orders / 90 days
  support_tickets: number // open tickets in last 30 days
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

export interface AtRiskCustomer {
  customer_id: string
  customer_name: string
  segment: Segment
  last_order_date: string
  days_since_last_order: number
  order_freq: number
  freq_delta_pct: number
  support_tickets: number
  risk_score: number
  risk_tier: RiskTier
}

export interface FrequencyDeclineCell {
  // weeks-ago bucket × risk tier
  weeksAgoBucket: number // 0=current week, 1=1wk ago, ..., 11=11wks ago
  riskTier: RiskTier
  declinePct: number // avg week-over-week freq decline (%) for the bucket
  customers: number
}

export interface ChurnRatePoint {
  month: string // YYYY-MM
  churnRate: number // %
  saveRate: number // % of flagged that were retained
  churnedCount: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  segment: string | undefined
  riskTier: string | undefined
}
