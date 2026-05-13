import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { FunnelSteps } from "@/components/data/funnel-steps"
import { STAGE_LABEL_JA } from "@/lib/recruiting-funnel-mock-data"
import type { FunnelStageStat } from "@/types/recruiting-funnel"

interface StageFunnelProps {
  data: FunnelStageStat[]
}

export function StageFunnel({ data }: StageFunnelProps) {
  // FunnelSteps requires descending order — sort defensively
  const sorted = [...data].sort((a, b) => b.count - a.count)

  const steps = sorted.map((s) => ({
    label: STAGE_LABEL_JA[s.stage],
    value: s.count,
  }))

  return (
    <DashboardCardPreset
      title="ステージ別ファネル"
      description="応募 → 書類選考 → 面接 → 内定 → 入社 までの件数と段差別の通過率"
    >
      <FunnelSteps
        data={steps}
        showConversion
        formatValue={(v) => v.toLocaleString("ja-JP")}
      />
    </DashboardCardPreset>
  )
}
