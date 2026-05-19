import { ShoppingCart, Truck, JapaneseYen } from "lucide-react"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "./chart-helpers"
import type { SkuStockItem } from "@/types/inventory-replenishment-dashboard"

interface ReplenishmentRecommendationProps {
  data: SkuStockItem[]
  totalSpend: number
}

export function ReplenishmentRecommendation({
  data,
  totalSpend,
}: ReplenishmentRecommendationProps) {
  const rows = data.slice(0, 8)
  const totalQty = data.reduce((s, r) => s + r.recommendedOrderQty, 0)
  const longestLead = data.reduce(
    (m, r) => (r.lead_time_days > m ? r.lead_time_days : m),
    0,
  )

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <div>
          <DashboardCardTitle>発注推奨数量の自動計算</DashboardCardTitle>
          <DashboardCardDescription>
            (リードタイム + 安全在庫) 日数の必要在庫から現在在庫日数を引き、日販平均を掛けて算出
          </DashboardCardDescription>
        </div>
      </DashboardCardHeader>
      <DashboardCardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3">
            <ShoppingCart className="size-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">推奨発注件数</div>
              <div className="text-xl font-bold tabular-nums">{data.length} 件</div>
              <div className="text-xs text-muted-foreground">
                合計 {totalQty.toLocaleString("ja-JP")} 個
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3">
            <JapaneseYen className="size-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">発注金額合計</div>
              <div className="text-xl font-bold tabular-nums">
                {formatCurrency(totalSpend, { short: true })}
              </div>
              <div className="text-xs text-muted-foreground">仕入単価ベース</div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3">
            <Truck className="size-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">最長リードタイム</div>
              <div className="text-xl font-bold tabular-nums">{longestLead} 日</div>
              <div className="text-xs text-muted-foreground">納品ウィンドウ</div>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">推奨発注数</TableHead>
              <TableHead className="text-right">仕入単価</TableHead>
              <TableHead className="text-right">小計</TableHead>
              <TableHead className="text-right">リードタイム</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.sku}>
                <TableCell>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.sku}</div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.recommendedOrderQty.toLocaleString("ja-JP")}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatCurrency(r.unitCost)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(r.recommendedOrderQty * r.unitCost)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {r.lead_time_days} 日
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length > rows.length && (
          <p className="text-xs text-muted-foreground">
            緊急度順の上位 {rows.length} 件 (全 {data.length} 件) を表示。
          </p>
        )}
      </DashboardCardContent>
    </DashboardCard>
  )
}
