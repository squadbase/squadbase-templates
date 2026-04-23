// ── Enum / Literal types ──

export type Channel =
  | "direct"
  | "organic"
  | "paid_search"
  | "social"
  | "email"
  | "affiliate"

export type ProductCategory =
  | "Apparel"
  | "Food & Beverage"
  | "Electronics"
  | "Household"
  | "Beauty"
  | "Sports"

export type OrderStatus = "completed" | "processing" | "cancelled" | "refunded"

export type CustomerSegment = "new" | "returning" | "vip"

export type Granularity = "day" | "week" | "month"

export type AlertMetric = "revenue_drop" | "order_drop" | "cvr_drop" | "aov_drop"
export type AlertDirection = "above" | "below"
export type AlertSeverity = "info" | "warning" | "critical"

// ── Raw data schemas (DWH-style) ──

export interface OrderRow {
  order_id: string
  order_date: string
  ordered_at: string
  total_amount: number
  customer_id: string
  channel: Channel
  category: ProductCategory
  status: OrderStatus
  store_id: string
}

export interface OrderItemRow {
  order_id: string
  product_id: string
  category: ProductCategory
  quantity: number
  unit_price: number
}

export interface CustomerRow {
  customer_id: string
  region: string
  segment: CustomerSegment
}

export interface TrafficSourceRow {
  session_id: string
  order_id: string | null
  source: string
  medium: string
  campaign: string
}

export interface DailyTargetRow {
  date: string
  store_id: string
  target_amount: number
}

export interface AlertRuleRow {
  rule_id: string
  metric: AlertMetric
  threshold: number
  direction: AlertDirection
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

export interface SalesTrendPoint {
  date: string
  revenue: number
  target: number
  orders: number
}

export interface ChannelBreakdown {
  channel: string
  revenue: number
  percentage: number
}

export interface CategoryRankingItem {
  rank: number
  category: ProductCategory
  revenue: number
  orders: number
  aov: number
  shareOfTotal: number
  yoyChange: number
}

export interface HourlyCumulativePoint {
  hour: string
  cumulativeRevenue: number
  target: number
  prevDayCumulative: number
}

export interface LiveOrder {
  orderId: string
  orderedAt: string
  customerName: string
  region: string
  category: ProductCategory
  channel: Channel
  amount: number
}

export interface AlertEvent {
  id: string
  firedAt: string
  severity: AlertSeverity
  title: string
  description: string
  metric: AlertMetric
  threshold: number
  observed: number
}

export interface FunnelStep {
  step: string
  users: number
  rate: number
  conversionFromPrev: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  granularity: Granularity
  channel: string | undefined
  category: string | undefined
}
