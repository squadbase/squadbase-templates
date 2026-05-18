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
import { Skeleton } from "@/components/ui/skeleton"
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
          <PageShellTitle>
            <Skeleton className="h-7 w-64" />
          </PageShellTitle>
          <PageShellDescription>
            <Skeleton className="mt-2 h-4 w-96" />
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
          {show("trend") && <AreaChart data={timeSeries} />}
          {show("trend") && <LineChart data={timeSeries} />}
          {show("ranking") && <BarChart data={barSeries} />}
          {show("distribution") && (
            <ScatterChart data={scatterPoints} />
          )}
          {show("distribution") && <RadarChart data={radarAxes} />}
          {show("distribution") && (
            <HeatmapChart
              data={heatmapCells}
              xAxis={HEATMAP_X_AXIS}
              yAxis={HEATMAP_Y_AXIS}
            />
          )}
        </div>
      </PageShellContent>
    </PageShell>
  )
}
