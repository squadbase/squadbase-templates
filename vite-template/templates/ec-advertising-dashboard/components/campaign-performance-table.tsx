import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency, formatPercent } from "./chart-helpers"
import type { CampaignPerformanceRow } from "@/types/ec-advertising-dashboard"

interface CampaignPerformanceTableProps {
  data: CampaignPerformanceRow[]
}

function acosBadgeClass(acos: number, avg: number): string {
  // Lower ACoS is better
  if (acos <= avg * 0.85)
    return "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  if (acos >= avg * 1.15)
    return "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300"
  return "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
}

export function CampaignPerformanceTable({
  data,
}: CampaignPerformanceTableProps) {
  const avgAcos = useMemo(
    () => data.reduce((s, r) => s + r.acos, 0) / Math.max(1, data.length),
    [data],
  )

  const columns = useMemo<ColumnDef<CampaignPerformanceRow>[]>(
    () => [
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
        accessorKey: "marketplaceLabel",
        header: "Marketplace",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium">
            {row.original.marketplaceLabel}
          </Badge>
        ),
      },
      {
        accessorKey: "spend",
        header: "Spend",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.spend, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "adRevenue",
        header: "Ad Revenue",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.original.adRevenue, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "acos",
        header: "ACoS",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold tabular-nums",
                acosBadgeClass(row.original.acos, avgAcos),
              )}
            >
              {formatPercent(row.original.acos)}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "tacos",
        header: "TACoS",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {formatPercent(row.original.tacos)}
          </div>
        ),
      },
      {
        accessorKey: "conversions",
        header: "Conversions",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.conversions.toLocaleString("en-US")}
          </div>
        ),
      },
      {
        accessorKey: "cvr",
        header: "Ad CVR",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {formatPercent(row.original.cvr, 2)}
          </div>
        ),
      },
    ],
    [avgAcos],
  )

  return (
    <DashboardCardPreset
      title="Campaign ACoS / TACoS Comparison"
      description="Campaign-level efficiency ranked by ACoS, with under- and over-performers flagged"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
