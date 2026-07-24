import { useState } from "react"
import { subDays } from "date-fns"
import { TrendingDown, TrendingUp, Users, Target } from "lucide-react"
import { definePage } from "@squadbase/vantage"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
  DashboardCardPreset,
  DateRangePicker,
  EChart,
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellContent,
} from "@squadbase/vantage/components"
import type { DateRange, EChartsOption } from "@squadbase/vantage/components"
import { ToggleGroup, ToggleGroupItem } from "@squadbase/vantage/ui"

import { Placeholder } from "./components/placeholder.js"
import { StageTable } from "./components/funnel/stage-table.js"
import { funnelStages, stageRows } from "./components/funnel/mock-data.js"
import type { FunnelStage } from "./components/funnel/types.js"

export const page = definePage({
  title: "Funnel",
  description:
    "Pipeline-centric layout: summary KPIs, a single-tone funnel chart with a per-stage sidebar, and a stage-performance table.",
})

const today = new Date()

const STAGE_NAMES = ["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5"]

/**
 * ECharts draws on a canvas and cannot read CSS variables, so the funnel
 * palette is spelled out here. Swap these for your brand colours.
 */
const FUNNEL_COLORS = [
  "rgba(59, 130, 246, 1)",
  "rgba(59, 130, 246, 0.82)",
  "rgba(59, 130, 246, 0.66)",
  "rgba(59, 130, 246, 0.5)",
  "rgba(59, 130, 246, 0.36)",
]
const LABEL_COLOR = "#71717a"

type DisplayMode = "count" | "percent"

function funnelOption(
  data: FunnelStage[],
  labels: string[],
  display: DisplayMode,
): EChartsOption {
  const max = data[0]?.value ?? 0

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
                : params.value.toLocaleString("en-US")
            return `{name|${params.name}}\n{value|${main}}`
          },
          rich: {
            name: {
              fontSize: 12,
              fontWeight: 600,
              color: LABEL_COLOR,
              lineHeight: 16,
              align: "center",
            },
            value: {
              fontSize: 11,
              color: LABEL_COLOR,
              opacity: 0.6,
              lineHeight: 14,
              align: "center",
            },
          },
        },
        labelLine: { show: false },
        data: data.map((d, i) => ({
          name: labels[i] ?? "",
          value: d.value,
          conversionRate: d.conversionRate,
          share: (d.value / Math.max(1, max)) * 100,
          itemStyle: { color: FUNNEL_COLORS[i % FUNNEL_COLORS.length] },
        })),
      },
    ] as EChartsOption["series"],
  }
}

const summaryCards = [
  {
    label: "Entered",
    value: "124,500",
    sub: "Total entering the funnel",
    icon: <Users className="size-4 text-muted-foreground" />,
  },
  {
    label: "Converted",
    value: "1,186",
    sub: "Completed conversions",
    icon: <Target className="size-4 text-muted-foreground" />,
  },
  {
    label: "Best step",
    value: "31.9%",
    sub: "Highest step conversion",
    icon: <TrendingUp className="size-4 text-emerald-600" />,
  },
  {
    label: "Biggest drop",
    value: "68.2%",
    sub: "Largest step drop-off",
    icon: <TrendingDown className="size-4 text-rose-600" />,
  },
]

export default function HomePage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(today, 29),
    to: today,
  })
  const [display, setDisplay] = useState<DisplayMode>("count")

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>[Template] Conversion funnel</PageShellTitle>
          <PageShellDescription>
            Stage-by-stage conversion for the selected period.
          </PageShellDescription>
        </PageShellHeading>
        <PageShellHeaderEnd className="flex-row items-center gap-2">
          {/* Base UI toggle groups are always multi-value — keep the array at length 1. */}
          <ToggleGroup
            value={[display]}
            onValueChange={(value) => {
              const next = value[0]
              if (next) setDisplay(next as DisplayMode)
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="count">Option A</ToggleGroupItem>
            <ToggleGroupItem value="percent">Option B</ToggleGroupItem>
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
              title="Conversion funnel"
              description="Stage-by-stage conversion"
            >
              <EChart
                option={funnelOption(funnelStages, STAGE_NAMES, display)}
                height="440px"
              />
            </DashboardCardPreset>
          </div>
          <DashboardCardPreset title="Stages" description="Conversion by stage">
            <StagesSidebar />
          </DashboardCardPreset>
        </div>

        <DashboardCardPreset
          title="Stage breakdown"
          description="Conversion between stages"
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
                {s.value.toLocaleString("en-US")}
              </Placeholder>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <span>Conversion rate</span>
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
