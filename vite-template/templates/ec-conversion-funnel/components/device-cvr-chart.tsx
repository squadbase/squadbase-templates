import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid } from "./chart-helpers"
import type { DeviceCvrPoint } from "@/types/ec-conversion-funnel"

interface DeviceCvrChartProps {
  data: DeviceCvrPoint[]
}

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
}

export function DeviceCvrChart({ data }: DeviceCvrChartProps) {
  const categories = data.map((d) => DEVICE_LABELS[d.device] ?? d.device)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const point = data[idx]
        return [
          `<strong>${DEVICE_LABELS[point.device] ?? point.device}</strong>`,
          `Sessions: ${point.sessions.toLocaleString("en-US")}`,
          `View Rate: ${point.viewRate.toFixed(1)}%`,
          `Cart Rate: ${point.cartRate.toFixed(1)}%`,
          `Purchase Rate: ${point.purchaseRate.toFixed(1)}%`,
          `Overall CVR: ${point.overallCvr.toFixed(2)}%`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: categories,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (v: number) => `${v}%`,
      },
    },
    series: [
      {
        name: "View Rate",
        type: "bar",
        barMaxWidth: 32,
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: data.map((d) => d.viewRate),
      },
      {
        name: "Cart Rate",
        type: "bar",
        barMaxWidth: 32,
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: data.map((d) => d.cartRate),
      },
      {
        name: "Purchase Rate",
        type: "bar",
        barMaxWidth: 32,
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: data.map((d) => d.purchaseRate),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Device CVR Comparison"
      description="Stage-by-stage conversion rates by device"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
