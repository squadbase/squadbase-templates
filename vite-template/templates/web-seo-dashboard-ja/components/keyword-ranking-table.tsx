import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { RankChangeBadge } from "./rank-change-badge"
import { formatNumber, formatPercent } from "./chart-helpers"
import type { KeywordRankingDisplay } from "@/types/web-seo"

interface KeywordRankingTableProps {
  data: KeywordRankingDisplay[]
}

export function KeywordRankingTable({ data }: KeywordRankingTableProps) {
  const columns = useMemo<ColumnDef<KeywordRankingDisplay>[]>(
    () => [
      {
        accessorKey: "keyword",
        header: "キーワード",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate font-medium">
            {row.original.keyword}
          </div>
        ),
      },
      {
        accessorKey: "rank",
        header: "順位",
        cell: ({ row }) => (
          <div className="text-center font-medium tabular-nums">
            {row.original.rank}
          </div>
        ),
      },
      {
        accessorKey: "rankChange",
        header: "変動",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <RankChangeBadge change={row.original.rankChange} />
          </div>
        ),
      },
      {
        accessorKey: "ctr",
        header: "CTR",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatPercent(row.original.ctr)}
          </div>
        ),
      },
      {
        accessorKey: "impressions",
        header: "表示回数",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatNumber(row.original.impressions)}
          </div>
        ),
      },
      {
        accessorKey: "clicks",
        header: "クリック数",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatNumber(row.original.clicks)}
          </div>
        ),
      },
      {
        accessorKey: "searchVolume",
        header: "検索ボリューム",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatNumber(row.original.searchVolume)}
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset title="キーワードランキング">
      <DataTablePreset
        columns={columns}
        data={data}
        enableSorting
        enablePagination
      />
    </DashboardCardPreset>
  )
}
