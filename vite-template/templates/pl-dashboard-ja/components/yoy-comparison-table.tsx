import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { cn } from "@/lib/utils"
import {
  formatCurrency,
  formatSignedCurrency,
  formatSignedPercent,
} from "./chart-helpers"
import type { YoyCompareRow } from "@/types/pl-dashboard"

interface YoyComparisonTableProps {
  data: YoyCompareRow[]
}

export function YoyComparisonTable({ data }: YoyComparisonTableProps) {
  const columns = useMemo<ColumnDef<YoyCompareRow>[]>(
    () => [
      {
        accessorKey: "account",
        header: "勘定科目",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.account}</span>
        ),
      },
      {
        accessorKey: "currentYear",
        header: "当年度",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.original.currentYear, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "previousYear",
        header: "前年度",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.previousYear, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "yoyDelta",
        header: "差額",
        cell: ({ row }) => {
          const v = row.original.yoyDelta
          return (
            <div
              className={cn(
                "text-right tabular-nums",
                v > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : v < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground",
              )}
            >
              {formatSignedCurrency(v, { short: true })}
            </div>
          )
        },
      },
      {
        accessorKey: "yoyRate",
        header: "前年比",
        cell: ({ row }) => {
          const rate = row.original.yoyRate
          return (
            <div
              className={cn(
                "text-right font-semibold tabular-nums",
                rate > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : rate < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground",
              )}
            >
              {formatSignedPercent(rate)}
            </div>
          )
        },
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="前年比較テーブル"
      description="当月実績と前年同月実績を勘定科目別に比較"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
