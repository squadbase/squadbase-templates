import { useState } from "react"
import { subDays } from "date-fns"
import type { EChartsOption } from "echarts"
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
import { Placeholder } from "@/components/common/placeholder"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { StageTable } from "@/templates/funnel/stage-table"
import { funnelStages, stageRows } from "@/templates/funnel/mock-data"
import type { FunnelStage } from "@/templates/funnel/types"

const today = new Date()

const STAGE_NAMES = ["ステージ1", "ステージ2", "ステージ3", "ステージ4", "ステージ5"]

type DisplayMode = "count" | "percent"

function funnelOption(
  data: FunnelStage[],
  labels: string[],
  display: DisplayMode,
  baseColor: string,
  labelColor: string,
): EChartsOption {
  const max = data[0]?.value ?? 0

  const alphas = [1, 0.82, 0.66, 0.5, 0.36]
  const palette = alphas.map((a) => (a === 1 ? baseColor : withAlpha(baseColor, a)))

  return {
    tooltip: { trigger: "item" },
    series: [
      {
        type: "funnel",
        orient: "horizontal",
        funnelAlign: "center",
        left: "2%",
        right: "2%",
        top: 16,
        bottom: 64,
        min: 0,
        max,
        sort: "descending",
        gap: 4,
        label: {
          show: true,
          position: "bottom",
          formatter: (p: unknown) => {
            const params = p as {
              name: string
              value: number
              data: { conversionRate: number; share: number }
            }
            const main =
              display === "percent"
                ? `${params.data.share.toFixed(1)}%`
                : params.value.toLocaleString("ja-JP")
            return `{name|${params.name}}\n{value|${main}}`
          },
          rich: {
            name: {
              fontSize: 12,
              fontWeight: 600,
              color: labelColor,
              lineHeight: 16,
              align: "center",
            },
            value: {
              fontSize: 11,
              color: labelColor,
              opacity: 0.6,
              lineHeight: 14,
              align: "center",
            },
          },
        },
        labelLine: { show: false },
        data: data.map((d, i) => ({
          name: labels[i],
          value: d.value,
          conversionRate: d.conversionRate,
          share: (d.value / Math.max(1, max)) * 100,
          itemStyle: { color: palette[i % palette.length] },
        })),
      },
    ] as EChartsOption["series"],
  }
}

const summaryCards = [
  {
    label: "流入数",
    value: "124,500",
    sub: "ファネルへの総流入数",
    icon: <Users className="size-4 text-muted-foreground" />,
  },
  {
    label: "コンバージョン数",
    value: "1,186",
    sub: "完了したコンバージョン",
    icon: <Target className="size-4 text-muted-foreground" />,
  },
  {
    label: "最良ステップ",
    value: "31.9%",
    sub: "最も高いステップ転換率",
    icon: <TrendingUp className="size-4 text-emerald-600" />,
  },
  {
    label: "最大の離脱",
    value: "68.2%",
    sub: "最大のステップ離脱率",
    icon: <TrendingDown className="size-4 text-rose-600" />,
  },
]

export default function HomePage() {
  const [dateRange, setDateRange] = useState({
    from: subDays(today, 29) as Date | undefined,
    to: today as Date | undefined,
  })
  const [display, setDisplay] = useState<DisplayMode>("count")
  const baseColor = useEChartsContrastColor("--chart-1")
  const labelColor = useEChartsContrastColor("--foreground")

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>[テンプレート] コンバージョンファネル</PageShellTitle>
          <PageShellDescription>
            選択期間のステージ別コンバージョン。
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
            <ToggleGroupItem value="count">選択肢A</ToggleGroupItem>
            <ToggleGroupItem value="percent">選択肢B</ToggleGroupItem>
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
          {summaryCards.map(({ label, value, sub, icon }) => (
            <DashboardCard key={label}>
              <DashboardCardHeader>
                <DashboardCardTitle className="text-muted-foreground">
                  {label}
                </DashboardCardTitle>
                <DashboardCardAction>{icon}</DashboardCardAction>
              </DashboardCardHeader>
              <DashboardCardContent>
                <Placeholder className="text-2xl font-bold">{value}</Placeholder>
                <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
              </DashboardCardContent>
            </DashboardCard>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardCardPreset
              title="コンバージョンファネル"
              description="ステージ別コンバージョン"
            >
              <EChart
                option={funnelOption(
                  funnelStages,
                  STAGE_NAMES,
                  display,
                  baseColor,
                  labelColor,
                )}
                height="440px"
              />
            </DashboardCardPreset>
          </div>
          <DashboardCardPreset title="ステージ" description="ステージ別コンバージョン">
            <StagesSidebar />
          </DashboardCardPreset>
        </div>

        <DashboardCardPreset
          title="ステージ内訳"
          description="ステージ間のコンバージョン"
        >
          <StageTable data={stageRows} />
        </DashboardCardPreset>
      </PageShellContent>
    </PageShell>
  )
}

function StagesSidebar() {
  return (
    <ol className="space-y-4">
      {funnelStages.map((s, i) => {
        const prev = i > 0 ? funnelStages[i - 1] : null
        const dropoffPct = prev ? ((prev.value - s.value) / prev.value) * 100 : 0
        return (
          <li key={i} className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-sm font-medium">{STAGE_NAMES[i]}</span>
              </div>
              <Placeholder className="text-sm font-medium">
                {s.value.toLocaleString("ja-JP")}
              </Placeholder>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <span>転換率</span>
              <div className="flex justify-end">
                <Placeholder>{`${s.conversionRate.toFixed(1)}%`}</Placeholder>
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
