// ── Channel / Device / Category literals ──

export type ChannelType =
  | "organic"
  | "direct"
  | "referral"
  | "social"
  | "email"
  | "paid_search"

export type DeviceCategory = "desktop" | "mobile" | "tablet"

export type ArticleCategory =
  | "技術"
  | "マーケティング"
  | "プロダクト"
  | "ニュース"
  | "事例紹介"

// ── Raw data schemas ──

export interface PageViewRow {
  date: string
  pagePath: string
  pageTitle: string
  pageviews: number
  uniquePageviews: number
  avgTimeOnPage: number
  bounceRate: number
}

export interface SessionRow {
  date: string
  source: string
  medium: string
  channel: ChannelType
  deviceCategory: DeviceCategory
}

export interface UserMetricRow {
  date: string
  newUsers: number
  returningUsers: number
}

export interface ArticleRow {
  articleId: string
  title: string
  category: ArticleCategory
  tags: string[]
  author: string
  publishedAt: string
  url: string
}

export interface ArticleMetricRow {
  date: string
  articleId: string
  pageviews: number
  uniquePageviews: number
  avgTimeOnPage: number
  scrollDepth: number
  bounceRate: number
}

export interface ConversionRow {
  date: string
  articleId: string
  goalName: string
  conversions: number
  conversionValue: number
}

export interface SearchPerformanceRow {
  date: string
  query: string
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface KeywordRankingRow {
  date: string
  keyword: string
  rank: number
  previousRank: number
  rankChange: number
  searchVolume: number
  url: string
}

export interface PageSeoRow {
  url: string
  title: string
  metaDescription: string
  indexed: boolean
  lastCrawled: string
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

export interface ChannelBreakdown {
  channel: string
  sessions: number
  percentage: number
}

export interface DailyTrafficTrend {
  date: string
  pageviews: number
  uniqueUsers: number
  sessions: number
}

export interface PageTrafficRow {
  pageTitle: string
  pagePath: string
  pageviews: number
  uniquePageviews: number
  avgTimeOnPage: number
  bounceRate: number
}

export interface CategoryPerformance {
  category: ArticleCategory
  pageviews: number
  avgTimeOnPage: number
  bounceRate: number
  conversionRate: number
}

export interface ContentRankingItem {
  rank: number
  title: string
  category: ArticleCategory
  pageviews: number
  avgTimeOnPage: number
  scrollDepth: number
  conversionContribution: number
}

export interface DailySearchTrend {
  date: string
  clicks: number
  impressions: number
}

export interface KeywordRankingDisplay {
  keyword: string
  rank: number
  previousRank: number
  rankChange: number
  ctr: number
  impressions: number
  clicks: number
  searchVolume: number
  url: string
}

export interface CtrPositionPoint {
  keyword: string
  position: number
  ctr: number
  searchVolume: number
}

export interface HeatmapCell {
  dayOfWeek: number // 0=Mon, 6=Sun
  hour: number // 0-23
  pageviews: number
  uniqueUsers: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  device: string | undefined
  channel: string | undefined
  category: string | undefined
}
