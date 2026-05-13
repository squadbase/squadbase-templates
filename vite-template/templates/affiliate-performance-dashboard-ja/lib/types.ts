// ── 生データスキーマ (チケットの期待入力データに対応) ──
// media_id, asp, spend, conversions, revenue, date

export interface AffiliateRow {
  media_id: string
  asp: string
  spend: number
  conversions: number
  revenue: number
  date: string
}

// ── 表示／派生型 ──

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface MediaSummary {
  mediaId: string
  mediaName: string
  asp: string
  spend: number
  conversions: number
  revenue: number
  cpa: number
  roas: number
  isNew: boolean
}

export interface MonthlyCvPoint {
  month: string
  conversions: number
  newMediaConversions: number
}

// ── フィルター状態 ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  asp: string | undefined
  segment: string | undefined
}
