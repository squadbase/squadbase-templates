import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { FunnelSteps } from "@/components/data/funnel-steps"
import { STAGE_LABEL_JA } from "@/lib/lead-funnel-mock-data"
import type { FunnelStageStat } from "@/types/lead-funnel"

interface LeadFunnelChartProps {
  data: FunnelStageStat[]
}

export function LeadFunnelChart({ data }: LeadFunnelChartProps) {
  // FunnelSteps requires descending order — sort defensively
  const sorted = [...data].sort((a, b) => b.count - a.count)

  const steps = sorted.map((s) => ({
    label: STAGE_LABEL_JA[s.stage],
    value: s.count,
  }))

  return (
    <DashboardCardPreset
      title="リードステージ別ファネル"
      description="リード → MQL → SQL → アポ獲得 → 商談化 までの件数と段差別の通過率"
    >
      <FunnelSteps
        data={steps}
        showConversion
        formatValue={(v) => v.toLocaleString("ja-JP")}
      />
    </DashboardCardPreset>
  )
}
