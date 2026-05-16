import type { FunnelStage, StageRow } from "@/types/ui-template-funnel"

const VISITORS = 124_500
const LEADS = 38_240
const QUALIFIED = 12_180
const OPPORTUNITIES = 4_520
const CONVERSIONS = 1_186

export const funnelStages: FunnelStage[] = [
  { stage: "Visitors", value: VISITORS, conversionRate: 100 },
  { stage: "Leads", value: LEADS, conversionRate: (LEADS / VISITORS) * 100 },
  { stage: "Qualified", value: QUALIFIED, conversionRate: (QUALIFIED / LEADS) * 100 },
  { stage: "Opportunities", value: OPPORTUNITIES, conversionRate: (OPPORTUNITIES / QUALIFIED) * 100 },
  { stage: "Conversions", value: CONVERSIONS, conversionRate: (CONVERSIONS / OPPORTUNITIES) * 100 },
]

export const stageRows: StageRow[] = [
  { stage: "Visitors → Leads", count: LEADS, conversionRate: (LEADS / VISITORS) * 100, avgDays: 0.6, dropoff: VISITORS - LEADS },
  { stage: "Leads → Qualified", count: QUALIFIED, conversionRate: (QUALIFIED / LEADS) * 100, avgDays: 3.2, dropoff: LEADS - QUALIFIED },
  { stage: "Qualified → Opportunities", count: OPPORTUNITIES, conversionRate: (OPPORTUNITIES / QUALIFIED) * 100, avgDays: 7.4, dropoff: QUALIFIED - OPPORTUNITIES },
  { stage: "Opportunities → Conversions", count: CONVERSIONS, conversionRate: (CONVERSIONS / OPPORTUNITIES) * 100, avgDays: 12.8, dropoff: OPPORTUNITIES - CONVERSIONS },
]

