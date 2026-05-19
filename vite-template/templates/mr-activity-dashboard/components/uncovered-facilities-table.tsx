import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { UncoveredFacilityRow } from "@/types/mr-activity-dashboard"

interface UncoveredFacilitiesTableProps {
  data: UncoveredFacilityRow[]
}

const SEGMENT_LABEL: Record<UncoveredFacilityRow["segment"], string> = {
  key_account: "Key account",
  growth: "Growth",
  watch: "Watch",
}

function segmentBadgeClass(segment: UncoveredFacilityRow["segment"]): string {
  if (segment === "key_account")
    return "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300"
  if (segment === "growth")
    return "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  return "border-muted-foreground/40 bg-muted text-muted-foreground"
}

function daysClass(days: number): string {
  if (days >= 45) return "text-destructive font-semibold"
  if (days >= 30) return "text-amber-700"
  return "text-muted-foreground"
}

export function UncoveredFacilitiesTable({
  data,
}: UncoveredFacilitiesTableProps) {
  const columns = useMemo<ColumnDef<UncoveredFacilityRow>[]>(
    () => [
      {
        accessorKey: "facilityName",
        header: "Facility",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="font-medium truncate">
              {row.original.facilityName}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.original.facilityId}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "territory",
        header: "Territory",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.territory}</span>
        ),
      },
      {
        accessorKey: "segment",
        header: "Segment",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn("text-xs", segmentBadgeClass(row.original.segment))}
          >
            {SEGMENT_LABEL[row.original.segment]}
          </Badge>
        ),
      },
      {
        accessorKey: "daysSinceLastVisit",
        header: "Days since visit",
        cell: ({ row }) => (
          <div
            className={cn(
              "text-right tabular-nums",
              daysClass(row.original.daysSinceLastVisit),
            )}
          >
            {row.original.daysSinceLastVisit}d
          </div>
        ),
      },
      {
        accessorKey: "potentialRxShare",
        header: "Potential Rx share",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.potentialRxShare.toFixed(0)}%
          </div>
        ),
      },
      {
        accessorKey: "assignedMr",
        header: "Assigned MR",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.assignedMr ?? (
              <span className="text-muted-foreground italic">Unassigned</span>
            )}
          </span>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="Uncovered Facilities"
      description="Facilities without a recent visit — prioritize re-engagement by segment and gap"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
