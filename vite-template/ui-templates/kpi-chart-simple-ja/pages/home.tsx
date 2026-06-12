import { useState } from "react"
import { subDays } from "date-fns"
import type { EChartsOption } from "echarts"
import { DollarSign, Users, Activity, ShoppingCart } from "lucide-react"
import { DateRangePicker } from "@/components/data/date-range-picker"
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
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
  DashboardCardPreset,
} from "@/components/common/dashboard-card"
import { Placeholder } from "@/components/common/placeholder"
import { Sparkline } from "@/components/data/sparkline"
import { TopItemsTable } from "@/templates/kpi-chart-simple/top-items-table"
import {
  headerKpis,
  trendSeries,
  topItems,
} from "@/templates/kpi-chart-simple/mock-data"
import type {
  DashboardFilters,
  TrendPoint,
} from "@/templates/kpi-chart-simple/types"

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

function trendOption(data: TrendPoint[]): EChartsOption {
  return {
    tooltip: { trigger: "axis" },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.date),
      boundaryGap: false,
      axisLabel: {
        formatter: (value: string) => value.slice(5),
      },
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "系列A",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.revenue),
        areaStyle: { opacity: 0.18 },
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

const kpiCards = [
  { label: "指標1", icon: DollarSign, kpi: headerKpis[0] },
  { label: "指標2", icon: Users, kpi: headerKpis[1] },
  { label: "指標3", icon: Activity, kpi: headerKpis[2] },
  { label: "指標4", icon: ShoppingCart, kpi: headerKpis[3] },
]

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>[テンプレート] パフォーマンス概要</PageShellTitle>
          <PageShellDescription>
            選択期間の主要指標とトレンド。
          </PageShellDescription>
        </PageShellHeading>
        <PageShellHeaderEnd>
          <DateRangePicker
            value={filters.dateRange}
            onChange={(range) =>
              setFilters((prev) => ({ ...prev, dateRange: range }))
            }
            maxDate={today}
          />
        </PageShellHeaderEnd>
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map(({ label, icon: Icon, kpi }) => (
            <DashboardCard key={kpi.id}>
              <DashboardCardHeader>
                <DashboardCardTitle className="text-muted-foreground">
                  {label}
                </DashboardCardTitle>
                <DashboardCardAction>
                  <Icon className="size-4 text-muted-foreground" />
                </DashboardCardAction>
              </DashboardCardHeader>
              <DashboardCardContent>
                <Placeholder className="text-2xl font-bold">
                  {kpi.value}
                </Placeholder>
                <div className="mt-2">
                  <Placeholder className="text-sm font-medium">
                    {kpi.change >= 0 ? `+${kpi.change}%` : `${kpi.change}%`}
                  </Placeholder>
                </div>
                <Sparkline
                  data={kpi.sparklineData.map((v) => ({ value: v }))}
                  height={32}
                  area
                  className="mt-3"
                />
              </DashboardCardContent>
            </DashboardCard>
          ))}
        </div>

        <DashboardCardPreset
          title="トレンド"
          description="選択期間の値"
        >
          <EChart option={trendOption(trendSeries)} height="320px" />
        </DashboardCardPreset>

        <DashboardCardPreset title="上位項目" description="値で並べ替え">
          <TopItemsTable data={topItems} />
        </DashboardCardPreset>
      </PageShellContent>
    </PageShell>
  )
}
