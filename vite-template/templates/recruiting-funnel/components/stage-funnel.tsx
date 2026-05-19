import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { FunnelSteps } from "@/components/data/funnel-steps"
import type { FunnelStageStat } from "@/types/recruiting-funnel"

interface StageFunnelProps {
  data: FunnelStageStat[]
}

export function StageFunnel({ data }: StageFunnelProps) {
  // FunnelSteps requires descending order — sort defensively
  const sorted = [...data].sort((a, b) => b.count - a.count)

  const steps = sorted.map((s) => ({
    label: s.stage,
    value: s.count,
  }))

  return (
    <DashboardCardPreset
      title="Applicant Stage Funnel"
      description="Applied → Screen → Interview → Offer → Hired. Conversion rates shown between consecutive stages."
    >
      <FunnelSteps
        data={steps}
        showConversion
        formatValue={(v) => v.toLocaleString("en-US")}
      />
    </DashboardCardPreset>
  )
}
