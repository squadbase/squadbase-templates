export interface KpiItem {
  id: "total-revenue" | "active-users" | "conversion-rate" | "aov"
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface TrendPoint {
  date: string
  revenue: number
  orders: number
}

export interface TopItemRow {
  id: string
  name: string
  category: string
  revenue: number
  units: number
  share: number
}

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
}
