import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  Users,
  ShoppingCart,
  CreditCard,
  Target,
  DollarSign,
} from "lucide-react"
import { DateRangePicker } from "@/components/data/date-range-picker"
import { FilterBar, FilterBarSelect } from "@/components/data/filter-bar"
import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellSummary,
  PageShellContent,
} from "@/components/common/page-shell"
import { InsightCards } from "@/components/ec-conversion-funnel/insight-cards"
import { KpiCard } from "@/components/ec-conversion-funnel/kpi-card"
import { ConversionFunnel } from "@/components/ec-conversion-funnel/conversion-funnel"
import { DeviceCvrChart } from "@/components/ec-conversion-funnel/device-cvr-chart"
import { ExitPagesTable } from "@/components/ec-conversion-funnel/exit-pages-table"
import {
  headerKpis,
  conversionFunnel,
  deviceCvr,
  exitPages,
  deviceOptions,
} from "@/lib/ec-conversion-funnel-mock-data"
import type { DashboardFilters } from "@/types/ec-conversion-funnel"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
  device: "all",
}

const kpiIcons = [Users, ShoppingCart, CreditCard, Target, DollarSign] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    device: filters.device,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>EC Conversion Funnel</PageShellTitle>
          <PageShellDescription>
            Visit-to-purchase funnel, device-level CVR comparison, and the
            biggest exit pages — for EC managers and growth teams
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
          <InsightCards />
        </PageShellSummary>
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        <FilterBar
          value={filterValues}
          onChange={(next) =>
            setFilters((prev) => ({
              ...prev,
              device: next.device as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="device"
            label="Device"
            options={deviceOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <ConversionFunnel data={conversionFunnel} />

        <DeviceCvrChart data={deviceCvr} />

        <ExitPagesTable data={exitPages} />
      </PageShellContent>
    </PageShell>
  )
}
