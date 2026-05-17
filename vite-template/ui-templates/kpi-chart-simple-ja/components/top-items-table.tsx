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
        header: "商品",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "カテゴリ",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs font-medium">
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
        accessorKey: "units",
        header: "販売数",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {formatNumber(row.original.units)}
          </div>
        ),
      },
      {
        accessorKey: "share",
        header: "構成比",
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
      title="トップ商品"
      description="期間内の売上上位商品"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
