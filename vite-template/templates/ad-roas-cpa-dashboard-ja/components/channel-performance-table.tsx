import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "./chart-helpers"
import type { ChannelPerformanceRow } from "@/types/ad-roas-cpa-dashboard"

interface ChannelPerformanceTableProps {
  data: ChannelPerformanceRow[]
}

function roasBadgeClass(roas: number, avg: number): string {
  if (roas >= avg * 1.15)
    return "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  if (roas <= avg * 0.85)
    return "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300"
  return "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
}

export function ChannelPerformanceTable({ data }: ChannelPerformanceTableProps) {
  const avgRoas = useMemo(
    () => data.reduce((s, r) => s + r.roas, 0) / Math.max(1, data.length),
    [data],
  )

  const columns = useMemo<ColumnDef<ChannelPerformanceRow>[]>(
    () => [
      {
        accessorKey: "channelLabel",
        header: "媒体",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.channelLabel}</span>
        ),
      },
      {
        accessorKey: "spend",
        header: "広告費",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.spend, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "conversions",
        header: "CV数",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.conversions.toLocaleString("ja-JP")}
          </div>
        ),
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
        accessorKey: "cpa",
        header: "CPA",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            ¥{Math.round(row.original.cpa).toLocaleString("ja-JP")}
          </div>
        ),
      },
      {
        accessorKey: "roas",
        header: "ROAS",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold tabular-nums",
                roasBadgeClass(row.original.roas, avgRoas),
              )}
            >
              {row.original.roas.toFixed(2)}x
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "ctr",
        header: "CTR",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {row.original.ctr.toFixed(2)}%
          </div>
        ),
      },
      {
        accessorKey: "cvr",
        header: "CVR",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {row.original.cvr.toFixed(2)}%
          </div>
        ),
      },
    ],
    [avgRoas],
  )

  return (
    <DashboardCardPreset
      title="媒体別 ROAS / CPA 比較"
      description="媒体別のパフォーマンスをROAS順にランキング。平均から外れた媒体を色で強調"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
