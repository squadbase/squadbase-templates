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
  if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(1)}億`
  if (abs >= 10_000) return `${sign}${(abs / 10_000).toFixed(0)}万`
  return n.toLocaleString("ja-JP")
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

function barOption(data: BarPoint[]): EChartsOption {
  return {
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

const RADAR_AXES = ["軸1", "軸2", "軸3", "軸4", "軸5", "軸6"]

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
          <PageShellTitle>[テンプレート] チャート概要</PageShellTitle>
          <PageShellDescription>
            選択期間のチャートをグリッド表示。
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
            <ToggleGroupItem value="all">すべて</ToggleGroupItem>
            <ToggleGroupItem value="trend">グループA</ToggleGroupItem>
            <ToggleGroupItem value="ranking">グループB</ToggleGroupItem>
            <ToggleGroupItem value="distribution">グループC</ToggleGroupItem>
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
              title="トレンド (エリア)"
              description="選択期間の2系列"
            >
              <EChart option={areaOption(timeSeries)} height="280px" />
            </DashboardCardPreset>
          )}
          {show("trend") && (
            <DashboardCardPreset
              title="トレンド (折れ線)"
              description="選択期間の2系列"
            >
              <EChart option={lineOption(timeSeries)} height="280px" />
            </DashboardCardPreset>
          )}
          {show("ranking") && (
            <DashboardCardPreset title="上位カテゴリ" description="値で並べ替え">
              <EChart option={barOption(barSeries)} height="280px" />
            </DashboardCardPreset>
          )}
          {show("distribution") && (
            <DashboardCardPreset title="相関" description="各点が1項目">
              <EChart option={scatterOption(scatterPoints)} height="280px" />
            </DashboardCardPreset>
          )}
          {show("distribution") && (
            <DashboardCardPreset title="プロファイル" description="現在 vs ベンチマーク">
              <EChart option={radarOption(radarAxes)} height="280px" />
            </DashboardCardPreset>
          )}
          {show("distribution") && (
            <DashboardCardPreset title="アクティビティ" description="セルごとの強度">
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
