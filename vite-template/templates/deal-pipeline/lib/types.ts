export type DealStage =
  | "Lead"
  | "Qualified"
  | "Proposal"
  | "Negotiation"
  | "Closed Won"

export type DealPriority = "high" | "medium" | "low"

// ── Raw schema (matches ticket's expected input data) ──
export interface DealRow {
  deal_id: string
  stage: DealStage
  amount: number
  expected_close_date: string
  owner: string
}

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface StageFunnelStep {
  stage: DealStage
  count: number
  amount: number
  weightedAmount: number
  conversionFromPrev: number
}

export interface DealRecord {
  dealId: string
  dealName: string
  stage: DealStage
  amount: number
  weightedAmount: number
  expectedCloseDate: string
  daysToClose: number
  owner: string
  priority: DealPriority
}

export interface ForecastPoint {
  month: string
  weightedForecast: number
  commitForecast: number
  bestCase: number
  worstCase: number
  closedActual: number | null
}

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  owner: string | undefined
  stage: string | undefined
}
