import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  formatCurrency,
  formatPercent,
  formatRoas,
  formatSignedPercent,
} from "./chart-helpers"
import type { CampaignRoasRow } from "@/types/campaign-performance-analysis"

interface CampaignRoasRankingProps {
  data: CampaignRoasRow[]
}

export function CampaignRoasRanking({ data }: CampaignRoasRankingProps) {
  const maxRoas = useMemo(
    () => data.reduce((m, r) => (r.roas > m ? r.roas : m), 0),
    [data],
  )

  const columns = useMemo<ColumnDef<CampaignRoasRow>[]>(
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
        header: "キャンペーン",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.campaignName}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.campaignId}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "channel",
        header: "チャネル",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium">
            {row.original.channel}
          </Badge>
        ),
      },
      {
        accessorKey: "roas",
        header: "ROAS",
        cell: ({ row }) => {
          const r = row.original.roas
          return (
            <div className="flex items-center gap-2">
              <div className="h-2 w-16 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-chart-1"
                  style={{
                    width: `${Math.min((r / maxRoas) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className="font-semibold tabular-nums">
                {formatRoas(r)}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "spend",
        header: "支出",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.spend, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "revenue",
        header: "売上",
        cell: ({ row }) => (
          <div className="text-right font-medium tabular-nums">
            {formatCurrency(row.original.revenue, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "cpa",
        header: "CPA",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.cpa)}
          </div>
        ),
      },
      {
        accessorKey: "cvr",
        header: "CVR",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatPercent(row.original.cvr)}
          </div>
        ),
      },
      {
        accessorKey: "roasDelta",
        header: "前期比",
        cell: ({ row }) => {
          const delta = row.original.roasDelta
          return (
            <div
              className={cn(
                "text-right font-medium tabular-nums",
                delta > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : delta < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground",
              )}
            >
              {formatSignedPercent(delta)}
            </div>
          )
        },
      },
    ],
    [maxRoas],
  )

  return (
    <DashboardCardPreset
      title="キャンペーン別 ROAS ランキング"
      description="期間集計の ROAS でキャンペーンをランキング表示"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
