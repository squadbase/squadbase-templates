import { useMemo, useState } from "react"
import { Download, Search } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { formatCurrency, formatNumber, formatSignedPercent } from "./chart-helpers"
import {
  categoryRows,
  detailRows,
} from "@/lib/ui-template-tabbed-dashboard-mock-data"
import type { CategoryRow, DetailRow } from "@/types/ui-template-tabbed-dashboard"

const statusConfig: Record<DetailRow["status"], { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  paused: {
    label: "Paused",
    className: "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
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
        header: "Category",
        cell: ({ row }) => <span className="font-medium">{row.original.category}</span>,
      },
      {
        accessorKey: "value",
        header: "Revenue",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.original.value, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "share",
        header: "Share",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {(row.original.share * 100).toFixed(1)}%
          </div>
        ),
      },
      {
        accessorKey: "delta",
        header: "Δ",
        cell: ({ row }) => {
          const v = row.original.delta
          return (
            <div
              className={cn(
                "text-right tabular-nums font-medium",
                v < 0 ? "text-rose-600" : "text-emerald-600",
              )}
            >
              {formatSignedPercent(v)}
            </div>
          )
        },
      },
    ],
    [],
  )

  const detailColumns = useMemo<ColumnDef<DetailRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Item",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "owner",
        header: "Owner",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{row.original.owner}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const cfg = statusConfig[row.original.status]
          return (
            <Badge variant="outline" className={cn("text-xs font-medium", cfg.className)}>
              {cfg.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: "value",
        header: "Revenue",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.original.value, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "units",
        header: "Units",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {formatNumber(row.original.units)}
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
            placeholder="Search items or owners..."
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
            <ToggleGroupItem value="active">Active</ToggleGroupItem>
            <ToggleGroupItem value="paused">Paused</ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      <DashboardCardPreset
        title="All Items"
        description={`${filteredRows.length} of ${detailRows.length} items`}
      >
        <DataTablePreset columns={detailColumns} data={filteredRows} enableSorting />
      </DashboardCardPreset>

      <DashboardCardPreset
        title="Category Detail"
        description="Per-category revenue, share, and delta"
      >
        <DataTablePreset columns={categoryColumns} data={categoryRows} enableSorting />
      </DashboardCardPreset>
    </div>
  )
}
