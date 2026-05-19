import { useState } from "react"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"
import { FileText, ShoppingBag, Percent, Clock, AlertCircle } from "lucide-react"
import { DateRangePicker } from "@/components/data/date-range-picker"
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
import { InsightCards } from "@/components/quote-to-order-conversion/insight-cards"
import { KpiCard } from "@/components/quote-to-order-conversion/kpi-card"
import { ConversionFunnel } from "@/components/quote-to-order-conversion/conversion-funnel"
import { ConversionTrendChart } from "@/components/quote-to-order-conversion/conversion-trend"
import { LossReasonsTreemap } from "@/components/quote-to-order-conversion/loss-reasons-treemap"
import {
  headerKpis,
  funnel,
  conversionTrend,
  lossReasons,
} from "@/lib/quote-to-order-conversion-mock-data"
import type { DashboardFilters } from "@/types/quote-to-order-conversion"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfMonth(subMonths(today, 11)),
    to: endOfMonth(today),
  },
}

const kpiIcons = [FileText, ShoppingBag, Percent, Clock, AlertCircle] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Quote-to-Order Conversion</PageShellTitle>
          <PageShellDescription>
            Track quote volume, win rate, lead time, and why deals are lost
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ConversionFunnel data={funnel} />
          <ConversionTrendChart data={conversionTrend} />
        </div>

        <LossReasonsTreemap data={lossReasons} />
      </PageShellContent>
    </PageShell>
  )
}
