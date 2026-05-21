export interface KpiItem {
  id: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface TrendPoint {
  date: string
  value: number
}

export interface CategoryRow {
  category: string
  value: number
  share: number
  delta: number
}

export interface DetailRow {
  id: string
  name: string
  owner: string
  status: "active" | "paused"
  value: number
  units: number
}
