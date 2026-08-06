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
  title: "KPI + チャート (シンプル)",
  description:
    "KPIカード4個・トレンドライン1本・上位アイテムテーブル。server/api から取得し、期間は URL で切り替える最小構成",
})

// ── 表示フォーマット ─────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`
  return n.toLocaleString("ja-JP")
}

function formatCurrency(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}¥${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}¥${(abs / 1_000).toFixed(1)}K`
  return `${sign}¥${abs.toFixed(0)}`
}

// ── チャートオプション ───────────────────────────────────────────────────────

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

// ── ページ ───────────────────────────────────────────────────────────────────

/** 表示ラベルは API のレスポンスではなく描画側に置く。 */
const KPI_META: Record<
  KpiId,
  { label: string; icon: typeof DollarSign; format: (value: number) => string }
> = {
  "total-revenue": { label: "指標1", icon: DollarSign, format: formatCurrency },
  "active-users": {
    label: "指標2",
    icon: Users,
    format: (v) => Math.round(v).toLocaleString("ja-JP"),
  },
  "conversion-rate": { label: "指標3", icon: Activity, format: (v) => `${v.toFixed(2)}%` },
  aov: { label: "指標4", icon: ShoppingCart, format: (v) => `¥${v.toFixed(2)}` },
}

const RANGE_OPTIONS: SegmentOption[] = [
  { label: "7日", value: "7d" },
  { label: "30日", value: "30d" },
  { label: "90日", value: "90d" },
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

      <DashboardCardPreset title="トレンド" description="選択期間の値">
        <EChart option={trendOption(data.trend)} height="320px" />
      </DashboardCardPreset>

      <DashboardCardPreset title="上位項目" description="値で並べ替え">
        <TopItemsTable data={data.topItems} />
      </DashboardCardPreset>
    </>
  )
}

export default function HomePage() {
  // 絞り込み状態は useState ではなく URL に置く。リロードで消えず、URL を
  // そのまま共有すれば相手も同じ画面を見られる。
  const [range, setRange] = useSearchParam("range", "30d")

  // search はクエリ文字列とキャッシュキーの両方に入るので、期間を変えると
  // 前の期間のデータを返さずに再取得される。
  const summary = useApiQuery<KpiSummary>("/api/kpi-summary", { search: { range } })

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
          <SegmentedControl
            options={RANGE_OPTIONS}
            value={range}
            onChange={setRange}
            ariaLabel="期間"
          />
        </PageShellHeaderEnd>
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        {summary.isPending ? (
          <Loading />
        ) : summary.isError ? (
          // summary.error は ApiError。message にはハンドラが HttpError に
          // 渡した文言がそのまま入るので、キャストも汎用文言も要らない。
          <ErrorState
            title="ダッシュボードを読み込めませんでした"
            message={summary.error.message}
            action={<Button onClick={() => void summary.refetch()}>再試行</Button>}
          />
        ) : (
          <DashboardBody data={summary.data} />
        )}
      </PageShellContent>
    </PageShell>
  )
}
