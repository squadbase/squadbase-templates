import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { FunnelSteps } from "@/components/data/funnel-steps"
import { formatNumber } from "./chart-helpers"
import type { FunnelStepData } from "@/types/ec-conversion-funnel"

interface ConversionFunnelProps {
  data: FunnelStepData[]
}

const STEP_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4"]

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  // FunnelSteps requires descending values — sort to be safe.
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const steps = sorted.map((s, i) => ({
    label: s.label,
    value: s.value,
    color: STEP_COLORS[i % STEP_COLORS.length],
  }))

  return (
    <DashboardCardPreset
      title="Conversion Funnel"
      description="Visit → Product View → Add to Cart → Purchase"
    >
      <FunnelSteps
        data={steps}
        showConversion
        formatValue={formatNumber}
      />
    </DashboardCardPreset>
  )
}
