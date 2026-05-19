import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type {
  EquipmentUptimeRow,
  EquipmentCategory,
} from "@/types/equipment-maintenance-dashboard"

interface EquipmentUptimeTableProps {
  data: EquipmentUptimeRow[]
}

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  press: "Press",
  cnc: "CNC",
  robot: "Robot",
  assembly: "Assembly",
  packaging: "Packaging",
}

function uptimeBadgeClass(pct: number): string {
  if (pct < 85)
    return "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300"
  if (pct < 92)
    return "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  return "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
}

function uptimeTextClass(pct: number): string {
  if (pct < 85) return "text-rose-600 dark:text-rose-400 font-semibold"
  if (pct < 92) return "text-amber-600 dark:text-amber-400 font-medium"
  return "text-foreground"
}

function uptimeBadgeLabel(pct: number): string {
  if (pct < 85) return "At risk"
  if (pct < 92) return "Watch"
  return "Healthy"
}

export function EquipmentUptimeTable({ data }: EquipmentUptimeTableProps) {
  const columns = useMemo<ColumnDef<EquipmentUptimeRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Equipment",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.equipment_id}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {CATEGORY_LABELS[row.original.category]}
          </span>
        ),
      },
      {
        accessorKey: "uptimePct",
        header: "Availability",
        cell: ({ row }) => (
          <div
            className={cn(
              "text-right tabular-nums",
              uptimeTextClass(row.original.uptimePct),
            )}
          >
            {row.original.uptimePct.toFixed(1)}%
          </div>
        ),
      },
      {
        accessorKey: "failureCount",
        header: "Failures",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {row.original.failureCount}
          </div>
        ),
      },
      {
        accessorKey: "mtbfHours",
        header: "MTBF (h)",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {row.original.mtbfHours.toFixed(1)}
          </div>
        ),
      },
      {
        accessorKey: "mttrHours",
        header: "MTTR (h)",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {row.original.mttrHours.toFixed(1)}
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold",
              uptimeBadgeClass(row.original.uptimePct),
            )}
          >
            {uptimeBadgeLabel(row.original.uptimePct)}
          </Badge>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="Equipment Availability"
      description="Per-asset availability, failure count, and MTBF/MTTR for the selected period"
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
