import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type {
  PreventiveMaintenanceTask,
  PmStatus,
} from "@/types/equipment-maintenance-dashboard"

interface PreventiveMaintenanceListProps {
  data: PreventiveMaintenanceTask[]
}

const STATUS_LABELS: Record<PmStatus, string> = {
  overdue: "期日超過",
  "due-today": "本日期日",
  upcoming: "近日",
  scheduled: "予定",
}

function statusBadgeClass(status: PmStatus): string {
  switch (status) {
    case "overdue":
      return "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300"
    case "due-today":
      return "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "upcoming":
      return "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300"
    case "scheduled":
      return "border-muted-foreground/40 bg-muted text-muted-foreground"
  }
}

function rowEmphasisClass(status: PmStatus): string {
  return status === "overdue"
    ? "text-rose-600 dark:text-rose-400 font-semibold"
    : status === "due-today"
      ? "text-amber-600 dark:text-amber-400 font-medium"
      : "text-foreground"
}

function offsetLabel(days: number): string {
  if (days === 0) return "本日"
  if (days < 0) {
    return `${Math.abs(days)} 日超過`
  }
  return `${days} 日後`
}

export function PreventiveMaintenanceList({
  data,
}: PreventiveMaintenanceListProps) {
  const columns = useMemo<ColumnDef<PreventiveMaintenanceTask>[]>(
    () => [
      {
        accessorKey: "dueDate",
        header: "期日",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span
              className={cn(
                "tabular-nums",
                rowEmphasisClass(row.original.status),
              )}
            >
              {row.original.dueDate}
            </span>
            <span className="text-xs text-muted-foreground">
              {offsetLabel(row.original.daysOffset)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "equipmentName",
        header: "設備",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.equipmentName}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.equipment_id}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "taskName",
        header: "作業内容",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.taskName}</span>
        ),
      },
      {
        accessorKey: "assignee",
        header: "担当者",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.assignee}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "ステータス",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold",
              statusBadgeClass(row.original.status),
            )}
          >
            {STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="予防保全予定リスト"
      description="今後の予防保全タスク一覧。期日超過は赤でハイライト"
    >
      <DataTablePreset
        columns={columns}
        data={data}
        enableSorting
        enablePagination
      />
    </DashboardCardPreset>
  )
}
