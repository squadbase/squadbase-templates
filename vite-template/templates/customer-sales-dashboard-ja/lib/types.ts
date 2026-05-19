// ── Enum / Literal types ──

export type AbcClass = "A" | "B" | "C"

export type ChurnRiskLevel = "low" | "watch" | "high"

// ── Raw data schema (チケットの期待入力データに準拠) ──
// customer_id, amount, order_date, last_order_date

export interface CustomerRow {
  customer_id: string
  amount: number
  order_date: string
  last_order_date: string
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

export interface CustomerRankingItem {
  rank: number
  customerId: string
  customerName: string
  segment: string
  currentRevenue: number
  prevYearRevenue: number
  yoyChange: number
  orderCount: number
  lastOrderDate: string
  daysSinceLastOrder: number
  abcClass: AbcClass
  churnRisk: ChurnRiskLevel
}

export interface ParetoPoint {
  customerId: string
  customerName: string
  revenue: number
  cumulativeRevenue: number
  cumulativePct: number
  abcClass: AbcClass
}

export interface ChurnCandidate {
  customerId: string
  customerName: string
  segment: string
  lastOrderDate: string
  daysSinceLastOrder: number
  prevYearRevenue: number
  riskLevel: ChurnRiskLevel
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  segment: string | undefined
}
