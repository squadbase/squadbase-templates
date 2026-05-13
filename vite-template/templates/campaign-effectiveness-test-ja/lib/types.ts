// ── 元データスキーマ (チケットの「期待入力データ」と一致) ──
// campaign_id, customer_id, exposed, revenue, period

export type Period = "pre" | "post"

export interface ExposureRow {
  campaign_id: string
  customer_id: string
  exposed: boolean
  revenue: number
  period: Period
}

// ── 表示・派生用の型 ──

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

// 施策前後比較ラインの 1 ポイント — テスト群 vs コントロール群
export interface PrePostPoint {
  // 施策開始からの週オフセット: -3..-1 = pre, 0..+3 = post
  weekIndex: number
  weekLabel: string
  testRevenuePerCustomer: number
  controlRevenuePerCustomer: number
  phase: Period
}

// キャンペーンごとの ROI ランキング行
export interface CampaignRoiRow {
  campaignId: string
  campaignName: string
  channel: string
  testCustomers: number
  controlCustomers: number
  // 施策後の 1 人あたり平均売上
  testArpu: number
  controlArpu: number
  // 1 人あたりの売上リフト (test - control)
  incrementalArpu: number
  // テスト群全体に対する増分売上
  incrementalRevenue: number
  // 同期間のキャンペーン投下費用
  cost: number
  // ROI = (増分売上 - 費用) / 費用 × 100
  roi: number
  // 統計的信頼度バンド
  confidence: "high" | "medium" | "low"
}

// キャンペーンごとのクーポン消化率行
export interface CouponRedemptionRow {
  campaignId: string
  campaignName: string
  couponCode: string
  discountLabel: string
  distributed: number
  redeemed: number
  redemptionRate: number
  // クーポン利用時の平均注文金額
  avgOrderValue: number
  // 値引きコスト控除後の純利益
  netRevenue: number
}

// ── フィルター状態 ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  channel: string | undefined
  confidence: string | undefined
}
