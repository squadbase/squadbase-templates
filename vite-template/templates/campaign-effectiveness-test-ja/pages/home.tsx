import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  JapaneseYen,
  TrendingUp,
  Ticket,
  Target,
  Users,
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
import { InsightCards } from "@/components/campaign-effectiveness-test/insight-cards"
import { KpiCard } from "@/components/campaign-effectiveness-test/kpi-card"
import { PrePostComparisonChart } from "@/components/campaign-effectiveness-test/pre-post-comparison-chart"
import { RoiRankingTable } from "@/components/campaign-effectiveness-test/roi-ranking-table"
import { CouponRedemptionTable } from "@/components/campaign-effectiveness-test/coupon-redemption-table"
import {
  headerKpis,
  prePostSeries,
  campaignRoi,
  couponRedemption,
  channelOptions,
  confidenceOptions,
} from "@/lib/campaign-effectiveness-test-mock-data"
import type { DashboardFilters } from "@/types/campaign-effectiveness-test"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 41)), to: endOfDay(today) },
  channel: "all",
  confidence: "all",
}

const kpiIcons = [JapaneseYen, TrendingUp, Ticket, Target, Users] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    channel: filters.channel,
    confidence: filters.confidence,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>キャンペーン効果検証</PageShellTitle>
          <PageShellDescription>
            露出群 (テスト) と未露出群 (コントロール) を比較してリフトを定量化、ROI とクーポン消化率でキャンペーンの効果を評価
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
              channel: next.channel as string | undefined,
              confidence: next.confidence as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="channel"
            label="チャネル"
            options={channelOptions}
          />
          <FilterBarSelect
            filterKey="confidence"
            label="信頼度"
            options={confidenceOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <PrePostComparisonChart data={prePostSeries} />

        <RoiRankingTable data={campaignRoi} />

        <CouponRedemptionTable data={couponRedemption} />
      </PageShellContent>
    </PageShell>
  )
}
