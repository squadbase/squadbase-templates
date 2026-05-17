import type { EChartsOption } from "echarts"
import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { EChart } from "@/components/data/echart"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getBaseGrid, formatCurrency, formatNumber } from "./chart-helpers"
import type { ChannelStat } from "@/types/lead-funnel"

interface ChannelAcquisitionProps {
  data: ChannelStat[]
}

export function ChannelAcquisition({ data }: ChannelAcquisitionProps) {
  const sorted = [...data].sort((a, b) => b.leads - a.leads)
  const sources = sorted.map((c) => c.source)
  const overallAvgCpl =
    sorted.reduce((s, c) => s + c.spend, 0) /
    Math.max(
      sorted.reduce((s, c) => s + c.leads, 0),
      1,
    )

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const c = sorted[idx]
        return [
          `<strong>${c.source}</strong>`,
          `リード: ${formatNumber(c.leads)}`,
          `MQL: ${formatNumber(c.mqls)} / SQL: ${formatNumber(c.sqls)}`,
          `投下費用: ${formatCurrency(c.spend, { short: true })}`,
          `CPL: ¥${c.cpl.toLocaleString("ja-JP")}`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: sources,
      axisLabel: { interval: 0, rotate: sources.length > 5 ? 25 : 0 },
    },
    yAxis: [
      {
        type: "value",
        name: "リード数",
        position: "left",
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "CPL (¥)",
        position: "right",
        axisLabel: { formatter: (v: number) => `¥${formatNumber(v)}` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "リード数",
        type: "bar",
        barMaxWidth: 32,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        data: sorted.map((c) => c.leads),
      },
      {
        name: "CPL",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.5 },
        data: sorted.map((c) => c.cpl),
      },
    ],
  }

  const columns = useMemo<ColumnDef<ChannelStat>[]>(
    () => [
      {
        accessorKey: "source",
        header: "チャネル",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.source}</span>
        ),
      },
      {
        accessorKey: "leads",
        header: "リード数",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.leads.toLocaleString("ja-JP")}
          </div>
        ),
      },
      {
        accessorKey: "mqls",
        header: "MQL",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {row.original.mqls.toLocaleString("ja-JP")}
          </div>
        ),
      },
      {
        accessorKey: "appointments",
        header: "アポ",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.appointments.toLocaleString("ja-JP")}
          </div>
        ),
      },
      {
        accessorKey: "spend",
        header: "投下費用",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.spend, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "cpl",
        header: "CPL",
        cell: ({ row }) => {
          const v = row.original.cpl
          const aboveAvg = v > overallAvgCpl * 1.15
          const belowAvg = v < overallAvgCpl * 0.85
          return (
            <div className="text-right">
              <Badge
                variant="outline"
                className={cn(
                  "tabular-nums",
                  aboveAvg &&
                    "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                  belowAvg &&
                    "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                )}
              >
                ¥{v.toLocaleString("ja-JP")}
              </Badge>
            </div>
          )
        },
      },
    ],
    [overallAvgCpl],
  )

  return (
    <DashboardCardPreset
      title="獲得チャネル別 件数とCPL"
      description="チャネルごとのリード獲得数とCPLの推移。CPLが平均から±15%以上乖離している場合は色付きバッジで強調されます。"
    >
      <div className="space-y-4">
        <EChart option={option} height="300px" />
        <DataTablePreset columns={columns} data={sorted} enableSorting />
      </div>
    </DashboardCardPreset>
  )
}
