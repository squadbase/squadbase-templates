import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency, formatSignedPercent } from "./chart-helpers"
import type { RepPaceRow, RepPaceStatus } from "@/types/sales-rep-individual-target"

interface PaceJudgmentTableProps {
  data: RepPaceRow[]
}

const statusConfig: Record<RepPaceStatus, { label: string; className: string }> = {
  ahead: {
    label: "先行",
    className:
      "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  "on-track": {
    label: "順調",
    className:
      "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  behind: {
    label: "遅れ",
    className:
      "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
}

export function PaceJudgmentTable({ data }: PaceJudgmentTableProps) {
  const columns = useMemo<ColumnDef<RepPaceRow>[]>(
    () => [
      {
        accessorKey: "salesRep",
        header: "担当者",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.salesRep}</span>
        ),
      },
      {
        accessorKey: "actualDailyAvg",
        header: "実績平均 / 日",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.actualDailyAvg, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "requiredDailyAvg",
        header: "必要日次平均",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.requiredDailyAvg, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "paceDeltaPct",
        header: "ペース差分",
        cell: ({ row }) => {
          const v = row.original.paceDeltaPct
          return (
            <div
              className={cn(
                "text-right font-semibold tabular-nums",
                v >= 5
                  ? "text-emerald-600 dark:text-emerald-400"
                  : v >= -5
                    ? "text-muted-foreground"
                    : "text-rose-600 dark:text-rose-400",
              )}
            >
              {formatSignedPercent(v)}
            </div>
          )
        },
      },
      {
        accessorKey: "remaining",
        header: "残目標",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.remaining, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "判定",
        cell: ({ row }) => {
          const cfg = statusConfig[row.original.status]
          return (
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", cfg.className)}
            >
              {cfg.label}
            </Badge>
          )
        },
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="ペース判定 (必要日次平均 vs 実績平均)"
      description="残目標を達成するために必要な日次平均と、これまでの実績平均を比較します。ペースが目標を 5 pt 以上下回る担当者は『遅れ』として表示。"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
