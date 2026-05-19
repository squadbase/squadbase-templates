// ── Enum / Literal 型 ──

export type RiskTier = "critical" | "high" | "medium" | "low"
export type Segment = "enterprise" | "mid" | "smb"

// ── 入力データスキーマ（チケットの「期待入力データ」と一致） ──
// customer_id, last_order_date, order_freq, support_tickets

export interface CustomerRow {
  customer_id: string
  last_order_date: string
  order_freq: number // 直近 90 日の発注回数
  support_tickets: number // 直近 30 日のオープン中チケット数
}

// ── 表示・派生型 ──

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
  // 経過週バケット × リスク階層
  weeksAgoBucket: number // 0=今週, 1=1週前, ..., 11=11週前
  riskTier: RiskTier
  declinePct: number // バケット内の週次平均「発注頻度の前週比」(%)
  customers: number
}

export interface ChurnRatePoint {
  month: string // YYYY-MM
  churnRate: number // %
  saveRate: number // 救済成功率 (%)
  churnedCount: number
}

// ── フィルター状態 ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  segment: string | undefined
  riskTier: string | undefined
}
