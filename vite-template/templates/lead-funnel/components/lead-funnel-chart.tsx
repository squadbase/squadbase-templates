import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { FunnelSteps } from "@/components/data/funnel-steps"
import type { FunnelStageStat } from "@/types/lead-funnel"

interface LeadFunnelChartProps {
  data: FunnelStageStat[]
}

export function LeadFunnelChart({ data }: LeadFunnelChartProps) {
  // FunnelSteps requires the data sorted descending — guarantee it here.
  const sorted = [...data].sort((a, b) => b.count - a.count)

  const steps = sorted.map((s) => ({
    label: s.stage,
    value: s.count,
  }))

  return (
    <DashboardCardPreset
      title="Lead Stage Funnel"
      description="Lead → MQL → SQL → Appointment → Opportunity. Conversion rates shown between consecutive stages."
    >
      <FunnelSteps
        data={steps}
        showConversion
        formatValue={(v) => v.toLocaleString("en-US")}
      />
    </DashboardCardPreset>
  )
}
