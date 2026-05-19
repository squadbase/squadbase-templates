// ── Enum / Literal types ──

export type Marketplace = "amazon" | "rakuten"

// ── Raw input row (matches ticket's expected input data) ──
// campaign_id, keyword, spend, ad_revenue, organic_revenue, date

export interface AdRow {
  campaign_id: string
  keyword: string
  spend: number
  ad_revenue: number
  organic_revenue: number
  date: string
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

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  marketplace: string | undefined
  campaign: string | undefined
}
