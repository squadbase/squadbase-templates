// ── Literal types ──

export type Channel = "直販" | "卸売" | "店舗" | "EC"

// ── Raw data schema (チケットの期待入力データに準拠) ──
// list_price, actual_price, discount_rate, customer_id

export interface TransactionRow {
  transaction_id: string
  customer_id: string
  channel: Channel
  list_price: number
  actual_price: number
  discount_rate: number
  quantity: number
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

export interface DiscountBin {
  binStart: number
  binEnd: number
  label: string
  count: number
  revenue: number
}

export interface DiscountScatterPoint {
  transactionId: string
  customerId: string
  channel: Channel
  discountRate: number
  quantity: number
  revenue: number
}

export interface CustomerDiscountRow {
  rank: number
  customerId: string
  customerName: string
  channel: Channel
  totalRevenue: number
  totalDiscountAmount: number
  averageDiscountRate: number
  marginImpact: number
}

export interface ChannelDiscountRow {
  rank: number
  channel: Channel
  totalRevenue: number
  totalDiscountAmount: number
  averageDiscountRate: number
  listPriceShare: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  channel: string | undefined
}
