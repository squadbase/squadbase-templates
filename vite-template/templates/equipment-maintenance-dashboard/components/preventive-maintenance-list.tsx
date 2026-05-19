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
  overdue: "Overdue",
  "due-today": "Due today",
  upcoming: "Upcoming",
  scheduled: "Scheduled",
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
  if (days === 0) return "today"
  if (days < 0) {
    const abs = Math.abs(days)
    return `${abs} day${abs === 1 ? "" : "s"} overdue`
  }
  return `in ${days} day${days === 1 ? "" : "s"}`
}

export function PreventiveMaintenanceList({
  data,
}: PreventiveMaintenanceListProps) {
  const columns = useMemo<ColumnDef<PreventiveMaintenanceTask>[]>(
    () => [
      {
        accessorKey: "dueDate",
        header: "Due",
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
        header: "Equipment",
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
        header: "Task",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.taskName}</span>
        ),
      },
      {
        accessorKey: "assignee",
        header: "Assignee",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.assignee}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
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
      title="Preventive Maintenance Schedule"
      description="Upcoming PM tasks with overdue items highlighted in red"
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
