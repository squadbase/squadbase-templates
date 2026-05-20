import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { formatNumber, getBaseGrid } from "./chart-helpers"
import type {
  TimePoint,
  BarPoint,
  ScatterPoint,
  RadarPoint,
  HeatmapCell,
} from "@/types/ui-template-chart-grid"

interface ChartCardProps {
  title: string
  description: string
  children: React.ReactNode
}

function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <div className="space-y-1">
          <DashboardCardTitle>{title}</DashboardCardTitle>
          <DashboardCardDescription>{description}</DashboardCardDescription>
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>{children}</DashboardCardContent>
    </DashboardCard>
  )
}

interface AreaChartProps {
  data: TimePoint[]
}
export function AreaChart({ data }: AreaChartProps) {
  const option: EChartsOption = {
    tooltip: { trigger: "axis" },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.date),
      boundaryGap: false,
      axisLabel: { formatter: (v: string) => v.slice(5) },
    },
    yAxis: { type: "value", axisLabel: { formatter: (v: number) => formatNumber(v) } },
    series: [
      {
        name: "Series A",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.series1),
        areaStyle: { opacity: 0.22 },
      },
      {
        name: "Series B",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.series2),
        areaStyle: { opacity: 0.14 },
      },
    ],
  }
  return (
    <ChartCard title="Trend (area)" description="Two series over the selected period">
      <EChart option={option} height="280px" />
    </ChartCard>
  )
}

interface LineChartProps {
  data: TimePoint[]
}
export function LineChart({ data }: LineChartProps) {
  const option: EChartsOption = {
    tooltip: { trigger: "axis" },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.date),
      boundaryGap: false,
      axisLabel: { formatter: (v: string) => v.slice(5) },
    },
    yAxis: { type: "value", axisLabel: { formatter: (v: number) => formatNumber(v) } },
    series: [
      {
        name: "Series A",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.series1),
      },
      {
        name: "Series B",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.series2),
      },
    ],
  }
  return (
    <ChartCard title="Trend (line)" description="Two series over the selected period">
      <EChart option={option} height="280px" />
    </ChartCard>
  )
}

interface BarChartProps {
  data: BarPoint[]
}
export function BarChart({ data }: BarChartProps) {
  const option: EChartsOption = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: getBaseGrid(),
    xAxis: { type: "category", data: data.map((d) => d.category) },
    yAxis: { type: "value", axisLabel: { formatter: (v: number) => formatNumber(v) } },
    series: [
      {
        name: "Series A",
        type: "bar",
        data: data.map((d) => d.value),
        barMaxWidth: 28,
      },
    ],
  }
  return (
    <ChartCard title="Top categories" description="Ranked by value">
      <EChart option={option} height="280px" />
    </ChartCard>
  )
}

interface ScatterChartProps {
  data: ScatterPoint[]
}
export function ScatterChart({ data }: ScatterChartProps) {
  const option: EChartsOption = {
    tooltip: { trigger: "item" },
    grid: getBaseGrid(),
    xAxis: { type: "value" },
    yAxis: { type: "value" },
    series: [
      {
        type: "scatter",
        data: data.map((p) => ({
          value: [p.x, p.y, p.size] as [number, number, number],
          label: p.label,
        })),
        symbolSize: (val: unknown) => {
          const arr = val as [number, number, number]
          return arr[2]
        },
      },
    ] as EChartsOption["series"],
  }
  return (
    <ChartCard title="Correlation" description="Each point is an item">
      <EChart option={option} height="280px" />
    </ChartCard>
  )
}

interface RadarChartProps {
  data: RadarPoint[]
}
export function RadarChart({ data }: RadarChartProps) {
  const option: EChartsOption = {
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    radar: {
      indicator: data.map((r) => ({ name: r.axis, max: 100 })),
      radius: "65%",
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: data.map((r) => r.current),
            name: "Series A",
            areaStyle: { opacity: 0.28 },
          },
          {
            value: data.map((r) => r.benchmark),
            name: "Series B",
            areaStyle: { opacity: 0.18 },
          },
        ],
      },
    ],
  }
  return (
    <ChartCard title="Profile" description="Current vs benchmark">
      <EChart option={option} height="280px" />
    </ChartCard>
  )
}

interface HeatmapChartProps {
  data: HeatmapCell[]
  xAxis: string[]
  yAxis: string[]
}
export function HeatmapChart({ data, xAxis, yAxis }: HeatmapChartProps) {
  const max = Math.max(...data.map((c) => c.value))
  const option: EChartsOption = {
    tooltip: { position: "top" },
    grid: { height: "70%", top: "8%", left: "10%", right: "8%" },
    xAxis: { type: "category", data: xAxis, splitArea: { show: true } },
    yAxis: { type: "category", data: yAxis, splitArea: { show: true } },
    visualMap: {
      min: 0,
      max,
      calculable: true,
      orient: "horizontal",
      bottom: 0,
    },
    series: [
      {
        type: "heatmap",
        data: data.map((c) => [xAxis.indexOf(c.x), yAxis.indexOf(c.y), c.value]),
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.4)" } },
      },
    ],
  }
  return (
    <ChartCard title="Activity" description="Intensity by cell">
      <EChart option={option} height="280px" />
    </ChartCard>
  )
}
