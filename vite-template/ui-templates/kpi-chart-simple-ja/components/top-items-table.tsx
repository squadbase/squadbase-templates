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
import { formatCurrency, formatPercent } from "./chart-helpers"
import type { TopItemRow } from "@/types/ui-template-kpi-chart-simple"

interface TopItemsTableProps {
  data: TopItemRow[]
}

export function TopItemsTable({ data }: TopItemsTableProps) {
  const columns = useMemo<ColumnDef<TopItemRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Column 1",
      },
      {
        accessorKey: "category",
        header: "Column 2",
      },
      {
        accessorKey: "revenue",
        header: "Column 3",
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
        header: "Column 4",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>
              {row.original.units.toLocaleString("en-US")}
            </Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "share",
        header: "Column 5",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{formatPercent(row.original.share * 100)}</Placeholder>
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
          <DashboardCardTitle>Top items</DashboardCardTitle>
          <DashboardCardDescription>Ranked by value</DashboardCardDescription>
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        <DataTablePreset columns={columns} data={data} enableSorting />
      </DashboardCardContent>
    </DashboardCard>
  )
}
