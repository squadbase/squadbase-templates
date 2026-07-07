import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { Placeholder } from "@/components/common/placeholder"
import { formatNumber, formatPercent } from "./chart-helpers"
import type { StageRow } from "@/templates/funnel/types"

const STEP_NAMES = ["ステージ1 → 2", "ステージ2 → 3", "ステージ3 → 4", "ステージ4 → 5"]

interface StageTableProps {
  data: StageRow[]
}

export function StageTable({ data }: StageTableProps) {
  const columns = useMemo<ColumnDef<StageRow>[]>(
    () => [
      {
        id: "step",
        header: "列1",
        cell: ({ row }) => STEP_NAMES[row.index],
      },
      {
        accessorKey: "count",
        header: "列2",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{formatNumber(row.original.count)}</Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "conversionRate",
        header: "列3",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{formatPercent(row.original.conversionRate)}</Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "avgDays",
        header: "列4",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{`${row.original.avgDays.toFixed(1)}日`}</Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "dropoff",
        header: "列5",
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
