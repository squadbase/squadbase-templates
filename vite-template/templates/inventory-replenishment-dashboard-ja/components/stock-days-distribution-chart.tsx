import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid } from "./chart-helpers"
import type {
  StockDaysBucket,
  StockTier,
} from "@/types/inventory-replenishment-dashboard"

interface StockDaysDistributionChartProps {
  data: StockDaysBucket[]
}

const TIER_TONE: Record<StockTier, number> = {
  stockout: 0,
  critical: 1,
  low: 2,
  healthy: 3,
  excess: 4,
}

export function StockDaysDistributionChart({
  data,
}: StockDaysDistributionChartProps) {
  const palette = [
    useEChartsContrastColor("--destructive"),
    useEChartsContrastColor("--chart-5"),
    useEChartsContrastColor("--chart-4"),
    useEChartsContrastColor("--chart-2"),
    useEChartsContrastColor("--chart-3"),
  ]

  const bars = data.map((d) => ({
    value: d.skuCount,
    itemStyle: {
      color: palette[TIER_TONE[d.tier]]
        ? withAlpha(palette[TIER_TONE[d.tier]] as string, 0.85)
        : undefined,
      borderRadius: [4, 4, 0, 0] as [number, number, number, number],
    },
  }))

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v) => `${v} SKU`,
    },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.bucket),
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      axisLabel: { formatter: (v: number) => String(v) },
    },
    series: [
      {
        name: "SKU 数",
        type: "bar",
        data: bars,
        barMaxWidth: 48,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="在庫日数の分布"
      description="在庫日数バケット別の SKU 数 — 低位や過剰帯への偏在で在庫バランスを点検"
    >
      <EChart option={option} height="280px" />
    </DashboardCardPreset>
  )
}
