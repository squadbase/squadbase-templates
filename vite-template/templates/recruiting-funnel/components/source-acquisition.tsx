import type { EChartsOption } from "echarts"
import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { EChart } from "@/components/data/echart"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getBaseGrid, formatCurrency, formatNumber } from "./chart-helpers"
import type { SourceStat } from "@/types/recruiting-funnel"

interface SourceAcquisitionProps {
  data: SourceStat[]
}

export function SourceAcquisition({ data }: SourceAcquisitionProps) {
  // Sorted descending by application count
  const sorted = [...data].sort((a, b) => b.applications - a.applications)
  const sources = sorted.map((c) => c.source)
  const overallPassRate =
    sorted.reduce((s, c) => s + c.hires, 0) /
    Math.max(
      sorted.reduce((s, c) => s + c.applications, 0),
      1,
    ) *
    100

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
          `Applications: ${formatNumber(c.applications)}`,
          `Interviews: ${formatNumber(c.interviews)} / Offers: ${formatNumber(c.offers)}`,
          `Hires: ${formatNumber(c.hires)}`,
          `Pass rate: ${c.passRate.toFixed(1)}%`,
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
        name: "Applications",
        position: "left",
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        name: "Pass Rate (%)",
        position: "right",
        axisLabel: { formatter: (v: number) => `${v.toFixed(0)}%` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "Applications",
        type: "bar",
        barMaxWidth: 32,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        data: sorted.map((c) => c.applications),
      },
      {
        name: "Pass Rate",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.5 },
        data: sorted.map((c) => c.passRate),
      },
    ],
  }

  const columns = useMemo<ColumnDef<SourceStat>[]>(
    () => [
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.source}</span>
        ),
      },
      {
        accessorKey: "applications",
        header: "Applications",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.applications.toLocaleString("en-US")}
          </div>
        ),
      },
      {
        accessorKey: "interviews",
        header: "Interviews",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {row.original.interviews.toLocaleString("en-US")}
          </div>
        ),
      },
      {
        accessorKey: "hires",
        header: "Hires",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.hires.toLocaleString("en-US")}
          </div>
        ),
      },
      {
        accessorKey: "costPerHire",
        header: "Cost / Hire",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.costPerHire, { short: true })}
          </div>
        ),
      },
      {
        accessorKey: "passRate",
        header: "Pass Rate",
        cell: ({ row }) => {
          const v = row.original.passRate
          const aboveAvg = v > overallPassRate * 1.25
          const belowAvg = v < overallPassRate * 0.75
          return (
            <div className="text-right">
              <Badge
                variant="outline"
                className={cn(
                  "tabular-nums",
                  aboveAvg &&
                    "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                  belowAvg &&
                    "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                )}
              >
                {v.toFixed(1)}%
              </Badge>
            </div>
          )
        },
      },
    ],
    [overallPassRate],
  )

  return (
    <DashboardCardPreset
      title="Applications by Source"
      description="Application volume per source with end-to-end pass rate (Applied → Hired) overlay. Pass rate is highlighted when it deviates more than 25% from the overall average."
    >
      <div className="space-y-4">
        <EChart option={option} height="300px" />
        <DataTablePreset columns={columns} data={sorted} enableSorting />
      </div>
    </DashboardCardPreset>
  )
}
