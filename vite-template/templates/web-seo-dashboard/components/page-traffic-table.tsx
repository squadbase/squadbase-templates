import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatDuration, formatPercent } from "./chart-helpers"
import { cn } from "@/lib/utils"
import type { PageTrafficRow } from "@/types/web-seo"

interface PageTrafficTableProps {
  data: PageTrafficRow[]
}

export function PageTrafficTable({ data }: PageTrafficTableProps) {
  const columns = useMemo<ColumnDef<PageTrafficRow>[]>(
    () => [
      {
        accessorKey: "pageTitle",
        header: "ページタイトル",
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate font-medium">
            {row.original.pageTitle}
          </div>
        ),
      },
      {
        accessorKey: "pageviews",
        header: "PV",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.pageviews.toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "uniquePageviews",
        header: "UU",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.uniquePageviews.toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "avgTimeOnPage",
        header: "平均滞在時間",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatDuration(row.original.avgTimeOnPage)}
          </div>
        ),
      },
      {
        accessorKey: "bounceRate",
        header: "直帰率",
        cell: ({ row }) => {
          const rate = row.original.bounceRate
          return (
            <div
              className={cn(
                "text-right tabular-nums",
                rate < 35
                  ? "text-emerald-600 dark:text-emerald-400"
                  : rate > 45
                    ? "text-red-600 dark:text-red-400"
                    : "",
              )}
            >
              {formatPercent(rate)}
            </div>
          )
        },
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset title="ページ別トラフィック">
      <DataTablePreset
        columns={columns}
        data={data}
        enableSorting
        enablePagination
      />
    </DashboardCardPreset>
  )
}
