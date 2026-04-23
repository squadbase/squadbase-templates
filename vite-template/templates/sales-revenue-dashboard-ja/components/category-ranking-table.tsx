import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  formatCurrency,
  formatPercent,
  formatSignedPercent,
} from "./chart-helpers"
import type { CategoryRankingItem } from "@/types/sales-revenue"

interface CategoryRankingTableProps {
  data: CategoryRankingItem[]
}

export function CategoryRankingTable({ data }: CategoryRankingTableProps) {
  const columns = useMemo<ColumnDef<CategoryRankingItem>[]>(
    () => [
      {
        accessorKey: "rank",
        header: "#",
        cell: ({ row }) => (
          <div className="w-6 text-center font-medium tabular-nums">
            {row.original.rank}
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "カテゴリ",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium">
            {row.original.category}
          </Badge>
        ),
      },
      {
        accessorKey: "revenue",
        header: "売上",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.original.revenue, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "orders",
        header: "注文数",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.orders.toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "aov",
        header: "AOV",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.aov)}
          </div>
        ),
      },
      {
        accessorKey: "shareOfTotal",
        header: "構成比",
        cell: ({ row }) => {
          const share = row.original.shareOfTotal
          return (
            <div className="flex items-center gap-2">
              <div className="h-2 w-16 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-chart-1"
                  style={{ width: `${Math.min(share * 2, 100)}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {formatPercent(share)}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "yoyChange",
        header: "前年比",
        cell: ({ row }) => {
          const delta = row.original.yoyChange
          return (
            <div
              className={cn(
                "text-right font-medium tabular-nums",
                delta > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : delta < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground",
              )}
            >
              {formatSignedPercent(delta)}
            </div>
          )
        },
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset title="カテゴリ別売上ランキング">
      <DataTablePreset
        columns={columns}
        data={data}
        enableSorting
      />
    </DashboardCardPreset>
  )
}
