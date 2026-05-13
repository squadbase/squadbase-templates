import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency, formatSignedPercent } from "./chart-helpers"
import type { CustomerRankingItem } from "@/types/customer-sales-dashboard"

interface CustomerRankingTableProps {
  data: CustomerRankingItem[]
}

export function CustomerRankingTable({ data }: CustomerRankingTableProps) {
  const columns = useMemo<ColumnDef<CustomerRankingItem>[]>(
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
        accessorKey: "customerName",
        header: "得意先",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.customerName}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.customerId}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "segment",
        header: "セグメント",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium">
            {row.original.segment}
          </Badge>
        ),
      },
      {
        accessorKey: "currentRevenue",
        header: "売上",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.original.currentRevenue, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "orderCount",
        header: "受注件数",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.orderCount.toLocaleString("ja-JP")}
          </div>
        ),
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
      {
        accessorKey: "abcClass",
        header: "ABC",
        cell: ({ row }) => {
          const cls = row.original.abcClass
          const variant: Record<string, string> = {
            A: "bg-chart-1/15 text-chart-1",
            B: "bg-muted text-foreground",
            C: "bg-muted text-muted-foreground",
          }
          return (
            <div className="flex justify-center">
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                  variant[cls],
                )}
              >
                {cls}
              </span>
            </div>
          )
        },
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="得意先別売上ランキング"
      description="売上降順で上位得意先を表示、前年比はカラーで強調"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
