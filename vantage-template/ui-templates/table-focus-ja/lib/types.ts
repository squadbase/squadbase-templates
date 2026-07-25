export interface DetailRow {
  id: string
  name: string
  owner: string
  status: "active" | "paused" | "draft"
  category: string
  revenue: number
  units: number
  margin: number
  updated: string
}

export interface SummaryRow {
  segment: string
  count: number
  revenue: number
  avgMargin: number
  share: number
}

export interface TrendPoint {
  date: string
  value: number
}
