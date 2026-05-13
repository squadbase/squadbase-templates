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
        header: "セグメント",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.segment}</div>
        ),
      },
      {
        accessorKey: "memberCount",
        header: "会員数",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.memberCount.toLocaleString("ja-JP")}
          </div>
        ),
      },
      {
        accessorKey: "share",
        header: "構成比",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {formatPercent(row.original.share)}
          </div>
        ),
      },
      {
        accessorKey: "avgLtv",
        header: "平均 LTV",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {formatCurrency(row.original.avgLtv)}
          </div>
        ),
      },
      {
        accessorKey: "purchaseRate",
        header: "購入率",
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
      title="属性別 LTV ランキング"
      description="年代 × 性別セグメントを平均 LTV で並び替え"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
