import { useMemo } from "react"
import { DataTablePreset, Placeholder } from "@squadbase/vantage/components"
import type { ColumnDef } from "@squadbase/vantage/components"

import { formatNumber, formatPercent } from "./chart-helpers.js"
import type { StageRow } from "./types.js"

const STEP_NAMES = ["Stage 1 → 2", "Stage 2 → 3", "Stage 3 → 4", "Stage 4 → 5"]

interface StageTableProps {
  data: StageRow[]
}

export function StageTable({ data }: StageTableProps) {
  const columns = useMemo<ColumnDef<StageRow>[]>(
    () => [
      {
        id: "step",
        header: "Column 1",
        cell: ({ row }) => STEP_NAMES[row.index],
      },
      {
        accessorKey: "count",
        header: "Column 2",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{formatNumber(row.original.count)}</Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "conversionRate",
        header: "Column 3",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{formatPercent(row.original.conversionRate)}</Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "avgDays",
        header: "Column 4",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{`${row.original.avgDays.toFixed(1)}d`}</Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "dropoff",
        header: "Column 5",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{formatNumber(row.original.dropoff)}</Placeholder>
          </div>
        ),
      },
    ],
    [],
  )

  return <DataTablePreset columns={columns} data={data} enableSorting />
}
