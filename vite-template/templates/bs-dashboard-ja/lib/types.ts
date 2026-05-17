// ── Enum / Literal types ──

export type AccountType = "asset" | "liability" | "equity"

// ── Raw data schema (チケットの「期待入力データ」に対応) ──
// month, account_type, account, amount

export interface BsRow {
  month: string
  account_type: AccountType
  account: string
  amount: number
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

export interface BsStructureItem {
  label: string
  amount: number
  share: number
  side: AccountType
}

export interface BsStructure {
  assets: BsStructureItem[]
  liabilities: BsStructureItem[]
  equity: BsStructureItem[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
}

export interface AccountTrendPoint {
  month: string
  cash: number
  receivable: number
  inventory: number
  fixedAssets: number
  shortTermDebt: number
  longTermDebt: number
  equity: number
}

export interface RatioTrendPoint {
  month: string
  equityRatio: number
  currentRatio: number
  quickRatio: number
  debtToEquity: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  scope: string | undefined
}
