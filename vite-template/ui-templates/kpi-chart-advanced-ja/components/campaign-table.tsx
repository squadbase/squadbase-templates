import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { Placeholder } from "@/components/common/placeholder"
import { formatCurrency } from "./chart-helpers"
import type { CampaignRow } from "@/types/ui-template-kpi-chart-advanced"

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
