import { Circle, Loader2, CheckCircle2, AlertTriangle } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { Progress } from "@/components/ui/progress"
import type { StatusSummaryItem, TaskStatus } from "@/types/task-status-management"

interface StatusBoardProps {
  data: StatusSummaryItem[]
}

const ICONS: Record<TaskStatus, LucideIcon> = {
  not_started: Circle,
  in_progress: Loader2,
  completed: CheckCircle2,
}

const ACCENT: Record<TaskStatus, string> = {
  not_started: "text-muted-foreground",
  in_progress: "text-chart-1",
  completed: "text-emerald-600 dark:text-emerald-400",
}

export function StatusBoard({ data }: StatusBoardProps) {
  const total = data.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {data.map((item) => {
        const Icon = ICONS[item.status]
        const sharePct = total > 0 ? (item.count / total) * 100 : 0
        return (
          <DashboardCard key={item.status}>
            <DashboardCardHeader>
              <DashboardCardTitle className="font-medium text-muted-foreground">
                {item.label}
              </DashboardCardTitle>
              <DashboardCardAction>
                <Icon className={`size-4 ${ACCENT[item.status]}`} />
              </DashboardCardAction>
            </DashboardCardHeader>
            <DashboardCardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold tabular-nums">{item.count}</div>
                <div className="text-sm text-muted-foreground tabular-nums">
                  / {total}
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <Progress value={sharePct} className="h-1.5" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="tabular-nums">全体比 {sharePct.toFixed(0)}%</span>
                  {item.overdueCount > 0 && item.status !== "completed" ? (
                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="size-3" />
                      <span className="tabular-nums">{item.overdueCount} 件超過</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </DashboardCardContent>
          </DashboardCard>
        )
      })}
    </div>
  )
}
