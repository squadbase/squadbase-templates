import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency, formatPercent } from "./chart-helpers"
import type {
  RepMonthlyTrend,
  RepPaceStatus,
} from "@/types/sales-rep-individual-target"

interface MonthlyTrendSmallMultiplesProps {
  data: RepMonthlyTrend[]
}

const statusConfig: Record<RepPaceStatus, { label: string; className: string }> = {
  ahead: {
    label: "Ahead",
    className:
      "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  "on-track": {
    label: "On track",
    className:
      "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  behind: {
    label: "Behind",
    className:
      "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
}

function buildOption(trend: RepMonthlyTrend): EChartsOption {
  const months = trend.points.map((p) => p.month.slice(5)) // "MM"

  return {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v): string =>
        v === null || v === undefined
          ? "-"
          : formatCurrency(v as number, { short: true }),
    },
    legend: { show: false },
    grid: { left: 4, right: 8, top: 8, bottom: 22, containLabel: true },
    xAxis: {
      type: "category",
      data: months,
      boundaryGap: false,
      axisLabel: { fontSize: 10 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      min: 0,
      splitNumber: 2,
      axisLabel: {
        fontSize: 10,
        formatter: (v: number): string => formatCurrency(v, { short: true }),
      },
    },
    series: [
      {
        name: "Target",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { type: "dashed", width: 1.5 },
        data: trend.points.map((p) => p.target),
      },
      {
        name: "Actual",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.25 },
        areaStyle: { opacity: 0.18 },
        data: trend.points.map((p) => p.actual),
      },
    ],
  }
}

export function MonthlyTrendSmallMultiples({ data }: MonthlyTrendSmallMultiplesProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Monthly Trend by Rep
        </h2>
        <p className="text-xs text-muted-foreground">
          Target (dashed) vs. actual (solid) over the last 12 months. The right-most month is in progress.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((trend) => {
          const cfg = statusConfig[trend.status]
          return (
            <DashboardCard key={trend.salesRep}>
              <DashboardCardHeader>
                <div className="min-w-0 flex-1">
                  <DashboardCardTitle className="truncate text-sm">
                    {trend.salesRep}
                  </DashboardCardTitle>
                  <DashboardCardDescription className="tabular-nums">
                    {formatPercent(trend.latestAttainmentPct)} of target
                  </DashboardCardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] font-medium", cfg.className)}
                >
                  {cfg.label}
                </Badge>
              </DashboardCardHeader>
              <DashboardCardContent>
                <EChart option={buildOption(trend)} height="120px" />
              </DashboardCardContent>
            </DashboardCard>
          )
        })}
      </div>
    </section>
  )
}
