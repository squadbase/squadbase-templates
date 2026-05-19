import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { getBaseGrid, formatCurrencyDecimal } from "./chart-helpers"
import type { PrePostPoint } from "@/types/campaign-effectiveness-test"

interface PrePostComparisonChartProps {
  data: PrePostPoint[]
}

export function PrePostComparisonChart({ data }: PrePostComparisonChartProps) {
  const labels = data.map((d) => d.weekLabel)
  const launchIndex = data.findIndex((d) => d.weekIndex === 0)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatCurrencyDecimal(v as number),
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: labels,
      boundaryGap: false,
      axisLabel: {
        formatter: (v: string) => (v === "W0" ? "{bold|W0}" : v),
        rich: {
          bold: { fontWeight: "bold" },
        },
      },
    },
    yAxis: {
      type: "value",
      name: "Revenue / customer",
      nameLocation: "middle",
      nameGap: 44,
      axisLabel: { formatter: (v: number) => `$${v.toFixed(0)}` },
    },
    series: [
      {
        name: "Test (exposed)",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.testRevenuePerCustomer),
        lineStyle: { width: 2.5 },
        areaStyle: { opacity: 0.18 },
        markLine:
          launchIndex >= 0
            ? {
                silent: true,
                symbol: "none",
                lineStyle: { type: "dashed", width: 1.5 },
                label: {
                  formatter: "Campaign launch",
                  position: "insideEndTop",
                  fontSize: 11,
                },
                data: [{ xAxis: data[launchIndex].weekLabel }],
              }
            : undefined,
      },
      {
        name: "Control (holdout)",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.controlRevenuePerCustomer),
        lineStyle: { width: 2, type: "dashed" },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Pre/Post Comparison — Test vs Control"
      description="Average revenue per customer in the 3 weeks before vs after exposure (W0 = launch week)"
    >
      <EChart option={option} height="340px" />
    </DashboardCardPreset>
  )
}
