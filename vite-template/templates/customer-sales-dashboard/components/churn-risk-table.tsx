import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "./chart-helpers"
import type { ChurnCandidate } from "@/types/customer-sales-dashboard"

interface ChurnRiskTableProps {
  data: ChurnCandidate[]
}

const RISK_LABEL = {
  high: "High risk",
  watch: "Watch",
  low: "Stable",
} as const

const RISK_STYLE = {
  high: "text-destructive bg-destructive/10 border-destructive/30",
  watch: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800",
  low: "text-muted-foreground bg-muted border-border",
} as const

export function ChurnRiskTable({ data }: ChurnRiskTableProps) {
  const columns = useMemo<ColumnDef<ChurnCandidate>[]>(
    () => [
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.customerName}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.customerId}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "segment",
        header: "Segment",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium">
            {row.original.segment}
          </Badge>
        ),
      },
      {
        accessorKey: "lastOrderDate",
        header: "Last Order",
        cell: ({ row }) => (
          <div className="tabular-nums text-sm">
            {row.original.lastOrderDate}
          </div>
        ),
      },
      {
        accessorKey: "daysSinceLastOrder",
        header: "Days Quiet",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {row.original.daysSinceLastOrder}
          </div>
        ),
      },
      {
        accessorKey: "prevYearRevenue",
        header: "Last-Year Revenue",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.prevYearRevenue, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "riskLevel",
        header: "Risk",
        cell: ({ row }) => {
          const lvl = row.original.riskLevel
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                RISK_STYLE[lvl],
              )}
            >
              {RISK_LABEL[lvl]}
            </span>
          )
        },
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="Churn-Risk Candidates"
      description="Accounts with no recent orders — sorted by days since last purchase"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
