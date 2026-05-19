export interface KpiItem {
  id: "mrr" | "arr" | "churn-rate" | "new-mrr"
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface TrendPoint {
  date: string
  mrr: number
  newMrr: number
  churnedMrr: number
}

export interface TopItemRow {
  id: string
  plan: string
  tier: string
  mrr: number
  seats: number
  churnRate: number
}

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
}
