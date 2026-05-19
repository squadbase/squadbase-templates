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
  key_account: "重点施設",
  growth: "成長施設",
  watch: "ウォッチ",
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
        header: "施設名",
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
        header: "エリア",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.territory}</span>
        ),
      },
      {
        accessorKey: "segment",
        header: "セグメント",
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
        header: "最終訪問からの経過",
        cell: ({ row }) => (
          <div
            className={cn(
              "text-right tabular-nums",
              daysClass(row.original.daysSinceLastVisit),
            )}
          >
            {row.original.daysSinceLastVisit}日
          </div>
        ),
      },
      {
        accessorKey: "potentialRxShare",
        header: "想定処方シェア",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.potentialRxShare.toFixed(0)}%
          </div>
        ),
      },
      {
        accessorKey: "assignedMr",
        header: "担当MR",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.assignedMr ?? (
              <span className="text-muted-foreground italic">未割当</span>
            )}
          </span>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="未カバー施設リスト"
      description="一定期間訪問できていない施設。セグメント・経過日数で優先順位を判断"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
