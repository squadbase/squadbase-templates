import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { formatDuration, formatPercent } from "./chart-helpers"
import type { ContentRankingItem, ArticleCategory } from "@/types/web-seo"

const categoryColors: Record<ArticleCategory, string> = {
  技術: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  マーケティング: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  プロダクト: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  ニュース: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  事例紹介: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
}

interface ContentRankingTableProps {
  data: ContentRankingItem[]
}

export function ContentRankingTable({ data }: ContentRankingTableProps) {
  const columns = useMemo<ColumnDef<ContentRankingItem>[]>(
    () => [
      {
        accessorKey: "rank",
        header: "#",
        cell: ({ row }) => (
          <div className="text-center font-medium tabular-nums w-8">
            {row.original.rank}
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "タイトル",
        cell: ({ row }) => (
          <div className="max-w-[260px] truncate font-medium">
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "カテゴリ",
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className={categoryColors[row.original.category]}
          >
            {row.original.category}
          </Badge>
        ),
      },
      {
        accessorKey: "pageviews",
        header: "PV",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.pageviews.toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "avgTimeOnPage",
        header: "平均滞在時間",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatDuration(row.original.avgTimeOnPage)}
          </div>
        ),
      },
      {
        accessorKey: "scrollDepth",
        header: "スクロール深度",
        cell: ({ row }) => {
          const depth = row.original.scrollDepth
          return (
            <div className="flex items-center gap-2">
              <div className="h-2 w-16 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-chart-1"
                  style={{ width: `${depth}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {depth}%
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "conversionContribution",
        header: "CV貢献度",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatPercent(row.original.conversionContribution)}
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset title="コンテンツランキング">
      <DataTablePreset
        columns={columns}
        data={data}
        enableSorting
        enablePagination
      />
    </DashboardCardPreset>
  )
}
