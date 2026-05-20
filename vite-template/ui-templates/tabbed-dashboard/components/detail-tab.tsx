import { useMemo, useState } from "react"
import { Download, Search } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Placeholder } from "@/components/common/placeholder"
import { formatCurrency, formatPercent, formatSignedPercent } from "./chart-helpers"
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
      },
      {
        accessorKey: "value",
        header: "Column 2",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>
              {formatCurrency(row.original.value, { short: true })}
            </Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "share",
        header: "Column 3",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{formatPercent(row.original.share * 100)}</Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "delta",
        header: "Column 4",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{formatSignedPercent(row.original.delta)}</Placeholder>
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
      },
      {
        accessorKey: "owner",
        header: "Column 2",
      },
      {
        accessorKey: "status",
        header: "Column 3",
      },
      {
        accessorKey: "value",
        header: "Column 4",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>
              {formatCurrency(row.original.value, { short: true })}
            </Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "units",
        header: "Column 5",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>
              {row.original.units.toLocaleString("en-US")}
            </Placeholder>
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
          <div className="space-y-1">
            <DashboardCardTitle>Records</DashboardCardTitle>
            <DashboardCardDescription>
              Detailed rows for the current filter
            </DashboardCardDescription>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent>
          <DataTablePreset columns={detailColumns} data={filteredRows} enableSorting />
        </DashboardCardContent>
      </DashboardCard>

      <DashboardCard>
        <DashboardCardHeader>
          <div className="space-y-1">
            <DashboardCardTitle>By category</DashboardCardTitle>
            <DashboardCardDescription>Share of total</DashboardCardDescription>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent>
          <DataTablePreset columns={categoryColumns} data={categoryRows} enableSorting />
        </DashboardCardContent>
      </DashboardCard>
    </div>
  )
}
