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

import { categoryRows, detailRows } from "./mock-data.js"
import type { CategoryRow, DetailRow } from "./types.js"

function formatCurrency(n: number, opts: { short?: boolean } = {}): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (opts.short) {
    if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(2)}億円`
    if (abs >= 10_000) return `${sign}${(abs / 10_000).toFixed(0)}万円`
    return `${sign}¥${abs.toLocaleString("ja-JP")}`
  }
  return `${sign}¥${Math.round(abs).toLocaleString("ja-JP")}`
}

function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

function formatSignedPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(digits)}%`
}

type StatusFilter = "all" | DetailRow["status"]

const STATUS_LABELS: Record<DetailRow["status"], string> = {
  active: "有効",
  paused: "一時停止",
}

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
        header: "列1",
      },
      {
        accessorKey: "value",
        header: "列2",
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
        header: "列3",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>{formatPercent(row.original.share * 100)}</Placeholder>
          </div>
        ),
      },
      {
        accessorKey: "delta",
        header: "列4",
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
        header: "列1",
      },
      {
        accessorKey: "owner",
        header: "列2",
      },
      {
        accessorKey: "status",
        header: "列3",
        cell: ({ row }) => STATUS_LABELS[row.original.status],
      },
      {
        accessorKey: "value",
        header: "列4",
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
        header: "列5",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Placeholder>
              {row.original.units.toLocaleString("ja-JP")}
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
            placeholder="検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          {/* Base UI の ToggleGroup は常に複数選択形式 — value は `string[]` で読み書きする */}
          <ToggleGroup
            value={[statusFilter]}
            onValueChange={(value) => {
              const next = value[0]
              if (next) setStatusFilter(next as StatusFilter)
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="all">すべて</ToggleGroupItem>
            <ToggleGroupItem value="active">選択肢A</ToggleGroupItem>
            <ToggleGroupItem value="paused">選択肢B</ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
          </Button>
        </div>
      </div>

      <DashboardCardPreset
        title="レコード"
        description="現在のフィルタに該当する行"
      >
        <DataTablePreset columns={detailColumns} data={filteredRows} enableSorting />
      </DashboardCardPreset>

      <DashboardCardPreset title="カテゴリ別" description="全体に占める割合">
        <DataTablePreset columns={categoryColumns} data={categoryRows} enableSorting />
      </DashboardCardPreset>
    </div>
  )
}
