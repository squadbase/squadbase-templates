import { useState } from "react"
import {
  DollarSign,
  PieChart,
  Cpu,
  ArrowRightLeft,
} from "lucide-react"
import { FilterBar, FilterBarSelect } from "@/components/data/filter-bar"
import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellSummary,
  PageShellContent,
} from "@/components/common/page-shell"
import { InsightCards } from "@/components/ai-cloud-cost-analysis/insight-cards"
import { KpiCard } from "@/components/ai-cloud-cost-analysis/kpi-card"
import { ServiceStackedChart } from "@/components/ai-cloud-cost-analysis/service-stacked-chart"
import { ModelTokenCostChart } from "@/components/ai-cloud-cost-analysis/model-token-cost-chart"
import { ResourceTopTable } from "@/components/ai-cloud-cost-analysis/resource-top-table"
import {
  headerKpis,
  serviceMonthly,
  serviceLabels,
  modelTokenCost,
  resourceTop,
  serviceOptions,
  monthOptions,
} from "@/lib/ai-cloud-cost-analysis-mock-data"
import type { DashboardFilters } from "@/types/ai-cloud-cost-analysis"

const initialFilters: DashboardFilters = {
  service: "all",
  month: "all",
}

const kpiIcons = [DollarSign, PieChart, Cpu, ArrowRightLeft] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    service: filters.service,
    month: filters.month,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>AI / Cloud Cost Analysis</PageShellTitle>
          <PageShellDescription>
            Monthly cloud spend by service, AI model token cost, and the top
            cost-driving resources
          </PageShellDescription>
        </PageShellHeading>
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
              service: next.service as string | undefined,
              month: next.month as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="service"
            label="Service"
            options={serviceOptions}
          />
          <FilterBarSelect
            filterKey="month"
            label="Month"
            options={monthOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <ServiceStackedChart data={serviceMonthly} services={serviceLabels} />

        <ModelTokenCostChart data={modelTokenCost} />

        <ResourceTopTable data={resourceTop} />
      </PageShellContent>
    </PageShell>
  )
}
