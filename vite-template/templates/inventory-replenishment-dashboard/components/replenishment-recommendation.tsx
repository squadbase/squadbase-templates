import { ShoppingCart, Truck, DollarSign } from "lucide-react"
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
          <DashboardCardTitle>Auto-Replenishment Recommendation</DashboardCardTitle>
          <DashboardCardDescription>
            Computed from (lead time + safety) days of cover minus current stock
            days, multiplied by daily sales average
          </DashboardCardDescription>
        </div>
      </DashboardCardHeader>
      <DashboardCardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3">
            <ShoppingCart className="size-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Suggested POs</div>
              <div className="text-xl font-bold tabular-nums">{data.length}</div>
              <div className="text-xs text-muted-foreground">
                {totalQty.toLocaleString("en-US")} units total
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3">
            <DollarSign className="size-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Total spend</div>
              <div className="text-xl font-bold tabular-nums">
                {formatCurrency(totalSpend, { short: true })}
              </div>
              <div className="text-xs text-muted-foreground">at unit cost</div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3">
            <Truck className="size-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Longest lead</div>
              <div className="text-xl font-bold tabular-nums">{longestLead} d</div>
              <div className="text-xs text-muted-foreground">delivery window</div>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Recommended Qty</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Lead</TableHead>
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
                  {r.recommendedOrderQty.toLocaleString("en-US")}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatCurrency(r.unitCost)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(r.recommendedOrderQty * r.unitCost)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {r.lead_time_days} d
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length > rows.length && (
          <p className="text-xs text-muted-foreground">
            Showing top {rows.length} of {data.length} suggested orders by urgency.
          </p>
        )}
      </DashboardCardContent>
    </DashboardCard>
  )
}
