import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { Placeholder } from "@/components/common/placeholder"
import { formatCurrency, formatPercent } from "./chart-helpers"
import type { DetailRow } from "@/types/ui-template-table-focus"

const STATUS_LABELS: Record<DetailRow["status"], string> = {
  active: "有効",
  paused: "一時停止",
  draft: "下書き",
}

interface DetailTableProps {
  data: DetailRow[]
}

export function DetailTable({ data }: DetailTableProps) {
  const columns = useMemo<ColumnDef<DetailRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "列1",
      },
      {
        accessorKey: "owner",
        header: "列2",
      },
      {
        accessorKey: "category",
        header: "列3",
      },
      {
        accessorKey: "status",
        header: "列4",
        cell: ({ row }) => STATUS_LABELS[row.original.status],
      },
      {
        accessorKey: "revenue",
        header: "列5",
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
        header: "列6",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>
              {row.original.units.toLocaleString("ja-JP")}
            </Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "margin",
        header: "列7",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{formatPercent(row.original.margin)}</Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "updated",
        header: "列8",
        cell: ({ row }) => (
          <Placeholder className="text-xs">{row.original.updated}</Placeholder>
        ),
      },
    ],
    [],
  )

  return <DataTablePreset columns={columns} data={data} enableSorting />
}
