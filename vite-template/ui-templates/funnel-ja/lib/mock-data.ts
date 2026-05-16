import type { FunnelStage, StageRow } from "@/types/ui-template-funnel"

const VISITORS = 124_500
const LEADS = 38_240
const QUALIFIED = 12_180
const OPPORTUNITIES = 4_520
const CONVERSIONS = 1_186

export const funnelStages: FunnelStage[] = [
  { stage: "訪問者", value: VISITORS, conversionRate: 100 },
  { stage: "リード", value: LEADS, conversionRate: (LEADS / VISITORS) * 100 },
  { stage: "適格", value: QUALIFIED, conversionRate: (QUALIFIED / LEADS) * 100 },
  { stage: "商談", value: OPPORTUNITIES, conversionRate: (OPPORTUNITIES / QUALIFIED) * 100 },
  { stage: "受注", value: CONVERSIONS, conversionRate: (CONVERSIONS / OPPORTUNITIES) * 100 },
]

export const stageRows: StageRow[] = [
  { stage: "訪問者 → リード", count: LEADS, conversionRate: (LEADS / VISITORS) * 100, avgDays: 0.6, dropoff: VISITORS - LEADS },
  { stage: "リード → 適格", count: QUALIFIED, conversionRate: (QUALIFIED / LEADS) * 100, avgDays: 3.2, dropoff: LEADS - QUALIFIED },
  { stage: "適格 → 商談", count: OPPORTUNITIES, conversionRate: (OPPORTUNITIES / QUALIFIED) * 100, avgDays: 7.4, dropoff: QUALIFIED - OPPORTUNITIES },
  { stage: "商談 → 受注", count: CONVERSIONS, conversionRate: (CONVERSIONS / OPPORTUNITIES) * 100, avgDays: 12.8, dropoff: OPPORTUNITIES - CONVERSIONS },
]

