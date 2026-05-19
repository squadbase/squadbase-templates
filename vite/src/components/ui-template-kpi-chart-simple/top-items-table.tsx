import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardContent,
  DashboardCardTitle,
} from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatPercent } from "./chart-helpers"
import type { TopItemRow } from "@/types/ui-template-kpi-chart-simple"

const TIER_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Enterprise: "default",
  Business: "secondary",
  Growth: "outline",
  SMB: "outline",
  "Self-serve": "outline",
}

function churnColor(rate: number): string {
  if (rate >= 7) return "text-rose-500 font-semibold"
  if (rate >= 4) return "text-amber-500 font-medium"
  return "text-emerald-500"
}

interface TopItemsTableProps {
  data: TopItemRow[]
}

export function TopItemsTable({ data }: TopItemsTableProps) {
  const columns = useMemo<ColumnDef<TopItemRow>[]>(
    () => [
      {
        accessorKey: "plan",
        header: "プラン名",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.plan}</span>
        ),
      },
      {
        accessorKey: "tier",
        header: "Tier",
        cell: ({ row }) => (
          <Badge variant={TIER_VARIANT[row.original.tier] ?? "outline"}>
            {row.original.tier}
          </Badge>
        ),
      },
      {
        accessorKey: "mrr",
        header: () => <div className="text-right">MRR</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-sm">
            {formatCurrency(row.original.mrr, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "seats",
        header: () => <div className="text-right">シート数</div>,
        cell: ({ row }) => (
          <div className="text-right text-sm">
            {row.original.seats.toLocaleString("ja-JP")}
          </div>
        ),
      },
      {
        accessorKey: "churnRate",
        header: () => <div className="text-right">解約率</div>,
        cell: ({ row }) => (
          <div className={`text-right text-sm ${churnColor(row.original.churnRate)}`}>
            {formatPercent(row.original.churnRate)}
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <div>
          <DashboardCardTitle>プラン別 MRR・解約率</DashboardCardTitle>
          <p className="mt-0.5 text-sm text-muted-foreground">
            MRR 上位プランの収益貢献と解約リスクの一覧
          </p>
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        <DataTablePreset columns={columns} data={data} enableSorting />
      </DashboardCardContent>
    </DashboardCard>
  )
}
