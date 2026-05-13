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
  high: "High",
  medium: "Medium",
  low: "Low",
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
        header: "Title",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.title}</span>
        ),
      },
      {
        accessorKey: "owner",
        header: "Owner",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.owner}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
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
        header: "Priority",
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
        header: "Due",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {row.original.due_date}
          </div>
        ),
      },
      {
        accessorKey: "daysOverdue",
        header: "Days Overdue",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums text-destructive">
            {row.original.daysOverdue}d
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="Overdue Tasks"
      description="Active tasks past their target due date — sorted by longest slip"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
