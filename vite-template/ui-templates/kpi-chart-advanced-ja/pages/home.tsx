import { useState } from "react"
import { subDays } from "date-fns"
import {
  DollarSign,
  Users,
  Activity,
  ShoppingCart,
  MousePointer,
  TrendingUp,
  PieChart,
} from "lucide-react"
import { DateRangePicker } from "@/components/data/date-range-picker"
import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellSummary,
  PageShellSummaryCard,
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
import { ComparisonChart } from "@/components/ui-template-kpi-chart-advanced/comparison-chart"
import { BreakdownChart } from "@/components/ui-template-kpi-chart-advanced/breakdown-chart"
import { TrendChart } from "@/components/ui-template-kpi-chart-advanced/trend-chart"
import { CampaignTable } from "@/components/ui-template-kpi-chart-advanced/campaign-table"
import {
  headerKpis,
  trendSeries,
  comparisonSeries,
  breakdownSlices,
  campaignRows,
} from "@/lib/ui-template-kpi-chart-advanced-mock-data"
import type { DashboardFilters } from "@/types/ui-template-kpi-chart-advanced"

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
            <DashboardCardPreset
              title="比較"
              description="今期 vs 前期"
            >
              <ComparisonChart data={comparisonSeries} />
            </DashboardCardPreset>
          </div>
          <DashboardCardPreset title="内訳" description="セグメント別シェア">
            <BreakdownChart data={breakdownSlices} />
          </DashboardCardPreset>
        </div>

        <DashboardCardPreset
          title="トレンド"
          description="選択期間の値"
        >
          <TrendChart data={trendSeries} />
        </DashboardCardPreset>

        <DashboardCardPreset title="キャンペーン" description="キャンペーン別パフォーマンス">
          <CampaignTable data={campaignRows} />
        </DashboardCardPreset>
      </PageShellContent>
    </PageShell>
  )
}
