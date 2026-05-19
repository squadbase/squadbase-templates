import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency, formatSignedPercent } from "./chart-helpers"
import type { TodayCategoryItem } from "@/types/sales-revenue"

interface TodayCategoryTop5Props {
  data: TodayCategoryItem[]
}

export function TodayCategoryTop5({ data }: TodayCategoryTop5Props) {
  const columns = useMemo<ColumnDef<TodayCategoryItem>[]>(
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
        accessorKey: "vsAverage",
        header: "30日平均比",
        cell: ({ row }) => {
          const delta = row.original.vsAverage
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
    <DashboardCardPreset
      title="本日のカテゴリ Top5"
      description="直近30日の1日平均と比較した本日の上位5カテゴリ"
    >
      <DataTablePreset columns={columns} data={data} />
    </DashboardCardPreset>
  )
}
