import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { OwnerRanking } from "@/types/lead-funnel"

interface IsRankingProps {
  data: OwnerRanking[]
}

export function IsRanking({ data }: IsRankingProps) {
  // Sorted descending by appointment count
  const sorted = [...data].sort((a, b) => b.appointments - a.appointments)
  const topApptCount = sorted[0]?.appointments ?? 0

  const columns = useMemo<ColumnDef<OwnerRanking>[]>(
    () => [
      {
        id: "rank",
        header: "Rank",
        cell: ({ row }) => (
          <span className="text-sm font-semibold tabular-nums text-muted-foreground">
            #{row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: "owner",
        header: "IS Member",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.owner}</span>
        ),
      },
      {
        accessorKey: "appointments",
        header: "Appointments",
        cell: ({ row }) => {
          const v = row.original.appointments
          const widthPct = topApptCount === 0 ? 0 : (v / topApptCount) * 100
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-1.5 w-24 overflow-hidden rounded-sm bg-muted">
                <div
                  className="h-full rounded-sm bg-chart-1"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span className="tabular-nums font-medium">{v}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "sqls",
        header: "SQLs",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {row.original.sqls}
          </div>
        ),
      },
      {
        accessorKey: "opportunities",
        header: "Opportunities",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.opportunities}
          </div>
        ),
      },
      {
        accessorKey: "appointmentRate",
        header: "Appointment Rate",
        cell: ({ row }) => {
          const v = row.original.appointmentRate
          const good = v >= 60
          const bad = v < 40
          return (
            <div className="text-right">
              <Badge
                variant="outline"
                className={cn(
                  "tabular-nums",
                  good &&
                    "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                  bad &&
                    "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                )}
              >
                {v.toFixed(1)}%
              </Badge>
            </div>
          )
        },
      },
    ],
    [topApptCount],
  )

  return (
    <DashboardCardPreset
      title="IS Member Appointment Ranking"
      description="Inside-sales members ranked by appointment count, with SQL→Appointment conversion rate."
    >
      <DataTablePreset columns={columns} data={sorted} enableSorting />
    </DashboardCardPreset>
  )
}
