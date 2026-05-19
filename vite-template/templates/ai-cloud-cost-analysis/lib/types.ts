// ── Enum / Literal types ──

export type ServiceCategory =
  | "compute"
  | "storage"
  | "database"
  | "networking"
  | "ai-inference"
  | "observability"

// ── Raw data schema (matches ticket's expected input data) ──
// service, month, cost_usd, model, input_tokens, output_tokens

export interface CostRow {
  service: string
  month: string // ISO month "YYYY-MM"
  cost_usd: number
  model: string | null
  input_tokens: number
  output_tokens: number
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

export interface ServiceMonthlyPoint {
  month: string
  series: { service: string; cost: number }[]
  total: number
}

export interface ModelTokenCost {
  model: string
  inputTokens: number
  outputTokens: number
  inputUnitPrice: number // $ per 1K tokens
  outputUnitPrice: number // $ per 1K tokens
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

// ── Filter state ──

export interface DashboardFilters {
  service: string | undefined
  month: string | undefined
}
