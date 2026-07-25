import { useMemo } from "react"
import { DataTablePreset, Placeholder } from "@squadbase/vantage/components"
import type { ColumnDef } from "@squadbase/vantage/components"

import type { TopItemRow } from "./types"

function formatCurrency(n: number, opts: { short?: boolean } = {}): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (opts.short) {
    if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(2)}億円`
    if (abs >= 10_000) return `${sign}${(abs / 10_000).toFixed(0)}万円`
    return `${sign}¥${abs.toLocaleString("ja-JP")}`
  }
  return `${sign}¥${Math.round(abs).toLocaleString("ja-JP")}`
}

function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

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
