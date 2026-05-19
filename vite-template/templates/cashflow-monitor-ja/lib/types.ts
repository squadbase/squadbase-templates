// ── Enum / Literal types ──

export type CfType = "operating" | "investing" | "financing"

export type CategoryDirection = "inflow" | "outflow"

// ── Raw data schema (チケット「期待入力データ」と一致) ──
// month, cf_type, category, amount, cash_balance

export interface CashflowRow {
  month: string // YYYY-MM
  cf_type: CfType
  category: string
  amount: number // 正 = 入金 / 負 = 出金
  cash_balance: number // 月末現金残高
}

// ── 表示 / 派生型 ──

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
  value: number // 符号付き: 正 = 入金 / 負 = 出金。start/end は絶対値
  cumulative: number // ステップ後の現金水準
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
  current: number // 当月の絶対額
  previous: number // 前月の絶対額
  delta: number // 前月差（符号付き）
  deltaRate: number // 前月比 %
  shareOfFlow: number // 入金 or 出金内での構成比 (0..1)
}

// ── フィルタ状態 ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  cfType: string | undefined
  direction: string | undefined
}
