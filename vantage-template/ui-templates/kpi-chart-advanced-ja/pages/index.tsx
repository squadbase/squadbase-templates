import { useState } from "react"

import { subDays } from "date-fns"
import {
  Activity,
  DollarSign,
  MousePointer,
  PieChart,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react"

import { definePage } from "@squadbase/vantage"
import {
  DashboardCard,
  DashboardCardAction,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardPreset,
  DashboardCardTitle,
  DateRangePicker,
  EChart,
  PageShell,
  PageShellContent,
  PageShellDescription,
  PageShellHeader,
  PageShellHeaderEnd,
  PageShellHeading,
  PageShellSummary,
  PageShellSummaryCard,
  PageShellTitle,
  Placeholder,
  Sparkline,
  type EChartsOption,
} from "@squadbase/vantage/components"

import { CampaignTable } from "./components/kpi-chart-advanced/campaign-table"
import {
  breakdownSlices,
  campaignRows,
  comparisonSeries,
  headerKpis,
  trendSeries,
} from "./components/kpi-chart-advanced/mock-data"
import type {
  BreakdownSlice,
  ComparisonPoint,
  DashboardFilters,
  TrendPoint,
} from "./components/kpi-chart-advanced/types"

export const page = definePage({
  title: "KPI + チャート (アドバンスト)",
  description:
    "ヒーローKPI (大1+小4の2×2) ・棒+折れ線比較チャート・ドーナツ・日次トレンド・明細テーブルを搭載したKPI主役のダッシュボード構成",
})

// ── chart helpers ───────────────────────────────────────────────────────────

function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "12%", containLabel: true }
}

function getDualAxisGrid() {
  return { left: "3%", right: "6%", bottom: "12%", containLabel: true }
}

function formatNumber(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(1)}億`
  if (abs >= 10_000) return `${sign}${(abs / 10_000).toFixed(0)}万`
  return n.toLocaleString("ja-JP")
}

// ── chart options ────────────────────────────────────────────────────────────

function comparisonOption(data: ComparisonPoint[]): EChartsOption {
  return {
    tooltip: { trigger: "axis" },
    legend: { bottom: 0 },
    grid: getDualAxisGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.period),
    },
    yAxis: [
      {
        type: "value",
        axisLabel: { formatter: (v: number) => formatNumber(v) },
      },
      {
        type: "value",
        axisLabel: { formatter: (v: number) => `${v.toFixed(0)}%` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "系列A",
        type: "bar",
        data: data.map((d) => d.current),
        barMaxWidth: 28,
      },
      {
        name: "系列B",
        type: "bar",
        data: data.map((d) => d.previous),
        barMaxWidth: 28,
      },
      {
        name: "系列C",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: data.map((d) => d.growth),
      },
    ],
  }
}

function breakdownOption(data: BreakdownSlice[]): EChartsOption {
  return {
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    series: [
      {
        type: "pie",
        radius: ["52%", "78%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "transparent", borderWidth: 2 },
        label: { show: false },
        data: data.map((d) => ({ name: d.segment, value: d.value })),
      },
    ],
  }
}

function trendOption(data: TrendPoint[]): EChartsOption {
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
        data: data.map((d) => d.value),
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

const smallKpiCards = [
  { label: "指標2", icon: Users, kpi: headerKpis[1] },
  { label: "指標3", icon: MousePointer, kpi: headerKpis[2] },
  { label: "指標4", icon: Activity, kpi: headerKpis[3] },
  { label: "指標5", icon: ShoppingCart, kpi: headerKpis[4] },
]

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)
  const heroKpi = headerKpis[0]

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>[テンプレート] パフォーマンスダッシュボード</PageShellTitle>
          <PageShellDescription>
            選択期間の主要KPI・比較・詳細。
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
        <PageShellSummary>
          <PageShellSummaryCard accent="accent">
            <TrendingUp />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold">成長</p>
              <p className="text-xs text-muted-foreground">
                全体のパフォーマンスは前期比で上昇傾向です。
              </p>
            </div>
          </PageShellSummaryCard>
          <PageShellSummaryCard accent="default">
            <PieChart />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold">構成</p>
              <p className="text-xs text-muted-foreground">
                単一セグメントが全体で最大のシェアを占めています。
              </p>
            </div>
          </PageShellSummaryCard>
          <PageShellSummaryCard accent="accent">
            <Activity />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold">勢い</p>
              <p className="text-xs text-muted-foreground">
                直近の動きはトレンドの好転を示しています。
              </p>
            </div>
          </PageShellSummaryCard>
        </PageShellSummary>
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardCard className="h-full">
            <DashboardCardHeader>
              <DashboardCardTitle className="text-muted-foreground">
                指標1
              </DashboardCardTitle>
              <DashboardCardAction>
                <DollarSign className="size-5 text-muted-foreground" />
              </DashboardCardAction>
            </DashboardCardHeader>
            <DashboardCardContent className="flex flex-1 flex-col gap-5">
              <div>
                <Placeholder className="text-4xl font-bold">
                  {heroKpi.value}
                </Placeholder>
                <div className="mt-3">
                  <Placeholder className="text-sm font-medium">
                    {heroKpi.change >= 0
                      ? `+${heroKpi.change}%`
                      : `${heroKpi.change}%`}
                  </Placeholder>
                </div>
              </div>
              <Sparkline
                data={heroKpi.sparklineData.map((v) => ({ value: v }))}
                height={88}
                area
              />
              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">指標A</p>
                  <Placeholder className="text-sm font-medium">¥92万</Placeholder>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">指標B</p>
                  <Placeholder className="text-sm font-medium">+8.4%</Placeholder>
                </div>
              </div>
            </DashboardCardContent>
          </DashboardCard>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {smallKpiCards.map(({ label, icon: Icon, kpi }) => (
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
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardCardPreset title="比較" description="今期 vs 前期">
              <EChart option={comparisonOption(comparisonSeries)} height="320px" />
            </DashboardCardPreset>
          </div>
          <DashboardCardPreset title="内訳" description="セグメント別シェア">
            <EChart option={breakdownOption(breakdownSlices)} height="320px" />
          </DashboardCardPreset>
        </div>

        <DashboardCardPreset title="トレンド" description="選択期間の値">
          <EChart option={trendOption(trendSeries)} height="280px" />
        </DashboardCardPreset>

        <DashboardCardPreset title="キャンペーン" description="キャンペーン別パフォーマンス">
          <CampaignTable data={campaignRows} />
        </DashboardCardPreset>
      </PageShellContent>
    </PageShell>
  )
}
