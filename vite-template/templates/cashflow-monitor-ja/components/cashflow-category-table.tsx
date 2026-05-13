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
import type { CategoryRow, CfType } from "@/types/cashflow-monitor"

interface CashflowCategoryTableProps {
  data: CategoryRow[]
}

const cfTypeConfig: Record<CfType, { label: string; className: string }> = {
  operating: {
    label: "営業",
    className:
      "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  investing: {
    label: "投資",
    className:
      "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  financing: {
    label: "財務",
    className:
      "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
}

const directionConfig: Record<"inflow" | "outflow", { label: string; className: string }> = {
  inflow: {
    label: "入金",
    className: "text-emerald-600 dark:text-emerald-400",
  },
  outflow: {
    label: "出金",
    className: "text-rose-600 dark:text-rose-400",
  },
}

export function CashflowCategoryTable({ data }: CashflowCategoryTableProps) {
  const columns = useMemo<ColumnDef<CategoryRow>[]>(
    () => [
      {
        accessorKey: "category",
        header: "カテゴリ",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.category}</span>
        ),
      },
      {
        accessorKey: "cfType",
        header: "CF区分",
        cell: ({ row }) => {
          const cfg = cfTypeConfig[row.original.cfType]
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
      {
        accessorKey: "direction",
        header: "区分",
        cell: ({ row }) => {
          const cfg = directionConfig[row.original.direction]
          return (
            <span className={cn("text-xs font-medium", cfg.className)}>
              {cfg.label}
            </span>
          )
        },
      },
      {
        accessorKey: "current",
        header: "当月",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.original.current, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "previous",
        header: "前月",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {formatCurrency(row.original.previous, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "delta",
        header: "前月差",
        cell: ({ row }) => {
          const v = row.original.delta
          const isOutflowGrowth =
            row.original.direction === "outflow" && v > 0
          const isInflowDrop =
            row.original.direction === "inflow" && v < 0
          const badNews = isOutflowGrowth || isInflowDrop
          return (
            <div
              className={cn(
                "text-right font-medium tabular-nums",
                badNews
                  ? "text-rose-600 dark:text-rose-400"
                  : v === 0
                    ? "text-muted-foreground"
                    : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {formatSignedCurrency(v, { short: true })}
            </div>
          )
        },
      },
      {
        accessorKey: "deltaRate",
        header: "前月比 %",
        cell: ({ row }) => {
          const r = row.original.deltaRate
          return (
            <div className="text-right font-medium tabular-nums">
              {formatSignedPercent(r)}
            </div>
          )
        },
      },
      {
        accessorKey: "shareOfFlow",
        header: "構成比",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {(row.original.shareOfFlow * 100).toFixed(1)}%
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="入出金カテゴリ別テーブル"
      description="当月と前月の比較。構成比は入金/出金それぞれの内訳"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
