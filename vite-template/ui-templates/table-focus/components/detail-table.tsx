import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DetailRow } from "@/types/ui-template-table-focus"

interface DetailTableProps {
  data: DetailRow[]
}

export function DetailTable({ data }: DetailTableProps) {
  const columns = useMemo<ColumnDef<DetailRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Column 1",
        cell: () => <Skeleton className="h-4 w-32" />,
      },
      {
        accessorKey: "owner",
        header: "Column 2",
        cell: () => <Skeleton className="h-4 w-20" />,
      },
      {
        accessorKey: "category",
        header: "Column 3",
        cell: () => <Skeleton className="h-5 w-20 rounded-full" />,
      },
      {
        accessorKey: "status",
        header: "Column 4",
        cell: () => <Skeleton className="h-5 w-16 rounded-full" />,
      },
      {
        accessorKey: "revenue",
        header: "Column 5",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-16" />
          </div>
        ),
      },
      {
        accessorKey: "units",
        header: "Column 6",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-12" />
          </div>
        ),
      },
      {
        accessorKey: "margin",
        header: "Column 7",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-10" />
          </div>
        ),
      },
      {
        accessorKey: "updated",
        header: "Column 8",
        cell: () => <Skeleton className="h-3 w-20" />,
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
