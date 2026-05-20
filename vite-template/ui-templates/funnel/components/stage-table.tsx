import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { Placeholder } from "@/components/common/placeholder"
import { formatNumber, formatPercent } from "./chart-helpers"
import type { StageRow } from "@/types/ui-template-funnel"

interface StageTableProps {
  data: StageRow[]
}

export function StageTable({ data }: StageTableProps) {
  const columns = useMemo<ColumnDef<StageRow>[]>(
    () => [
      {
        accessorKey: "stage",
        header: "Column 1",
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

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <div className="space-y-1">
          <DashboardCardTitle>Stage breakdown</DashboardCardTitle>
          <DashboardCardDescription>
            Conversion between stages
          </DashboardCardDescription>
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        <DataTablePreset columns={columns} data={data} enableSorting />
      </DashboardCardContent>
    </DashboardCard>
  )
}
