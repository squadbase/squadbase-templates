// ── 列挙 / リテラル型 ──

export type Marketplace = "amazon" | "rakuten"

// ── 生入力スキーマ (チケット「期待入力データ」と一致) ──
// campaign_id, keyword, spend, ad_revenue, organic_revenue, date

export interface AdRow {
  campaign_id: string
  keyword: string
  spend: number
  ad_revenue: number
  organic_revenue: number
  date: string
}

// ── 表示用 / 派生型 ──

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface CampaignPerformanceRow {
  campaignId: string
  campaignName: string
  marketplace: Marketplace
  marketplaceLabel: string
  spend: number
  adRevenue: number
  organicRevenue: number
  acos: number
  tacos: number
  conversions: number
  cvr: number
}

export interface AdVsOrganicPoint {
  date: string
  adRevenue: number
  organicRevenue: number
}

export interface KeywordRankingRow {
  keyword: string
  campaignId: string
  marketplace: Marketplace
  marketplaceLabel: string
  spend: number
  clicks: number
  conversions: number
  cpc: number
  cpa: number
  cvr: number
}

// ── フィルター状態 ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  marketplace: string | undefined
  campaign: string | undefined
}
