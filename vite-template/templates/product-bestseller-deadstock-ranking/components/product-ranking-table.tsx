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
  { label: "Top 10 Bestsellers", value: "top" },
  { label: "Bottom 10 (Deadstock)", value: "bottom" },
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
      : data
          .slice(-10)
          .slice()
          .reverse()

  return (
    <DashboardCardPreset
      title="Product Sales Ranking"
      description="Top performers and slow movers with period-over-period comparison"
      actions={
        <SegmentedControl
          size="sm"
          options={viewOptions}
          value={view}
          onChange={(v) => setView(v as "top" | "bottom")}
          ariaLabel="Ranking view"
        />
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Units Sold</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Turnover</TableHead>
            <TableHead className="text-right">vs Prev</TableHead>
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
                  {row.unitsSold.toLocaleString("en-US")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.stockQty.toLocaleString("en-US")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.turnoverRate.toFixed(2)}×
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
