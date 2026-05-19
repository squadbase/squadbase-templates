import { ArrowUp, ArrowDown, Minus } from "lucide-react"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatPercentagePoints } from "./chart-helpers"
import type { CategoryMarginRow } from "@/types/gross-margin-monitoring"

interface CategoryMarginRankingProps {
  data: CategoryMarginRow[]
}

export function CategoryMarginRanking({ data }: CategoryMarginRankingProps) {
  const maxMargin = Math.max(...data.map((r) => r.marginPct))

  return (
    <DashboardCardPreset
      title="カテゴリ別 粗利率ランキング"
      description="直近月の粗利率を高い順に並べたランキング"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>カテゴリ</TableHead>
            <TableHead className="text-right">売上</TableHead>
            <TableHead className="text-right">粗利額</TableHead>
            <TableHead>粗利率</TableHead>
            <TableHead className="text-right">前月比</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const widthPct = (row.marginPct / maxMargin) * 100
            const TrendIcon =
              row.vsPrevMonth > 0
                ? ArrowUp
                : row.vsPrevMonth < 0
                  ? ArrowDown
                  : Minus
            const trendClass =
              row.vsPrevMonth > 0
                ? "text-chart-2"
                : row.vsPrevMonth < 0
                  ? "text-destructive"
                  : "text-muted-foreground"
            return (
              <TableRow key={row.category}>
                <TableCell className="text-muted-foreground tabular-nums">
                  {row.rank}
                </TableCell>
                <TableCell className="font-medium">{row.category}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(row.revenue, { short: true })}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(row.grossProfit, { short: true })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="w-12 tabular-nums text-sm">
                      {row.marginPct.toFixed(1)}%
                    </span>
                    <div className="h-2 flex-1 max-w-[160px] rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-chart-1"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell
                  className={`text-right tabular-nums text-sm ${trendClass}`}
                >
                  <span className="inline-flex items-center gap-1">
                    <TrendIcon className="size-3" />
                    {formatPercentagePoints(row.vsPrevMonth)}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </DashboardCardPreset>
  )
}
