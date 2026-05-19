import { Heart, Trophy, ShieldAlert } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { conditionSummary } from "@/lib/player-performance-analysis-mock-data"

interface SnapshotEntry {
  id: "squad" | "top" | "watch"
  label: string
  value: string
  caption: string
  icon: LucideIcon
}

export function ConditionSnapshot() {
  const entries: SnapshotEntry[] = [
    {
      id: "squad",
      label: "チーム平均",
      value: conditionSummary.squadAverage.toFixed(1),
      caption: "コンディション指標 (0〜100)",
      icon: Heart,
    },
    {
      id: "top",
      label: "コンディション最良",
      value: conditionSummary.topPlayer.conditionIndex.toFixed(1),
      caption: `${conditionSummary.topPlayer.playerName} (${conditionSummary.topPlayer.position})`,
      icon: Trophy,
    },
    {
      id: "watch",
      label: "要観察",
      value: conditionSummary.watchlist.conditionIndex.toFixed(1),
      caption: `${conditionSummary.watchlist.playerName} (${conditionSummary.watchlist.position})`,
      icon: ShieldAlert,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {entries.map((entry) => {
        const Icon = entry.icon
        return (
          <DashboardCard key={entry.id}>
            <DashboardCardHeader>
              <DashboardCardTitle className="font-medium text-muted-foreground">
                {entry.label}
              </DashboardCardTitle>
              <DashboardCardAction>
                <Icon className="size-4 text-muted-foreground" />
              </DashboardCardAction>
            </DashboardCardHeader>
            <DashboardCardContent>
              <div className="text-3xl font-bold tabular-nums">
                {entry.value}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {entry.caption}
              </div>
            </DashboardCardContent>
          </DashboardCard>
        )
      })}
    </div>
  )
}
