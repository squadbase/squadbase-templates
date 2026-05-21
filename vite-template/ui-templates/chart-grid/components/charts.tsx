import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { formatNumber, getBaseGrid } from "./chart-helpers"
import type {
  TimePoint,
  BarPoint,
  ScatterPoint,
  RadarPoint,
  HeatmapCell,
} from "@/types/ui-template-chart-grid"

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
  return <EChart option={option} height="280px" />
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
  return <EChart option={option} height="280px" />
}

const BAR_CATEGORIES = [
  "Item 1",
  "Item 2",
  "Item 3",
  "Item 4",
  "Item 5",
  "Item 6",
  "Item 7",
  "Item 8",
]

interface BarChartProps {
  data: BarPoint[]
}
export function BarChart({ data }: BarChartProps) {
  const option: EChartsOption = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: getBaseGrid(),
    xAxis: { type: "category", data: BAR_CATEGORIES },
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
  return <EChart option={option} height="280px" />
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
  return <EChart option={option} height="280px" />
}

const RADAR_AXES = ["Axis 1", "Axis 2", "Axis 3", "Axis 4", "Axis 5", "Axis 6"]

interface RadarChartProps {
  data: RadarPoint[]
}
export function RadarChart({ data }: RadarChartProps) {
  const option: EChartsOption = {
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    radar: {
      indicator: data.map((_, i) => ({ name: RADAR_AXES[i], max: 100 })),
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
  return <EChart option={option} height="280px" />
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
  return <EChart option={option} height="280px" />
}
