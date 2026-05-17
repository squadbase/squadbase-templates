import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency, formatNumber, formatPercent } from "./chart-helpers"
import type { DetailRow } from "@/types/ui-template-table-focus"

interface DetailTableProps {
  data: DetailRow[]
}

const statusConfig: Record<DetailRow["status"], { label: string; className: string }> = {
  active: {
    label: "公開",
    className: "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  paused: {
    label: "一時停止",
    className: "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  draft: {
    label: "下書き",
    className: "border-zinc-500/60 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  },
}

export function DetailTable({ data }: DetailTableProps) {
  const columns = useMemo<ColumnDef<DetailRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "アイテム",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "owner",
        header: "担当",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{row.original.owner}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "カテゴリ",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs font-medium">
            {row.original.category}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "ステータス",
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
        accessorKey: "revenue",
        header: "売上",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.original.revenue, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "units",
        header: "販売数",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {formatNumber(row.original.units)}
          </div>
        ),
      },
      {
        accessorKey: "margin",
        header: "マージン",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatPercent(row.original.margin)}
          </div>
        ),
      },
      {
        accessorKey: "updated",
        header: "更新日",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {row.original.updated}
          </span>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="全アイテム"
      description="ソート可能な詳細テーブル (カタログ全件)"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
