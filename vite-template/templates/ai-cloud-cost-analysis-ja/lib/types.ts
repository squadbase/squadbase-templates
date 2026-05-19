// ── Enum / Literal types ──

export type ServiceCategory =
  | "compute"
  | "storage"
  | "database"
  | "networking"
  | "ai-inference"
  | "observability"

// ── 生データ schema (チケットの「期待入力データ」と一致) ──
// service, month, cost_usd, model, input_tokens, output_tokens

export interface CostRow {
  service: string
  month: string // ISO month "YYYY-MM"
  cost_usd: number
  model: string | null
  input_tokens: number
  output_tokens: number
}

// ── 表示用・派生型 ──

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface ServiceMonthlyPoint {
  month: string
  series: { service: string; cost: number }[]
  total: number
}

export interface ModelTokenCost {
  model: string
  inputTokens: number
  outputTokens: number
  inputUnitPrice: number // 円 / 1Kトークン
  outputUnitPrice: number // 円 / 1Kトークン
  inputCost: number
  outputCost: number
  totalCost: number
}

export interface ResourceCostRow {
  resourceId: string
  resourceName: string
  service: string
  monthlyCost: number
  prevMonthCost: number
  changePct: number
}

// ── フィルター ──

export interface DashboardFilters {
  service: string | undefined
  month: string | undefined
}
