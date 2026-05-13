import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatSignedPercent } from "./chart-helpers"
import type {
  AtRiskCustomer,
  RiskTier,
  Segment,
} from "@/types/churn-prediction-monitor"

interface AtRiskCustomerTableProps {
  data: AtRiskCustomer[]
}

const TIER_LABELS: Record<RiskTier, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
}

const SEGMENT_LABELS: Record<Segment, string> = {
  enterprise: "Enterprise",
  mid: "Mid-market",
  smb: "SMB",
}

function tierBadgeClass(tier: RiskTier): string {
  switch (tier) {
    case "critical":
      return "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300"
    case "high":
      return "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "medium":
      return "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300"
    case "low":
      return "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
}

export function AtRiskCustomerTable({ data }: AtRiskCustomerTableProps) {
  const columns = useMemo<ColumnDef<AtRiskCustomer>[]>(
    () => [
      {
        accessorKey: "risk_score",
        header: "Score",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {row.original.risk_score}
          </div>
        ),
      },
      {
        accessorKey: "risk_tier",
        header: "Tier",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold",
              tierBadgeClass(row.original.risk_tier),
            )}
          >
            {TIER_LABELS[row.original.risk_tier]}
          </Badge>
        ),
      },
      {
        accessorKey: "customer_name",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.customer_name}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.customer_id}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "segment",
        header: "Segment",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {SEGMENT_LABELS[row.original.segment]}
          </span>
        ),
      },
      {
        accessorKey: "days_since_last_order",
        header: "Days Since Last Order",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.days_since_last_order}
          </div>
        ),
      },
      {
        accessorKey: "order_freq",
        header: "Order Freq (90d)",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.order_freq.toFixed(1)}
          </div>
        ),
      },
      {
        accessorKey: "freq_delta_pct",
        header: "Freq Δ",
        cell: ({ row }) => {
          const v = row.original.freq_delta_pct
          const cls =
            v < -10
              ? "text-rose-600 dark:text-rose-400"
              : v < 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400"
          return (
            <div className={cn("text-right font-medium tabular-nums", cls)}>
              {formatSignedPercent(v)}
            </div>
          )
        },
      },
      {
        accessorKey: "support_tickets",
        header: "Support Tickets",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {row.original.support_tickets}
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="At-Risk Customers by Score"
      description="Ranked by churn-risk score — focus CS effort on Critical and High tiers first"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
