import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { FunnelSteps } from "@/components/data/funnel-steps"
import { statusLabels } from "@/lib/offer-acceptance-tracking-mock-data"
import type { StatusFunnelStep } from "@/types/offer-acceptance-tracking"

interface StatusFunnelProps {
  data: StatusFunnelStep[]
}

export function StatusFunnel({ data }: StatusFunnelProps) {
  // FunnelSteps は降順データを要求するため、ここで保証する
  const sorted = [...data].sort((a, b) => b.count - a.count)

  const steps = sorted.map((s) => ({
    label: statusLabels[s.status],
    value: s.count,
  }))

  return (
    <DashboardCardPreset
      title="内定者ステータスファネル"
      description="内定 → 検討中 → 承諾。ステージ間の遷移率を表示します。"
    >
      <FunnelSteps
        data={steps}
        showConversion
        formatValue={(v) => v.toLocaleString("ja-JP")}
      />
    </DashboardCardPreset>
  )
}
