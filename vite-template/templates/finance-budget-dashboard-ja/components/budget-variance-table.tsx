import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  formatCurrency,
  formatSignedCurrency,
  formatSignedPercent,
} from "./chart-helpers"
import type { BudgetVarianceRow, KpiStatus } from "@/types/finance-budget"

interface BudgetVarianceTableProps {
  data: BudgetVarianceRow[]
}

const statusConfig: Record<
  KpiStatus,
  { label: string; className: string }
> = {
  achieved: {
    label: "達成",
    className:
      "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    label: "警告",
    className:
      "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  unmet: {
    label: "未達",
    className:
      "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
}

export function BudgetVarianceTable({ data }: BudgetVarianceTableProps) {
  const columns = useMemo<ColumnDef<BudgetVarianceRow>[]>(
    () => [
      {
        accessorKey: "department",
        header: "部門",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.department}</span>
        ),
      },
      {
        accessorKey: "budget",
        header: "予算",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.budget, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "actual",
        header: "実績",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.original.actual, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "variance",
        header: "差異",
        cell: ({ row }) => {
          const v = row.original.variance
          return (
            <div
              className={cn(
                "text-right font-medium tabular-nums",
                v > 0
                  ? "text-rose-600 dark:text-rose-400"
                  : v < 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground",
              )}
            >
              {formatSignedCurrency(v, { short: true })}
            </div>
          )
        },
      },
      {
        accessorKey: "varianceRate",
        header: "差異率",
        cell: ({ row }) => {
          const rate = row.original.varianceRate
          const status = row.original.status
          return (
            <div
              className={cn(
                "text-right font-semibold tabular-nums",
                status === "unmet"
                  ? "text-rose-600 dark:text-rose-400"
                  : status === "warning"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground",
              )}
            >
              {formatSignedPercent(rate)}
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "ステータス",
        cell: ({ row }) => {
          const cfg = statusConfig[row.original.status]
          return (
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", cfg.className)}
            >
              {cfg.label}
            </Badge>
          )
        },
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="部門別 予実比較"
      description="差異率が閾値を超える部門は赤で強調表示"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
