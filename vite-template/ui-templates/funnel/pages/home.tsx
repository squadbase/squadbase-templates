import { useState } from "react"
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
import { Placeholder } from "@/components/common/placeholder"
import { FunnelChart } from "@/components/ui-template-funnel/funnel-chart"
import { StageTable } from "@/components/ui-template-funnel/stage-table"
import {
  funnelStages,
  stageRows,
} from "@/lib/ui-template-funnel-mock-data"

const today = new Date()

const STAGE_NAMES = ["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5"]

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

type DisplayMode = "count" | "percent"

export default function HomePage() {
  const [dateRange, setDateRange] = useState({
    from: subDays(today, 29) as Date | undefined,
    to: today as Date | undefined,
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
          <ToggleGroup
            type="single"
            value={display}
            onValueChange={(v) => v && setDisplay(v as DisplayMode)}
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
              <FunnelChart
                data={funnelStages}
                labels={STAGE_NAMES}
                height="440px"
                display={display}
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
