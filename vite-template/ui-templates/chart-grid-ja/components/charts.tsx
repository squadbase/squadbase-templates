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
        name: "系列A",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.series1),
        areaStyle: { opacity: 0.22 },
      },
      {
        name: "系列B",
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
        name: "系列A",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.series1),
      },
      {
        name: "系列B",
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
  "項目1",
  "項目2",
  "項目3",
  "項目4",
  "項目5",
  "項目6",
  "項目7",
  "項目8",
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
        name: "系列A",
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

const RADAR_AXES = ["軸1", "軸2", "軸3", "軸4", "軸5", "軸6"]

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
            name: "系列A",
            areaStyle: { opacity: 0.28 },
          },
          {
            value: data.map((r) => r.benchmark),
            name: "系列B",
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
