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
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium">
            {row.original.category}
          </Badge>
        ),
      },
      {
        accessorKey: "revenue",
        header: "Revenue",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.original.revenue, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "orders",
        header: "Orders",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.orders.toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "vsAverage",
        header: "vs 30-day avg",
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
      title="Top Categories (Today)"
      description="Today's top 5 categories vs 30-day daily average"
    >
      <DataTablePreset columns={columns} data={data} />
    </DashboardCardPreset>
  )
}
