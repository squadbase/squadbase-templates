import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatNumber, formatPercent } from "./chart-helpers"
import type { TopItemRow } from "@/types/ui-template-kpi-chart-simple"

interface TopItemsTableProps {
  data: TopItemRow[]
}

export function TopItemsTable({ data }: TopItemsTableProps) {
  const columns = useMemo<ColumnDef<TopItemRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Item",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs font-medium">
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
        accessorKey: "units",
        header: "Units",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {formatNumber(row.original.units)}
          </div>
        ),
      },
      {
        accessorKey: "share",
        header: "Share",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {formatPercent(row.original.share * 100)}
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="Top Items"
      description="Best-performing items in the selected period"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
