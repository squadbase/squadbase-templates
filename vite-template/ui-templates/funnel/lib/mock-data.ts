import type { FunnelStage, StageRow } from "@/types/ui-template-funnel"

const VISITORS = 124_500
const LEADS = 38_240
const QUALIFIED = 12_180
const OPPORTUNITIES = 4_520
const CONVERSIONS = 1_186

export const funnelStages: FunnelStage[] = [
  { stage: "Stage 1", value: VISITORS, conversionRate: 100 },
  { stage: "Stage 2", value: LEADS, conversionRate: (LEADS / VISITORS) * 100 },
  { stage: "Stage 3", value: QUALIFIED, conversionRate: (QUALIFIED / LEADS) * 100 },
  { stage: "Stage 4", value: OPPORTUNITIES, conversionRate: (OPPORTUNITIES / QUALIFIED) * 100 },
  { stage: "Stage 5", value: CONVERSIONS, conversionRate: (CONVERSIONS / OPPORTUNITIES) * 100 },
]

export const stageRows: StageRow[] = [
  { stage: "Stage 1 → 2", count: LEADS, conversionRate: (LEADS / VISITORS) * 100, avgDays: 0.6, dropoff: VISITORS - LEADS },
  { stage: "Stage 2 → 3", count: QUALIFIED, conversionRate: (QUALIFIED / LEADS) * 100, avgDays: 3.2, dropoff: LEADS - QUALIFIED },
  { stage: "Stage 3 → 4", count: OPPORTUNITIES, conversionRate: (OPPORTUNITIES / QUALIFIED) * 100, avgDays: 7.4, dropoff: QUALIFIED - OPPORTUNITIES },
  { stage: "Stage 4 → 5", count: CONVERSIONS, conversionRate: (CONVERSIONS / OPPORTUNITIES) * 100, avgDays: 12.8, dropoff: OPPORTUNITIES - CONVERSIONS },
]
