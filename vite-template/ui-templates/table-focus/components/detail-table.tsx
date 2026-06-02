import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { Placeholder } from "@/components/common/placeholder"
import { formatCurrency, formatPercent } from "./chart-helpers"
import type { DetailRow } from "@/types/ui-template-table-focus"

interface DetailTableProps {
  data: DetailRow[]
}

export function DetailTable({ data }: DetailTableProps) {
  const columns = useMemo<ColumnDef<DetailRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Column 1",
      },
      {
        accessorKey: "owner",
        header: "Column 2",
      },
      {
        accessorKey: "category",
        header: "Column 3",
      },
      {
        accessorKey: "status",
        header: "Column 4",
      },
      {
        accessorKey: "revenue",
        header: "Column 5",
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
        header: "Column 6",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>
              {row.original.units.toLocaleString("en-US")}
            </Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "margin",
        header: "Column 7",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{formatPercent(row.original.margin)}</Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "updated",
        header: "Column 8",
        cell: ({ row }) => (
          <Placeholder className="text-xs">{row.original.updated}</Placeholder>
        ),
      },
    ],
    [],
  )

  return <DataTablePreset columns={columns} data={data} enableSorting />
}
