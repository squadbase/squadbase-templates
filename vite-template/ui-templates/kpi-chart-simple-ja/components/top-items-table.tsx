import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { Placeholder } from "@/components/common/placeholder"
import { formatCurrency, formatPercent } from "./chart-helpers"
import type { TopItemRow } from "@/types/ui-template-kpi-chart-simple"

interface TopItemsTableProps {
  data: TopItemRow[]
}

export function TopItemsTable({ data }: TopItemsTableProps) {
  const columns = useMemo<ColumnDef<TopItemRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "列1",
      },
      {
        accessorKey: "category",
        header: "列2",
      },
      {
        accessorKey: "revenue",
        header: "列3",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>
              {formatCurrency(row.original.revenue, { short: true })}
            </Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "units",
        header: "列4",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>
              {row.original.units.toLocaleString("ja-JP")}
            </Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "share",
        header: "列5",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{formatPercent(row.original.share * 100)}</Placeholder>
          </div>
        ),
      },
    ],
    [],
  )

  return <DataTablePreset columns={columns} data={data} enableSorting />
}
