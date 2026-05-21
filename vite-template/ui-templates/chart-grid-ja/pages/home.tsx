import { useState } from "react"
import { subDays } from "date-fns"
import { DateRangePicker } from "@/components/data/date-range-picker"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
  AreaChart,
  LineChart,
  BarChart,
  ScatterChart,
  RadarChart,
  HeatmapChart,
} from "@/components/ui-template-chart-grid/charts"
import {
  timeSeries,
  barSeries,
  scatterPoints,
  radarAxes,
  heatmapCells,
  HEATMAP_X_AXIS,
  HEATMAP_Y_AXIS,
} from "@/lib/ui-template-chart-grid-mock-data"
import type { DashboardFilters } from "@/types/ui-template-chart-grid"

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
          <PageShellTitle>チャート概要</PageShellTitle>
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
              <AreaChart data={timeSeries} />
            </DashboardCardPreset>
          )}
          {show("trend") && (
            <DashboardCardPreset
              title="トレンド (折れ線)"
              description="選択期間の2系列"
            >
              <LineChart data={timeSeries} />
            </DashboardCardPreset>
          )}
          {show("ranking") && (
            <DashboardCardPreset title="上位カテゴリ" description="値で並べ替え">
              <BarChart data={barSeries} />
            </DashboardCardPreset>
          )}
          {show("distribution") && (
            <DashboardCardPreset title="相関" description="各点が1項目">
              <ScatterChart data={scatterPoints} />
            </DashboardCardPreset>
          )}
          {show("distribution") && (
            <DashboardCardPreset title="プロファイル" description="現在 vs ベンチマーク">
              <RadarChart data={radarAxes} />
            </DashboardCardPreset>
          )}
          {show("distribution") && (
            <DashboardCardPreset title="アクティビティ" description="セルごとの強度">
              <HeatmapChart
                data={heatmapCells}
                xAxis={HEATMAP_X_AXIS}
                yAxis={HEATMAP_Y_AXIS}
              />
            </DashboardCardPreset>
          )}
        </div>
      </PageShellContent>
    </PageShell>
  )
}
