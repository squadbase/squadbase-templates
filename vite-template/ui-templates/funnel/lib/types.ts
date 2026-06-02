export interface FunnelStage {
  value: number
  conversionRate: number
}

export interface StageRow {
  count: number
  conversionRate: number
  avgDays: number
  dropoff: number
}
