import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatPercent } from "./chart-helpers"
import type { KeywordRankingRow } from "@/types/ec-advertising-dashboard"

interface KeywordRankingTableProps {
  data: KeywordRankingRow[]
}

export function KeywordRankingTable({ data }: KeywordRankingTableProps) {
  const maxConversions = useMemo(
    () => data.reduce((m, r) => (r.conversions > m ? r.conversions : m), 0),
    [data],
  )

  const columns = useMemo<ColumnDef<KeywordRankingRow>[]>(
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
        accessorKey: "keyword",
        header: "Keyword",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.keyword}</div>
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
        accessorKey: "conversions",
        header: "Conversions",
        cell: ({ row }) => {
          const c = row.original.conversions
          return (
            <div className="flex items-center gap-2">
              <div className="h-2 w-16 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-chart-1"
                  style={{
                    width: `${Math.min((c / Math.max(1, maxConversions)) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className="font-semibold tabular-nums">
                {c.toLocaleString("en-US")}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "cvr",
        header: "CVR",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatPercent(row.original.cvr, 2)}
          </div>
        ),
      },
      {
        accessorKey: "cpc",
        header: "CPC",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.cpc)}
          </div>
        ),
      },
      {
        accessorKey: "cpa",
        header: "CPA",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {formatCurrency(row.original.cpa)}
          </div>
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
    ],
    [maxConversions],
  )

  return (
    <DashboardCardPreset
      title="Top Keywords by Conversions"
      description="Keyword-level performance ranked by conversion volume, with CPC and CVR context"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
