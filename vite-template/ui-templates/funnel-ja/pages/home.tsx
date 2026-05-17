import { useMemo, useState } from "react"
import { subDays } from "date-fns"
import { TrendingDown, TrendingUp, Users, Target } from "lucide-react"
import { DateRangePicker } from "@/components/data/date-range-picker"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
  DashboardCardPreset,
} from "@/components/common/dashboard-card"
import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellContent,
} from "@/components/common/page-shell"
import { FunnelChart } from "@/components/ui-template-funnel/funnel-chart"
import { StageTable } from "@/components/ui-template-funnel/stage-table"
import { formatNumber } from "@/components/ui-template-funnel/chart-helpers"
import {
  funnelStages,
  stageRows,
} from "@/lib/ui-template-funnel-mock-data"

const today = new Date()

type DisplayMode = "count" | "percent"

export default function HomePage() {
  const [dateRange, setDateRange] = useState({
    from: subDays(today, 29) as Date | undefined,
    to: today as Date | undefined,
  })
  const [display, setDisplay] = useState<DisplayMode>("count")

  const summary = useMemo(() => {
    const top = funnelStages[0]
    const bottom = funnelStages[funnelStages.length - 1]
    const transitions = funnelStages.slice(1)
    const best = transitions.reduce((acc, s) =>
      s.conversionRate > acc.conversionRate ? s : acc,
    )
    const worst = transitions.reduce((acc, s) =>
      s.conversionRate < acc.conversionRate ? s : acc,
    )
    return {
      topValue: top.value,
      endToEnd: (bottom.value / top.value) * 100,
      best,
      worst,
    }
  }, [])

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>コンバージョンパイプライン</PageShellTitle>
          <PageShellDescription>
            ファネル可視化をページ中央に大きく配置し、ステージ別ボリュームをサイドバーに添える構成
          </PageShellDescription>
        </PageShellHeading>
        <PageShellHeaderEnd className="flex-row items-center gap-2">
          <ToggleGroup
            type="single"
            value={display}
            onValueChange={(v) => v && setDisplay(v as DisplayMode)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="count">件数</ToggleGroupItem>
            <ToggleGroupItem value="percent">割合</ToggleGroupItem>
          </ToggleGroup>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            maxDate={today}
          />
        </PageShellHeaderEnd>
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="ファネル流入"
            value={formatNumber(summary.topValue)}
            sub="ファネルに入った訪問者"
            icon={<Users className="size-4 text-muted-foreground" />}
          />
          <SummaryCard
            label="エンドツーエンド転換率"
            value={`${summary.endToEnd.toFixed(2)}%`}
            sub="訪問者 → 受注"
            icon={<Target className="size-4 text-muted-foreground" />}
          />
          <SummaryCard
            label="最良ステージ"
            value={`${summary.best.conversionRate.toFixed(1)}%`}
            sub={`通過率が最も高い · ${summary.best.stage}`}
            icon={<TrendingUp className="size-4 text-emerald-600" />}
          />
          <SummaryCard
            label="ボトルネック"
            value={`${summary.worst.conversionRate.toFixed(1)}%`}
            sub={`通過率が最も低い · ${summary.worst.stage}`}
            icon={<TrendingDown className="size-4 text-rose-600" />}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FunnelChart data={funnelStages} height="440px" display={display} />
          </div>
          <DashboardCardPreset
            title="ステージ"
            description="ステップごとの通過率と離脱"
          >
            <StagesSidebar />
          </DashboardCardPreset>
        </div>

        <StageTable data={stageRows} />
      </PageShellContent>
    </PageShell>
  )
}

interface SummaryCardProps {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
}

function SummaryCard({ label, value, sub, icon }: SummaryCardProps) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{label}</DashboardCardTitle>
        <DashboardCardAction>{icon}</DashboardCardAction>
      </DashboardCardHeader>
      <DashboardCardContent>
        <div className="text-3xl font-semibold tabular-nums">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </DashboardCardContent>
    </DashboardCard>
  )
}

function StagesSidebar() {
  return (
    <ol className="space-y-4">
      {funnelStages.map((s, i) => {
        const prev = i > 0 ? funnelStages[i - 1] : null
        const dropoff = prev ? prev.value - s.value : 0
        const dropoffPct = prev ? (dropoff / prev.value) * 100 : 0
        return (
          <li key={s.stage} className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium truncate">{s.stage}</span>
              </div>
              <span className="text-sm font-semibold tabular-nums">
                {formatNumber(s.value)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs tabular-nums">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">通過率</span>
                <span className="font-medium">
                  {prev ? `${s.conversionRate.toFixed(1)}%` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-muted-foreground">離脱</span>
                <span
                  className={
                    prev
                      ? "font-medium text-rose-600 dark:text-rose-400"
                      : "font-medium text-muted-foreground"
                  }
                >
                  {prev ? `−${formatNumber(dropoff)}` : "—"}
                </span>
              </div>
            </div>
            {prev && (
              <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-chart-1"
                  style={{ width: `${s.conversionRate.toFixed(1)}%` }}
                />
                <div
                  className="h-full bg-muted-foreground/30"
                  style={{ width: `${dropoffPct.toFixed(1)}%` }}
                />
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
