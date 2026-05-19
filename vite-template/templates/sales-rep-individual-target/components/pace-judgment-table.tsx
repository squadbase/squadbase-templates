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
    label: "Ahead",
    className:
      "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  "on-track": {
    label: "On track",
    className:
      "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  behind: {
    label: "Behind",
    className:
      "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
}

export function PaceJudgmentTable({ data }: PaceJudgmentTableProps) {
  const columns = useMemo<ColumnDef<RepPaceRow>[]>(
    () => [
      {
        accessorKey: "salesRep",
        header: "Sales Rep",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.salesRep}</span>
        ),
      },
      {
        accessorKey: "actualDailyAvg",
        header: "Actual Daily Avg",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.actualDailyAvg, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "requiredDailyAvg",
        header: "Required Daily Avg",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.requiredDailyAvg, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "paceDeltaPct",
        header: "Pace Δ",
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
        header: "Remaining",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.remaining, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
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
      title="Pace Judgement"
      description="Required daily average to hit target vs. actual daily average so far. Reps pacing more than 5 pts below target are flagged as behind."
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
