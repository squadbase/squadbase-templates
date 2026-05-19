// ── Enum / Literal types ──

export type PlAccount =
  | "売上高"
  | "売上原価"
  | "売上総利益"
  | "販管費"
  | "営業利益"
  | "営業外損益"
  | "経常利益"

export type ExpenseCategory =
  | "人件費"
  | "広告宣伝費"
  | "賃借料"
  | "外注費"
  | "水道光熱費"
  | "その他"

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
