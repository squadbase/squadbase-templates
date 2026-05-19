import { DashboardCardPreset } from "@/components/common/dashboard-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "./chart-helpers"
import type { ChannelDiscountRow } from "@/types/discount-margin-erosion-analysis"

interface ChannelDiscountRankingProps {
  data: ChannelDiscountRow[]
}

export function ChannelDiscountRanking({ data }: ChannelDiscountRankingProps) {
  const maxAvg = Math.max(...data.map((r) => r.averageDiscountRate))

  return (
    <DashboardCardPreset
      title="Channel Discount Ranking"
      description="Average discount and list-price share per channel"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead className="text-right">Discount $</TableHead>
            <TableHead>Avg Disc %</TableHead>
            <TableHead className="text-right">List-Price Share</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const widthPct = (row.averageDiscountRate / maxAvg) * 100
            return (
              <TableRow key={row.channel}>
                <TableCell className="text-muted-foreground tabular-nums">
                  {row.rank}
                </TableCell>
                <TableCell className="font-medium">{row.channel}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(row.totalDiscountAmount, { short: true })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="w-12 tabular-nums text-sm">
                      {row.averageDiscountRate.toFixed(1)}%
                    </span>
                    <div className="h-2 flex-1 max-w-[120px] rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-chart-4"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.listPriceShare.toFixed(1)}%
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </DashboardCardPreset>
  )
}
