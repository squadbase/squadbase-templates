// ── Enum / Literal types ──

export type Channel = "google" | "meta" | "tiktok" | "linkedin" | "yahoo"

// ── Raw input row (matches ticket's expected input data) ──
// channel, campaign, spend, impressions, clicks, conversions, revenue

export interface AdRow {
  channel: Channel
  campaign: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
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

export interface ChannelPerformanceRow {
  channel: Channel
  channelLabel: string
  spend: number
  conversions: number
  revenue: number
  cpa: number
  roas: number
  ctr: number
  cvr: number
}

export interface DailySpendConvPoint {
  date: string
  spend: number
  conversions: number
}

export interface SankeyNode {
  name: string
}

export interface SankeyLink {
  source: string
  target: string
  value: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  channel: string | undefined
  objective: string | undefined
}
