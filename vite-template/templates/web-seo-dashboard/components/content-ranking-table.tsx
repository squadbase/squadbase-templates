import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { formatDuration, formatPercent } from "./chart-helpers"
import type { ContentRankingItem, ArticleCategory } from "@/types/web-seo"

const categoryColors: Record<ArticleCategory, string> = {
  Technology: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  Marketing: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  Product: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  News: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  "Case Studies": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
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
        header: "Title",
        cell: ({ row }) => (
          <div className="max-w-[260px] truncate font-medium">
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
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
        header: "Pageviews",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.pageviews.toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "avgTimeOnPage",
        header: "Avg. Time on Page",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatDuration(row.original.avgTimeOnPage)}
          </div>
        ),
      },
      {
        accessorKey: "scrollDepth",
        header: "Scroll Depth",
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
        header: "CV Contribution",
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
    <DashboardCardPreset title="Top Content">
      <DataTablePreset
        columns={columns}
        data={data}
        enableSorting
        enablePagination
      />
    </DashboardCardPreset>
  )
}
