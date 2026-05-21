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
