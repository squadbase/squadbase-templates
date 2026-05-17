import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, getBaseGrid } from "./chart-helpers"
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
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatCurrency(v as number, { short: true }),
    },
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
        name: "主系列",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.series1),
        areaStyle: { opacity: 0.22 },
      },
      {
        name: "副系列",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.series2),
        areaStyle: { opacity: 0.14 },
      },
    ],
  }
  return (
    <DashboardCardPreset title="エリアチャート" description="二系列の日次エリアチャート">
      <EChart option={option} height="280px" />
    </DashboardCardPreset>
  )
}

interface LineChartProps {
  data: TimePoint[]
}
export function LineChart({ data }: LineChartProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatNumber(v as number),
    },
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
        name: "主系列",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.series1),
      },
      {
        name: "副系列",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.series2),
      },
    ],
  }
  return (
    <DashboardCardPreset title="折れ線トレンド" description="二系列の日次折れ線">
      <EChart option={option} height="280px" />
    </DashboardCardPreset>
  )
}

interface BarChartProps {
  data: BarPoint[]
}
export function BarChart({ data }: BarChartProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatCurrency(v as number, { short: true }),
    },
    grid: getBaseGrid(),
    xAxis: { type: "category", data: data.map((d) => d.category) },
    yAxis: { type: "value", axisLabel: { formatter: (v: number) => formatNumber(v) } },
    series: [
      {
        name: "金額",
        type: "bar",
        data: data.map((d) => d.value),
        barMaxWidth: 28,
      },
    ],
  }
  return (
    <DashboardCardPreset title="セグメント別ランキング" description="セグメント別の金額">
      <EChart option={option} height="280px" />
    </DashboardCardPreset>
  )
}

interface ScatterChartProps {
  data: ScatterPoint[]
}
export function ScatterChart({ data }: ScatterChartProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number]; data: { label: string } }
        return `${p.data.label}<br/>X: ${p.value[0]} · Y: ${p.value[1]}`
      },
    },
    grid: getBaseGrid(),
    xAxis: { type: "value", name: "次元X" },
    yAxis: { type: "value", name: "次元Y" },
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
    <DashboardCardPreset title="散布図" description="二次元での分布">
      <EChart option={option} height="280px" />
    </DashboardCardPreset>
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
            name: "現状",
            areaStyle: { opacity: 0.28 },
          },
          {
            value: data.map((r) => r.benchmark),
            name: "ベンチマーク",
            areaStyle: { opacity: 0.18 },
          },
        ],
      },
    ],
  }
  return (
    <DashboardCardPreset title="ケイパビリティレーダー" description="軸別の現状とベンチマーク比較">
      <EChart option={option} height="280px" />
    </DashboardCardPreset>
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
    <DashboardCardPreset title="アクティビティヒートマップ" description="曜日 × 時間帯の活性度">
      <EChart option={option} height="280px" />
    </DashboardCardPreset>
  )
}
