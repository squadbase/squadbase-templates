// ── Raw data schema (matches ticket's expected input data) ──
// campaign_id, customer_id, exposed, revenue, period

export type Period = "pre" | "post"

export interface ExposureRow {
  campaign_id: string
  customer_id: string
  exposed: boolean
  revenue: number
  period: Period
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

// One x-axis point on the pre/post comparison line — test vs control means
export interface PrePostPoint {
  // Week offset from campaign start: -3..-1 = pre, 0..+3 = post
  weekIndex: number
  weekLabel: string
  testRevenuePerCustomer: number
  controlRevenuePerCustomer: number
  phase: Period
}

// One row per campaign — ROI ranking
export interface CampaignRoiRow {
  campaignId: string
  campaignName: string
  channel: string
  testCustomers: number
  controlCustomers: number
  // Average post-period revenue per customer
  testArpu: number
  controlArpu: number
  // Per-customer lift in revenue (test - control)
  incrementalArpu: number
  // Incremental revenue across the exposed population
  incrementalRevenue: number
  // Campaign cost in the same period
  cost: number
  // ROI = (incremental revenue - cost) / cost × 100
  roi: number
  // Statistical confidence level — illustrative bands
  confidence: "high" | "medium" | "low"
}

// One row per campaign — coupon redemption table
export interface CouponRedemptionRow {
  campaignId: string
  campaignName: string
  couponCode: string
  discountLabel: string
  distributed: number
  redeemed: number
  redemptionRate: number
  // Average order value when the coupon is redeemed
  avgOrderValue: number
  // Net contribution after discount cost
  netRevenue: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  channel: string | undefined
  confidence: string | undefined
}
