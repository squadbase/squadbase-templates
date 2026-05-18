import { useState } from "react"
import { subDays } from "date-fns"
import { TrendingDown, TrendingUp, Users, Target } from "lucide-react"
import { DateRangePicker } from "@/components/data/date-range-picker"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardAction,
  DashboardCardContent,
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
import { Skeleton } from "@/components/ui/skeleton"
import { FunnelChart } from "@/components/ui-template-funnel/funnel-chart"
import { StageTable } from "@/components/ui-template-funnel/stage-table"
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

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>
            <Skeleton className="h-7 w-64" />
          </PageShellTitle>
          <PageShellDescription>
            <Skeleton className="mt-2 h-4 w-96" />
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
          <SummaryCard
            icon={<Users className="size-4 text-muted-foreground" />}
          />
          <SummaryCard
            icon={<Target className="size-4 text-muted-foreground" />}
          />
          <SummaryCard
            icon={<TrendingUp className="size-4 text-emerald-600" />}
          />
          <SummaryCard
            icon={<TrendingDown className="size-4 text-rose-600" />}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FunnelChart data={funnelStages} height="440px" display={display} />
          </div>
          <DashboardCard>
            <DashboardCardHeader>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3.5 w-48" />
              </div>
            </DashboardCardHeader>
            <DashboardCardContent>
              <StagesSidebar />
            </DashboardCardContent>
          </DashboardCard>
        </div>

        <StageTable data={stageRows} />
      </PageShellContent>
    </PageShell>
  )
}

interface SummaryCardProps {
  icon: React.ReactNode
}

function SummaryCard({ icon }: SummaryCardProps) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <Skeleton className="h-4 w-28" />
        <DashboardCardAction>{icon}</DashboardCardAction>
      </DashboardCardHeader>
      <DashboardCardContent>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="mt-2 h-3 w-40" />
      </DashboardCardContent>
    </DashboardCard>
  )
}

function StagesSidebar() {
  return (
    <ol className="space-y-4">
      {funnelStages.map((s, i) => {
        const prev = i > 0 ? funnelStages[i - 1] : null
        const dropoffPct = prev ? ((prev.value - s.value) / prev.value) * 100 : 0
        return (
          <li key={s.stage} className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-3 w-24" />
              <div className="flex justify-end">
                <Skeleton className="h-3 w-20" />
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
