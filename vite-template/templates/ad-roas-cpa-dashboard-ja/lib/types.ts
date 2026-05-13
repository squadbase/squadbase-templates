// ── Enum / Literal 型 ──

export type Channel = "google" | "meta" | "tiktok" | "linkedin" | "yahoo"

// ── 入力行 (チケットの「期待入力データ」と一致) ──
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

// ── 表示・派生型 ──

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

// ── フィルター状態 ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  channel: string | undefined
  objective: string | undefined
}
