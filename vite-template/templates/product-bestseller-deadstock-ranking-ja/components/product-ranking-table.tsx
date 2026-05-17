import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { SegmentedControl } from "@/components/common/segmented-control"
import { formatCurrency } from "./chart-helpers"
import type { ProductRankingItem } from "@/types/product-bestseller-deadstock-ranking"

interface ProductRankingTableProps {
  data: ProductRankingItem[]
}

const viewOptions = [
  { label: "Top 10 (売れ筋)", value: "top" },
  { label: "Bottom 10 (死に筋)", value: "bottom" },
]

const abcVariant: Record<string, "default" | "secondary" | "outline"> = {
  A: "default",
  B: "secondary",
  C: "outline",
}

export function ProductRankingTable({ data }: ProductRankingTableProps) {
  const [view, setView] = useState<"top" | "bottom">("top")
  const rows =
    view === "top"
      ? data.slice(0, 10)
      : data.slice(-10).slice().reverse()

  return (
    <DashboardCardPreset
      title="商品別売上ランキング"
      description="Top/Bottom 商品の前期間比較。在庫回転と ABC 区分も併記"
      actions={
        <SegmentedControl
          size="sm"
          options={viewOptions}
          value={view}
          onChange={(v) => setView(v as "top" | "bottom")}
          ariaLabel="ランキング表示切替"
        />
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>商品</TableHead>
            <TableHead>カテゴリ</TableHead>
            <TableHead className="text-right">売上</TableHead>
            <TableHead className="text-right">販売数</TableHead>
            <TableHead className="text-right">在庫</TableHead>
            <TableHead className="text-right">回転率</TableHead>
            <TableHead className="text-right">前期比</TableHead>
            <TableHead>ABC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const TrendIcon =
              row.yoyChange > 0
                ? ArrowUp
                : row.yoyChange < 0
                  ? ArrowDown
                  : Minus
            const trendClass =
              row.yoyChange > 0
                ? "text-chart-2"
                : row.yoyChange < 0
                  ? "text-destructive"
                  : "text-muted-foreground"
            return (
              <TableRow key={row.productId}>
                <TableCell className="text-muted-foreground tabular-nums">
                  {row.rank}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{row.productName}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.productId}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.category}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(row.revenue, { short: true })}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.unitsSold.toLocaleString("ja-JP")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.stockQty.toLocaleString("ja-JP")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.turnoverRate.toFixed(2)}回転
                </TableCell>
                <TableCell className={`text-right tabular-nums text-sm ${trendClass}`}>
                  <span className="inline-flex items-center gap-1">
                    <TrendIcon className="size-3" />
                    {row.yoyChange >= 0 ? "+" : ""}{row.yoyChange.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={abcVariant[row.abcClass]}>{row.abcClass}</Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </DashboardCardPreset>
  )
}
