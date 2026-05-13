import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatPercent } from "./chart-helpers"
import type { AttributeLtvRow } from "@/types/member-attribute-dashboard"

interface AttributeLtvRankingProps {
  data: AttributeLtvRow[]
}

export function AttributeLtvRanking({ data }: AttributeLtvRankingProps) {
  const columns = useMemo<ColumnDef<AttributeLtvRow>[]>(
    () => [
      {
        accessorKey: "rank",
        header: "#",
        cell: ({ row }) => (
          <div className="w-6 text-center font-medium tabular-nums">
            {row.original.rank}
          </div>
        ),
      },
      {
        accessorKey: "segment",
        header: "Segment",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.segment}</div>
        ),
      },
      {
        accessorKey: "memberCount",
        header: "Members",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.memberCount.toLocaleString("en-US")}
          </div>
        ),
      },
      {
        accessorKey: "share",
        header: "Share",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {formatPercent(row.original.share)}
          </div>
        ),
      },
      {
        accessorKey: "avgLtv",
        header: "Avg LTV",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.original.avgLtv)}
          </div>
        ),
      },
      {
        accessorKey: "purchaseRate",
        header: "Purchase Rate",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Badge variant="secondary" className="font-medium tabular-nums">
              {formatPercent(row.original.purchaseRate)}
            </Badge>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="Attribute LTV Ranking"
      description="Age x gender segments ranked by average lifetime value"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
