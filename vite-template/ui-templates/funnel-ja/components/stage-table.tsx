import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { cn } from "@/lib/utils"
import { formatNumber, formatPercent } from "./chart-helpers"
import type { StageRow } from "@/types/ui-template-funnel"

interface StageTableProps {
  data: StageRow[]
}

export function StageTable({ data }: StageTableProps) {
  const columns = useMemo<ColumnDef<StageRow>[]>(
    () => [
      {
        accessorKey: "stage",
        header: "ステージ遷移",
        cell: ({ row }) => <span className="font-medium">{row.original.stage}</span>,
      },
      {
        accessorKey: "count",
        header: "通過件数",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatNumber(row.original.count)}
          </div>
        ),
      },
      {
        accessorKey: "conversionRate",
        header: "通過率",
        cell: ({ row }) => {
          const r = row.original.conversionRate
          return (
            <div
              className={cn(
                "text-right font-medium tabular-nums",
                r < 25 ? "text-rose-600" : r > 60 ? "text-emerald-600" : "",
              )}
            >
              {formatPercent(r)}
            </div>
          )
        },
      },
      {
        accessorKey: "avgDays",
        header: "平均日数",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {row.original.avgDays.toFixed(1)}
          </div>
        ),
      },
      {
        accessorKey: "dropoff",
        header: "離脱数",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-rose-600 dark:text-rose-400">
            {formatNumber(row.original.dropoff)}
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="ステージ別パフォーマンス"
      description="各ステージの通過率・速度・離脱数のランキング"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
