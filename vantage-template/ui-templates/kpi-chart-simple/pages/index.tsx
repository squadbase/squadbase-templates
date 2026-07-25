import { Activity, DollarSign, ShoppingCart, Users } from "lucide-react"
import { definePage } from "@squadbase/vantage"
import {
  DashboardCard,
  DashboardCardAction,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardPreset,
  DashboardCardTitle,
  EChart,
  PageShell,
  PageShellContent,
  PageShellDescription,
  PageShellHeader,
  PageShellHeaderEnd,
  PageShellHeading,
  PageShellTitle,
  Placeholder,
  SegmentedControl,
  Sparkline,
} from "@squadbase/vantage/components"
import type { EChartsOption, SegmentOption } from "@squadbase/vantage/components"
import { Button, ErrorState, Loading } from "@squadbase/vantage/ui"
import { useApiQuery } from "@squadbase/vantage/query"
import { useSearchParam } from "@squadbase/vantage/router"

import { TopItemsTable } from "./components/kpi-chart-simple/top-items-table"
import type { KpiId, KpiSummary, TrendPoint } from "./lib/kpi-chart-simple/types"

export const page = definePage({
  title: "KPI + Chart (Simple)",
  description:
    "4 KPI cards, a single trend line, and a ranked-items table, served by server/api and filtered through the URL.",
})

// ── formatting ───────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`
  return n.toLocaleString("en-US")
}

function formatCurrency(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`
  return `${sign}$${abs.toFixed(0)}`
}

// ── chart options ────────────────────────────────────────────────────────────

function trendOption(data: TrendPoint[]): EChartsOption {
  return {
    tooltip: { trigger: "axis" },
    legend: { bottom: 0 },
    grid: { left: "3%", right: "4%", bottom: "10%", containLabel: true },
    xAxis: {
      type: "category",
      data: data.map((d) => d.date),
      boundaryGap: false,
      axisLabel: { formatter: (value: string) => value.slice(5) },
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "Series A",
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

/** Display labels live here, not in the payload the API returns. */
const KPI_META: Record<
  KpiId,
  { label: string; icon: typeof DollarSign; format: (value: number) => string }
> = {
  "total-revenue": { label: "Metric 1", icon: DollarSign, format: formatCurrency },
  "active-users": {
    label: "Metric 2",
    icon: Users,
    format: (v) => Math.round(v).toLocaleString("en-US"),
  },
  "conversion-rate": { label: "Metric 3", icon: Activity, format: (v) => `${v.toFixed(2)}%` },
  aov: { label: "Metric 4", icon: ShoppingCart, format: (v) => `$${v.toFixed(2)}` },
}

const RANGE_OPTIONS: SegmentOption[] = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
]

function DashboardBody({ data }: { data: KpiSummary }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.kpis.map((kpi) => {
          const { label, icon: Icon, format } = KPI_META[kpi.id]
          return (
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
                  {format(kpi.value)}
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
          )
        })}
      </div>

      <DashboardCardPreset title="Trend" description="Values over the selected period">
        <EChart option={trendOption(data.trend)} height="320px" />
      </DashboardCardPreset>

      <DashboardCardPreset title="Top items" description="Ranked by value">
        <TopItemsTable data={data.topItems} />
      </DashboardCardPreset>
    </>
  )
}

export default function HomePage() {
  // Filter state belongs in the URL rather than `useState`: it survives a
  // reload, and a pasted link reproduces exactly what you were looking at.
  const [range, setRange] = useSearchParam("range", "30d")

  // `search` goes into the query string *and* the cache key, so changing the
  // range refetches instead of serving the previous window.
  const summary = useApiQuery<KpiSummary>("/api/kpi-summary", { search: { range } })

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>[Template] Performance overview</PageShellTitle>
          <PageShellDescription>
            Key metrics and trends for the selected period.
          </PageShellDescription>
        </PageShellHeading>
        <PageShellHeaderEnd>
          <SegmentedControl
            options={RANGE_OPTIONS}
            value={range}
            onChange={setRange}
            ariaLabel="Period"
          />
        </PageShellHeaderEnd>
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        {summary.isPending ? (
          <Loading />
        ) : summary.isError ? (
          // `summary.error` is an `ApiError`: `message` is the text the handler
          // passed to `HttpError`, so there is no cast and no generic wording.
          <ErrorState
            title="Could not load the dashboard"
            message={summary.error.message}
            action={<Button onClick={() => void summary.refetch()}>Retry</Button>}
          />
        ) : (
          <DashboardBody data={summary.data} />
        )}
      </PageShellContent>
    </PageShell>
  )
}
