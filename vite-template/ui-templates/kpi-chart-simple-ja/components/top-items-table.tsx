import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { Skeleton } from "@/components/ui/skeleton"
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
        cell: () => <Skeleton className="h-4 w-32" />,
      },
      {
        accessorKey: "category",
        header: "Column 2",
        cell: () => <Skeleton className="h-5 w-20 rounded-full" />,
      },
      {
        accessorKey: "revenue",
        header: "Column 3",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-16" />
          </div>
        ),
      },
      {
        accessorKey: "units",
        header: "Column 4",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-12" />
          </div>
        ),
      },
      {
        accessorKey: "share",
        header: "Column 5",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-10" />
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3.5 w-56" />
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        <DataTablePreset columns={columns} data={data} enableSorting />
      </DashboardCardContent>
    </DashboardCard>
  )
}
