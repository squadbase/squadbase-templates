import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { useEChartsContrastColor } from "@/components/data/echart"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardContent,
  DashboardCardTitle,
} from "@/components/common/dashboard-card"
import { formatCurrency, getBaseGrid } from "./chart-helpers"
import type { TrendPoint } from "@/types/ui-template-kpi-chart-simple"

interface TrendChartProps {
  data: TrendPoint[]
}

export function TrendChart({ data }: TrendChartProps) {
  const contrastColor = useEChartsContrastColor()

  const axisStyle = {
    axisLine: { lineStyle: { color: contrastColor } },
    axisLabel: { color: contrastColor },
    splitLine: { lineStyle: { color: contrastColor, opacity: 0.15 } },
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v: unknown) =>
        typeof v === "number" ? formatCurrency(v, { short: true }) : String(v),
    },
    legend: {
      bottom: 0,
      textStyle: { color: contrastColor },
      data: ["MRR", "新規 MRR", "解約 MRR"],
    },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.date),
      boundaryGap: true,
      ...axisStyle,
    },
    yAxis: [
      {
        type: "value",
        name: "MRR (USD)",
        nameTextStyle: { color: contrastColor },
        axisLabel: {
          color: contrastColor,
          formatter: (v: number) => formatCurrency(v, { short: true }),
        },
        splitLine: { lineStyle: { color: contrastColor, opacity: 0.15 } },
      },
      {
        type: "value",
        name: "変動 MRR",
        nameTextStyle: { color: contrastColor },
        axisLabel: {
          color: contrastColor,
          formatter: (v: number) => formatCurrency(v, { short: true }),
        },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "MRR",
        type: "line",
        smooth: true,
        showSymbol: false,
        yAxisIndex: 0,
        data: data.map((d) => d.mrr),
        lineStyle: { width: 2.5 },
        areaStyle: { opacity: 0.12 },
        color: "#6366f1",
      },
      {
        name: "新規 MRR",
        type: "bar",
        stack: "delta",
        yAxisIndex: 1,
        data: data.map((d) => d.newMrr),
        color: "#10b981",
        barMaxWidth: 24,
      },
      {
        name: "解約 MRR",
        type: "bar",
        stack: "delta",
        yAxisIndex: 1,
        data: data.map((d) => -d.churnedMrr),
        color: "#f43f5e",
        barMaxWidth: 24,
      },
    ],
  }

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <div>
          <DashboardCardTitle>MRR トレンド</DashboardCardTitle>
          <p className="mt-0.5 text-sm text-muted-foreground">
            月次 MRR の推移と新規・解約 MRR の内訳
          </p>
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        <EChart option={option} height="340px" />
      </DashboardCardContent>
    </DashboardCard>
  )
}
