import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "./chart-helpers"
import type { ResourceCostRow } from "@/types/ai-cloud-cost-analysis"

interface ResourceTopTableProps {
  data: ResourceCostRow[]
}

function changeBadgeClass(pct: number): string {
  if (pct >= 10)
    return "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300"
  if (pct <= -5)
    return "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  return "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
}

export function ResourceTopTable({ data }: ResourceTopTableProps) {
  const columns = useMemo<ColumnDef<ResourceCostRow>[]>(
    () => [
      {
        accessorKey: "resourceName",
        header: "リソース",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="font-medium truncate">{row.original.resourceName}</div>
            <div className="text-xs text-muted-foreground truncate">
              {row.original.resourceId}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "service",
        header: "サービス",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.service}
          </span>
        ),
      },
      {
        accessorKey: "monthlyCost",
        header: "今月コスト",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.original.monthlyCost, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "prevMonthCost",
        header: "前月コスト",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {formatCurrency(row.original.prevMonthCost, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "changePct",
        header: "前月比",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold tabular-nums",
                changeBadgeClass(row.original.changePct),
              )}
            >
              {row.original.changePct >= 0 ? "+" : ""}
              {row.original.changePct.toFixed(1)}%
            </Badge>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="リソース別 Top 10 コスト"
      description="今月のコストが高いリソースをランキング表示"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
