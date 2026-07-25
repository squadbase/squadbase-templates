import { useMemo } from "react"

import { DataTablePreset, Placeholder, type ColumnDef } from "@squadbase/vantage/components"

import type { CampaignRow } from "./types.js"

function formatCurrency(n: number, opts: { short?: boolean } = {}): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (opts.short) {
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`
    return `${sign}$${abs.toLocaleString("en-US")}`
  }
  return `${sign}$${Math.round(abs).toLocaleString("en-US")}`
}

interface CampaignTableProps {
  data: CampaignRow[]
}

export function CampaignTable({ data }: CampaignTableProps) {
  const columns = useMemo<ColumnDef<CampaignRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Column 1",
      },
      {
        accessorKey: "channel",
        header: "Column 2",
      },
      {
        accessorKey: "spend",
        header: "Column 3",
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
        header: "Column 4",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>
              {row.original.conversions.toLocaleString("en-US")}
            </Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "roi",
        header: "Column 5",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{`${row.original.roi.toFixed(1)}x`}</Placeholder>
          </div>
        ),
      },
    ],
    [],
  )

  return <DataTablePreset columns={columns} data={data} enableSorting />
}
