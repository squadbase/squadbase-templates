import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatNumber } from "./chart-helpers"
import type { CampaignRow } from "@/types/ui-template-kpi-chart-advanced"

interface CampaignTableProps {
  data: CampaignRow[]
}

export function CampaignTable({ data }: CampaignTableProps) {
  const columns = useMemo<ColumnDef<CampaignRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Campaign",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "channel",
        header: "Channel",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs font-medium">
            {row.original.channel}
          </Badge>
        ),
      },
      {
        accessorKey: "spend",
        header: "Spend",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.spend, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "conversions",
        header: "Conversions",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {formatNumber(row.original.conversions)}
          </div>
        ),
      },
      {
        accessorKey: "roi",
        header: "ROI",
        cell: ({ row }) => (
          <div className="text-right font-semibold tabular-nums">
            {row.original.roi.toFixed(2)}x
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="Campaign Performance"
      description="ROI by active campaign"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
