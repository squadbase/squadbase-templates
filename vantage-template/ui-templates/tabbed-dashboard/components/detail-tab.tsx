import { useMemo, useState } from "react"
import { Download, Search } from "lucide-react"
import { DashboardCardPreset, DataTablePreset, Placeholder } from "@squadbase/vantage/components"
import type { ColumnDef } from "@squadbase/vantage/components"
import {
  Button,
  Input,
  ToggleGroup,
  ToggleGroupItem,
} from "@squadbase/vantage/ui"

import { categoryRows, detailRows } from "./mock-data"
import type { CategoryRow, DetailRow } from "./types"

function formatCurrency(n: number, opts: { short?: boolean } = {}): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (opts.short) {
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`
    return `${sign}$${abs.toLocaleString("en-US")}`
  }
  return `${sign}$${Math.round(abs).toLocaleString("en-US")}`
}

function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

function formatSignedPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(digits)}%`
}

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
          {/* Base UI's ToggleGroup is always multi-value: read/write `string[]`. */}
          <ToggleGroup
            value={[statusFilter]}
            onValueChange={(value) => {
              const next = value[0]
              if (next) setStatusFilter(next as StatusFilter)
            }}
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

      <DashboardCardPreset
        title="Records"
        description="Detailed rows for the current filter"
      >
        <DataTablePreset columns={detailColumns} data={filteredRows} enableSorting />
      </DashboardCardPreset>

      <DashboardCardPreset title="By category" description="Share of total">
        <DataTablePreset columns={categoryColumns} data={categoryRows} enableSorting />
      </DashboardCardPreset>
    </div>
  )
}
