import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid } from "./chart-helpers"
import type { DeviceCvrPoint } from "@/types/ec-conversion-funnel"

interface DeviceCvrChartProps {
  data: DeviceCvrPoint[]
}

const DEVICE_LABELS: Record<string, string> = {
  desktop: "デスクトップ",
  mobile: "モバイル",
  tablet: "タブレット",
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
          `セッション: ${point.sessions.toLocaleString("ja-JP")}`,
          `閲覧率: ${point.viewRate.toFixed(1)}%`,
          `カート率: ${point.cartRate.toFixed(1)}%`,
          `購入率: ${point.purchaseRate.toFixed(1)}%`,
          `総合CVR: ${point.overallCvr.toFixed(2)}%`,
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
        name: "閲覧率",
        type: "bar",
        barMaxWidth: 32,
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: data.map((d) => d.viewRate),
      },
      {
        name: "カート率",
        type: "bar",
        barMaxWidth: 32,
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: data.map((d) => d.cartRate),
      },
      {
        name: "購入率",
        type: "bar",
        barMaxWidth: 32,
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        data: data.map((d) => d.purchaseRate),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="デバイス別CVR比較"
      description="デバイスごとの各ステージ転換率"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
