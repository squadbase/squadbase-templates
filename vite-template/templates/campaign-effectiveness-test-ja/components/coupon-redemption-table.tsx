import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import {
  formatCurrency,
  formatCurrencyDecimal,
  formatNumber,
  formatPercent,
} from "./chart-helpers"
import type { CouponRedemptionRow } from "@/types/campaign-effectiveness-test"

interface CouponRedemptionTableProps {
  data: CouponRedemptionRow[]
}

export function CouponRedemptionTable({ data }: CouponRedemptionTableProps) {
  const maxRate = useMemo(
    () => data.reduce((m, r) => (r.redemptionRate > m ? r.redemptionRate : m), 0),
    [data],
  )

  const columns = useMemo<ColumnDef<CouponRedemptionRow>[]>(
    () => [
      {
        accessorKey: "campaignName",
        header: "キャンペーン",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">
              {row.original.campaignName}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.original.campaignId}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "couponCode",
        header: "クーポン",
        cell: ({ row }) => (
          <div className="space-y-1">
            <Badge variant="secondary" className="font-mono">
              {row.original.couponCode}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {row.original.discountLabel}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "distributed",
        header: "配布数",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatNumber(row.original.distributed)}
          </div>
        ),
      },
      {
        accessorKey: "redeemed",
        header: "利用数",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatNumber(row.original.redeemed)}
          </div>
        ),
      },
      {
        accessorKey: "redemptionRate",
        header: "消化率",
        cell: ({ row }) => {
          const r = row.original.redemptionRate
          const widthPct = maxRate === 0 ? 0 : Math.min(100, (r / maxRate) * 100)
          return (
            <div className="flex items-center gap-2">
              <div className="h-2 w-20 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-chart-2"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span className="font-semibold tabular-nums">
                {formatPercent(r)}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "avgOrderValue",
        header: "平均注文額",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrencyDecimal(row.original.avgOrderValue)}
          </div>
        ),
      },
      {
        accessorKey: "netRevenue",
        header: "純利益",
        cell: ({ row }) => (
          <div className="text-right font-medium tabular-nums">
            {formatCurrency(row.original.netRevenue, { short: true })}
          </div>
        ),
      },
    ],
    [maxRate],
  )

  return (
    <DashboardCardPreset
      title="クーポン消化率"
      description="キャンペーン別のクーポンパフォーマンス — 消化率・平均注文額・値引き後の純利益"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
