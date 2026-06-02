import type { FunnelStage, StageRow } from "@/types/ui-template-funnel"

const VISITORS = 124_500
const LEADS = 38_240
const QUALIFIED = 12_180
const OPPORTUNITIES = 4_520
const CONVERSIONS = 1_186

export const funnelStages: FunnelStage[] = [
  { value: VISITORS, conversionRate: 100 },
  { value: LEADS, conversionRate: (LEADS / VISITORS) * 100 },
  { value: QUALIFIED, conversionRate: (QUALIFIED / LEADS) * 100 },
  { value: OPPORTUNITIES, conversionRate: (OPPORTUNITIES / QUALIFIED) * 100 },
  { value: CONVERSIONS, conversionRate: (CONVERSIONS / OPPORTUNITIES) * 100 },
]

export const stageRows: StageRow[] = [
  { count: LEADS, conversionRate: (LEADS / VISITORS) * 100, avgDays: 0.6, dropoff: VISITORS - LEADS },
  { count: QUALIFIED, conversionRate: (QUALIFIED / LEADS) * 100, avgDays: 3.2, dropoff: LEADS - QUALIFIED },
  { count: OPPORTUNITIES, conversionRate: (OPPORTUNITIES / QUALIFIED) * 100, avgDays: 7.4, dropoff: QUALIFIED - OPPORTUNITIES },
  { count: CONVERSIONS, conversionRate: (CONVERSIONS / OPPORTUNITIES) * 100, avgDays: 12.8, dropoff: OPPORTUNITIES - CONVERSIONS },
]
