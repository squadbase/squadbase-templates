import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { StatusBadge } from "@/components/common/status-badge"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { statusLabels } from "@/lib/task-status-management-mock-data"
import type {
  OverdueTaskRow,
  Priority,
  TaskStatus,
} from "@/types/task-status-management"

interface OverdueTaskTableProps {
  data: OverdueTaskRow[]
}

const statusColorMap: Record<TaskStatus, string> = {
  not_started: "gray",
  in_progress: "blue",
  completed: "green",
}

function priorityBadgeClass(p: Priority): string {
  if (p === "high")
    return "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300"
  if (p === "medium")
    return "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  return "border-slate-400/60 bg-slate-500/10 text-slate-700 dark:text-slate-300"
}

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "高",
  medium: "中",
  low: "低",
}

export function OverdueTaskTable({ data }: OverdueTaskTableProps) {
  const columns = useMemo<ColumnDef<OverdueTaskRow>[]>(
    () => [
      {
        accessorKey: "task_id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.task_id}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "タイトル",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.title}</span>
        ),
      },
      {
        accessorKey: "owner",
        header: "担当",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.owner}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "ステータス",
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            label={statusLabels[row.original.status]}
            colorMap={statusColorMap}
          />
        ),
      },
      {
        accessorKey: "priority",
        header: "優先度",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold",
              priorityBadgeClass(row.original.priority),
            )}
          >
            {PRIORITY_LABEL[row.original.priority]}
          </Badge>
        ),
      },
      {
        accessorKey: "due_date",
        header: "期日",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {row.original.due_date}
          </div>
        ),
      },
      {
        accessorKey: "daysOverdue",
        header: "超過日数",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums text-destructive">
            {row.original.daysOverdue}日
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="期日超過リスト"
      description="期日を過ぎた未完了タスク — 超過日数の長い順"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
