// ── Enum / Literal types ──

export type PlAccount =
  | "Revenue"
  | "COGS"
  | "Gross Profit"
  | "SG&A"
  | "Operating Income"
  | "Non-operating Income"
  | "Ordinary Income"

export type ExpenseCategory =
  | "Personnel"
  | "Marketing"
  | "Rent"
  | "Outsourcing"
  | "Utilities"
  | "Other"

// ── Raw data schema (matches ticket's expected input columns) ──
// month, account, amount

export interface PlAccountRow {
  month: string
  account: PlAccount
  amount: number
}

// ── Display / derived types ──

export interface KpiItem {
  id:
    | "revenue"
    | "gross-profit"
    | "operating-income"
    | "ordinary-income"
    | "operating-margin"
  label: string
  value: string
  rawValue: number
  change: number
  changeLabel: string
  positiveIsGood: boolean
  spark: number[]
}

export interface WaterfallStep {
  label: string
  value: number
  type: "revenue" | "cost" | "subtotal"
  cumulative: number
}

export interface ExpenseMonthlyPoint {
  month: string
  values: Record<ExpenseCategory, number>
}

export interface YoyCompareRow {
  account: PlAccount
  currentYear: number
  previousYear: number
  yoyDelta: number
  yoyRate: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  view: string | undefined
}
