import { useState } from "react"
import { subDays } from "date-fns"
import type { EChartsOption } from "echarts"
import { DateRangePicker } from "@/components/data/date-range-picker"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { EChart } from "@/components/data/echart"
import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellContent,
} from "@/components/common/page-shell"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import {
  timeSeries,
  barSeries,
  scatterPoints,
  radarAxes,
  heatmapCells,
  HEATMAP_X_AXIS,
  HEATMAP_Y_AXIS,
} from "@/templates/chart-grid/mock-data"
import type {
  TimePoint,
  BarPoint,
  ScatterPoint,
  RadarPoint,
  HeatmapCell,
  DashboardFilters,
} from "@/templates/chart-grid/types"

// ── chart helpers ───────────────────────────────────────────────────────────

function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "10%", containLabel: true }
}

function formatNumber(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`
  return n.toLocaleString("en-US")
}

// ── chart options ────────────────────────────────────────────────────────────

function areaOption(data: TimePoint[]): EChartsOption {
  return {
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
}

function lineOption(data: TimePoint[]): EChartsOption {
  return {
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

function barOption(data: BarPoint[]): EChartsOption {
  return {
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
}

function scatterOption(data: ScatterPoint[]): EChartsOption {
  return {
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
}

const RADAR_AXES = ["Axis 1", "Axis 2", "Axis 3", "Axis 4", "Axis 5", "Axis 6"]

function radarOption(data: RadarPoint[]): EChartsOption {
  return {
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
}

function heatmapOption(
  data: HeatmapCell[],
  xAxis: string[],
  yAxis: string[],
): EChartsOption {
  const max = Math.max(...data.map((c) => c.value))
  return {
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
}

// ── page ─────────────────────────────────────────────────────────────────────

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: subDays(today, 29),
    to: today,
  },
}

type Category = "all" | "trend" | "ranking" | "distribution"

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)
  const [category, setCategory] = useState<Category>("all")

  const show = (target: Exclude<Category, "all">) =>
    category === "all" || category === target

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>[Template] Charts overview</PageShellTitle>
          <PageShellDescription>
            A grid of charts for the selected period.
          </PageShellDescription>
        </PageShellHeading>
        <PageShellHeaderEnd className="flex-row items-center gap-3">
          <ToggleGroup
            type="single"
            value={category}
            onValueChange={(v) => v && setCategory(v as Category)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="trend">Group A</ToggleGroupItem>
            <ToggleGroupItem value="ranking">Group B</ToggleGroupItem>
            <ToggleGroupItem value="distribution">Group C</ToggleGroupItem>
          </ToggleGroup>
          <DateRangePicker
            value={filters.dateRange}
            onChange={(range) =>
              setFilters((prev) => ({ ...prev, dateRange: range }))
            }
            maxDate={today}
          />
        </PageShellHeaderEnd>
      </PageShellHeader>

      <PageShellContent>
        <div className="grid gap-4 lg:grid-cols-2">
          {show("trend") && (
            <DashboardCardPreset
              title="Trend (area)"
              description="Two series over the selected period"
            >
              <EChart option={areaOption(timeSeries)} height="280px" />
            </DashboardCardPreset>
          )}
          {show("trend") && (
            <DashboardCardPreset
              title="Trend (line)"
              description="Two series over the selected period"
            >
              <EChart option={lineOption(timeSeries)} height="280px" />
            </DashboardCardPreset>
          )}
          {show("ranking") && (
            <DashboardCardPreset title="Top categories" description="Ranked by value">
              <EChart option={barOption(barSeries)} height="280px" />
            </DashboardCardPreset>
          )}
          {show("distribution") && (
            <DashboardCardPreset title="Correlation" description="Each point is an item">
              <EChart option={scatterOption(scatterPoints)} height="280px" />
            </DashboardCardPreset>
          )}
          {show("distribution") && (
            <DashboardCardPreset title="Profile" description="Current vs benchmark">
              <EChart option={radarOption(radarAxes)} height="280px" />
            </DashboardCardPreset>
          )}
          {show("distribution") && (
            <DashboardCardPreset title="Activity" description="Intensity by cell">
              <EChart
                option={heatmapOption(heatmapCells, HEATMAP_X_AXIS, HEATMAP_Y_AXIS)}
                height="280px"
              />
            </DashboardCardPreset>
          )}
        </div>
      </PageShellContent>
    </PageShell>
  )
}
