import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { FunnelSteps } from "@/components/data/funnel-steps"
import { statusLabels } from "@/lib/offer-acceptance-tracking-mock-data"
import type { StatusFunnelStep } from "@/types/offer-acceptance-tracking"

interface StatusFunnelProps {
  data: StatusFunnelStep[]
}

export function StatusFunnel({ data }: StatusFunnelProps) {
  // FunnelSteps requires the data sorted descending — guarantee it here.
  const sorted = [...data].sort((a, b) => b.count - a.count)

  const steps = sorted.map((s) => ({
    label: statusLabels[s.status],
    value: s.count,
  }))

  return (
    <DashboardCardPreset
      title="Candidate Status Funnel"
      description="Offered → Considering → Accepted. Conversion rates shown between consecutive stages."
    >
      <FunnelSteps
        data={steps}
        showConversion
        formatValue={(v) => v.toLocaleString("en-US")}
      />
    </DashboardCardPreset>
  )
}
