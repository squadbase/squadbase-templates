import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { Skeleton } from "@/components/ui/skeleton"
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
        cell: () => <Skeleton className="h-4 w-32" />,
      },
      {
        accessorKey: "count",
        header: "Column 2",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-16" />
          </div>
        ),
      },
      {
        accessorKey: "conversionRate",
        header: "Column 3",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-12" />
          </div>
        ),
      },
      {
        accessorKey: "avgDays",
        header: "Column 4",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-10" />
          </div>
        ),
      },
      {
        accessorKey: "dropoff",
        header: "Column 5",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-16" />
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
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        <DataTablePreset columns={columns} data={data} enableSorting />
      </DashboardCardContent>
    </DashboardCard>
  )
}
