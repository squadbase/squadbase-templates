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
        header: "Campaign",
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
        header: "Coupon",
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
        header: "Distributed",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatNumber(row.original.distributed)}
          </div>
        ),
      },
      {
        accessorKey: "redeemed",
        header: "Redeemed",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatNumber(row.original.redeemed)}
          </div>
        ),
      },
      {
        accessorKey: "redemptionRate",
        header: "Redemption rate",
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
        header: "AOV",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrencyDecimal(row.original.avgOrderValue)}
          </div>
        ),
      },
      {
        accessorKey: "netRevenue",
        header: "Net revenue",
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
      title="Coupon Redemption"
      description="How each campaign's coupon is performing — redemption rate, average order value, and net revenue after discount"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
