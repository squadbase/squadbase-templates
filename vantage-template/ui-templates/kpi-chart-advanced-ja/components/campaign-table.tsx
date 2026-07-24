import { useMemo } from "react"

import { DataTablePreset, type ColumnDef } from "@squadbase/vantage/components"

import { Placeholder } from "../placeholder.js"
import type { CampaignRow } from "./types.js"

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

interface CampaignTableProps {
  data: CampaignRow[]
}

export function CampaignTable({ data }: CampaignTableProps) {
  const columns = useMemo<ColumnDef<CampaignRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "列1",
      },
      {
        accessorKey: "channel",
        header: "列2",
      },
      {
        accessorKey: "spend",
        header: "列3",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>
              {formatCurrency(row.original.spend, { short: true })}
            </Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "conversions",
        header: "列4",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>
              {row.original.conversions.toLocaleString("ja-JP")}
            </Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "roi",
        header: "列5",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{`${row.original.roi.toFixed(1)}倍`}</Placeholder>
          </div>
        ),
      },
    ],
    [],
  )

  return <DataTablePreset columns={columns} data={data} enableSorting />
}
