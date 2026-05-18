import { useMemo, useState } from "react"
import { Download, Search } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  categoryRows,
  detailRows,
} from "@/lib/ui-template-tabbed-dashboard-mock-data"
import type { CategoryRow, DetailRow } from "@/types/ui-template-tabbed-dashboard"

type StatusFilter = "all" | DetailRow["status"]

export function DetailTab() {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return detailRows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false
      if (!q) return true
      return (
        row.name.toLowerCase().includes(q) ||
        row.owner.toLowerCase().includes(q)
      )
    })
  }, [query, statusFilter])

  const categoryColumns = useMemo<ColumnDef<CategoryRow>[]>(
    () => [
      {
        accessorKey: "category",
        header: "Column 1",
        cell: () => <Skeleton className="h-4 w-24" />,
      },
      {
        accessorKey: "value",
        header: "Column 2",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-16" />
          </div>
        ),
      },
      {
        accessorKey: "share",
        header: "Column 3",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-10" />
          </div>
        ),
      },
      {
        accessorKey: "delta",
        header: "Column 4",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-12" />
          </div>
        ),
      },
    ],
    [],
  )

  const detailColumns = useMemo<ColumnDef<DetailRow>[]>(
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
        accessorKey: "status",
        header: "Column 3",
        cell: () => <Skeleton className="h-5 w-16 rounded-full" />,
      },
      {
        accessorKey: "value",
        header: "Column 4",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-16" />
          </div>
        ),
      },
      {
        accessorKey: "units",
        header: "Column 5",
        cell: () => (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-12" />
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          <ToggleGroup
            type="single"
            value={statusFilter}
            onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="active">Option A</ToggleGroupItem>
            <ToggleGroupItem value="paused">Option B</ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
          </Button>
        </div>
      </div>

      <DashboardCard>
        <DashboardCardHeader>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3.5 w-48" />
          </div>
        </DashboardCardHeader>
        <DashboardCardContent>
          <DataTablePreset columns={detailColumns} data={filteredRows} enableSorting />
        </DashboardCardContent>
      </DashboardCard>

      <DashboardCard>
        <DashboardCardHeader>
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-56" />
          </div>
        </DashboardCardHeader>
        <DashboardCardContent>
          <DataTablePreset columns={categoryColumns} data={categoryRows} enableSorting />
        </DashboardCardContent>
      </DashboardCard>
    </div>
  )
}
