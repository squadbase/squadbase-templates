import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  formatCurrency,
  formatCurrencyDecimal,
  formatNumber,
  formatSignedPercent,
} from "./chart-helpers"
import type { CampaignRoiRow } from "@/types/campaign-effectiveness-test"

interface RoiRankingTableProps {
  data: CampaignRoiRow[]
}

const CONFIDENCE_BADGE: Record<CampaignRoiRow["confidence"], string> = {
  high: "border-emerald-500 text-emerald-700 bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/40",
  medium:
    "border-amber-500 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-950/40",
  low: "border-red-500 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-950/40",
}

const CONFIDENCE_LABEL: Record<CampaignRoiRow["confidence"], string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

export function RoiRankingTable({ data }: RoiRankingTableProps) {
  const maxRoi = useMemo(
    () => data.reduce((m, r) => (r.roi > m ? r.roi : m), 0),
    [data],
  )

  const columns = useMemo<ColumnDef<CampaignRoiRow>[]>(
    () => [
      {
        id: "rank",
        header: "#",
        cell: ({ row }) => (
          <div className="w-6 text-center font-medium tabular-nums">
            {row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "campaignName",
        header: "Campaign",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">
              {row.original.campaignName}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.original.campaignId}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "channel",
        header: "Channel",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium">
            {row.original.channel}
          </Badge>
        ),
      },
      {
        accessorKey: "testCustomers",
        header: "Test / Control",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            <div>{formatNumber(row.original.testCustomers)}</div>
            <div className="text-xs text-muted-foreground">
              {formatNumber(row.original.controlCustomers)}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "incrementalArpu",
        header: "Lift / customer",
        cell: ({ row }) => (
          <div className="text-right font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
            +{formatCurrencyDecimal(row.original.incrementalArpu)}
          </div>
        ),
      },
      {
        accessorKey: "incrementalRevenue",
        header: "Incremental",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.incrementalRevenue, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "cost",
        header: "Cost",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.cost, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "roi",
        header: "ROI",
        cell: ({ row }) => {
          const r = row.original.roi
          const widthPct = Math.min(100, Math.max(0, (r / maxRoi) * 100))
          return (
            <div className="flex items-center gap-2">
              <div className="h-2 w-16 rounded-full bg-muted">
                <div
                  className={cn(
                    "h-2 rounded-full",
                    r >= 0 ? "bg-chart-1" : "bg-red-500",
                  )}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  r >= 0
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {formatSignedPercent(r, 0)}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "confidence",
        header: "Confidence",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(CONFIDENCE_BADGE[row.original.confidence])}
          >
            {CONFIDENCE_LABEL[row.original.confidence]}
          </Badge>
        ),
      },
    ],
    [maxRoi],
  )

  return (
    <DashboardCardPreset
      title="Campaign ROI Ranking"
      description="Campaigns ranked by ROI on incremental revenue, with statistical confidence bands"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
