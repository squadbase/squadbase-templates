// ── Enum / Literal types ──

export type CfType = "operating" | "investing" | "financing"

export type CategoryDirection = "inflow" | "outflow"

// ── Raw data schema (matches ticket's expected input data) ──
// month, cf_type, category, amount, cash_balance

export interface CashflowRow {
  month: string // YYYY-MM
  cf_type: CfType
  category: string
  amount: number // positive = inflow, negative = outflow
  cash_balance: number // end-of-month cash balance
}

// ── Display / derived types ──

export interface KpiItem {
  id:
    | "operating-cf"
    | "investing-cf"
    | "financing-cf"
    | "cash-balance"
    | "free-cf"
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export type WaterfallStepType = "start" | "operating" | "investing" | "financing" | "end"

export interface WaterfallStep {
  label: string
  type: WaterfallStepType
  value: number // signed: +inflow / -outflow; for start/end this is the absolute level
  cumulative: number // running cash position after this step
}

export interface CashBalancePoint {
  month: string
  cashBalance: number
  netCashFlow: number
}

export interface CategoryRow {
  category: string
  cfType: CfType
  direction: CategoryDirection
  current: number // current period absolute amount
  previous: number // previous period absolute amount
  delta: number // signed change vs previous period
  deltaRate: number // % change vs previous period
  shareOfFlow: number // share within its direction (0..1)
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  cfType: string | undefined
  direction: string | undefined
}
