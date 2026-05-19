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
import { formatCurrency } from "./chart-helpers"
import type { CustomerDiscountRow } from "@/types/discount-margin-erosion-analysis"

interface CustomerDiscountRankingProps {
  data: CustomerDiscountRow[]
}

export function CustomerDiscountRanking({ data }: CustomerDiscountRankingProps) {
  return (
    <DashboardCardPreset
      title="顧客別 値引き額ランキング (Top 10)"
      description="値引き額を最も多く吸収している顧客"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>顧客</TableHead>
            <TableHead>チャネル</TableHead>
            <TableHead className="text-right">売上</TableHead>
            <TableHead className="text-right">値引き額</TableHead>
            <TableHead className="text-right">平均値引き率</TableHead>
            <TableHead className="text-right">粗利インパクト</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.customerId}>
              <TableCell className="text-muted-foreground tabular-nums">
                {row.rank}
              </TableCell>
              <TableCell>
                <div className="font-medium">{row.customerName}</div>
                <div className="text-xs text-muted-foreground">
                  {row.customerId}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{row.channel}</Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(row.totalRevenue, { short: true })}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(row.totalDiscountAmount, { short: true })}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.averageDiscountRate.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right tabular-nums text-destructive">
                -{formatCurrency(row.marginImpact, { short: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCardPreset>
  )
}
