export interface FunnelStage {
  stage: string
  value: number
  conversionRate: number
}

export interface StageRow {
  stage: string
  count: number
  conversionRate: number
  avgDays: number
  dropoff: number
}
