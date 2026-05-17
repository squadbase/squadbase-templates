// ── Raw data schema (チケットの「期待入力データ」に対応) ──
// campaign_id, creative_id, spend, conversions, revenue, date

export interface AdEventRow {
  campaign_id: string
  creative_id: string
  spend: number
  conversions: number
  revenue: number
  date: string
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

// 1 行 = 1 キャンペーン (期間集約)
export interface CampaignRoasRow {
  campaignId: string
  campaignName: string
  channel: string
  spend: number
  conversions: number
  revenue: number
  roas: number
  cpa: number
  ctr: number
  cvr: number
  // 直前同期間との ROAS 差分 (%)
  roasDelta: number
}

// 1 行 = 1 クリエイティブ (CTR × CVR 散布図用)
export interface CreativeScatterPoint {
  creativeId: string
  creativeName: string
  campaignId: string
  campaignName: string
  format: "image" | "video" | "carousel"
  impressions: number
  clicks: number
  conversions: number
  spend: number
  revenue: number
  ctr: number
  cvr: number
  // 学習期間ステータス
  learningPhase: "learning" | "active" | "limited"
}

// 予算消化進捗 (1 行 = 1 キャンペーン)
export interface BudgetPacingRow {
  campaignId: string
  campaignName: string
  budget: number
  spent: number
  pctSpent: number
  daysElapsed: number
  daysInPeriod: number
  pctTimeElapsed: number
  // pctSpent vs pctTimeElapsed → ahead / on-track / behind
  paceStatus: "ahead" | "on-track" | "behind"
}

// ── フィルター状態 ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  channel: string | undefined
  objective: string | undefined
}
