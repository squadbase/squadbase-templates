import { useState } from "react"
import { subDays } from "date-fns"
import { DollarSign, Users, Activity, ShoppingCart } from "lucide-react"
import { DateRangePicker } from "@/components/data/date-range-picker"
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
import { KpiCard } from "@/components/ui-template-kpi-chart-simple/kpi-card"
import { TrendChart } from "@/components/ui-template-kpi-chart-simple/trend-chart"
import { TopItemsTable } from "@/components/ui-template-kpi-chart-simple/top-items-table"
import {
  headerKpis,
  trendSeries,
  topItems,
} from "@/lib/ui-template-kpi-chart-simple-mock-data"
import type { DashboardFilters } from "@/types/ui-template-kpi-chart-simple"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: subDays(today, 29),
    to: today,
  },
}

const kpiIcons = [DollarSign, Users, Activity, ShoppingCart] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

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
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.id} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <TrendChart data={trendSeries} />

        <TopItemsTable data={topItems} />
      </PageShellContent>
    </PageShell>
  )
}
