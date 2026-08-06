export interface KpiItem {
  id: "revenue" | "users" | "conversion" | "aov" | "sessions"
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface ComparisonPoint {
  period: string
  current: number
  previous: number
  growth: number
}

export interface BreakdownSlice {
  segment: string
  value: number
}

export interface TrendPoint {
  date: string
  value: number
}

export interface CampaignRow {
  id: string
  name: string
  channel: string
  spend: number
  conversions: number
  roi: number
}

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
}
