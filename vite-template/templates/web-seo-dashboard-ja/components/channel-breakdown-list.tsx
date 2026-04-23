import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatNumber, formatPercent } from "./chart-helpers"
import type { ChannelBreakdown } from "@/types/web-seo"

interface ChannelBreakdownListProps {
  data: ChannelBreakdown[]
}

export function ChannelBreakdownList({ data }: ChannelBreakdownListProps) {
  const totalSessions = data.reduce((s, d) => s + d.sessions, 0)

  return (
    <DashboardCardPreset
      title="チャネル別流入構成"
      description="セッション数と構成比"
    >
      <div className="space-y-3">
        <div className="flex items-baseline justify-between border-b pb-2">
          <span className="text-xs text-muted-foreground">総セッション</span>
          <span className="text-lg font-semibold tabular-nums">
            {formatNumber(totalSessions)}
          </span>
        </div>
        <ul className="space-y-2.5">
          {data.map((c) => (
            <li key={c.channel} className="space-y-1">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{c.channel}</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatNumber(c.sessions)}{" "}
                  <span className="ml-1.5 text-xs">
                    ({formatPercent(c.percentage)})
                  </span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${c.percentage}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DashboardCardPreset>
  )
}
