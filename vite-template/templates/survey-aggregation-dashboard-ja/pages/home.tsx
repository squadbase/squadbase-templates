import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
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
import { InsightCards } from "@/components/survey-aggregation-dashboard/insight-cards"
import { QuestionAggregationChart } from "@/components/survey-aggregation-dashboard/question-aggregation-chart"
import { NpsCsatTrendChart } from "@/components/survey-aggregation-dashboard/nps-csat-trend-chart"
import { SegmentScoreGapChart } from "@/components/survey-aggregation-dashboard/segment-score-gap-chart"
import { FreeTextTagChart } from "@/components/survey-aggregation-dashboard/free-text-tag-chart"
import {
  questionAggregations,
  trendSeries,
  segmentScores,
  freeTextTags,
  segmentOptions,
  questionOptions,
} from "@/lib/survey-aggregation-dashboard-mock-data"
import type { DashboardFilters } from "@/types/survey-aggregation-dashboard"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 89)), to: endOfDay(today) },
  segment: "all",
  question: "all",
}

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    segment: filters.segment,
    question: filters.question,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>アンケート集計ダッシュボード</PageShellTitle>
          <PageShellDescription>
            回答数・NPS・CSAT・設問別スコア・属性別の差・自由記述テーマを一画面で把握
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
              segment: next.segment as string | undefined,
              question: next.question as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="segment"
            label="セグメント"
            options={segmentOptions}
          />
          <FilterBarSelect
            filterKey="question"
            label="設問"
            options={questionOptions}
          />
        </FilterBar>

        <QuestionAggregationChart data={questionAggregations} />

        <NpsCsatTrendChart data={trendSeries} />

        <div className="grid gap-4 lg:grid-cols-2">
          <SegmentScoreGapChart data={segmentScores} />
          <FreeTextTagChart data={freeTextTags} />
        </div>
      </PageShellContent>
    </PageShell>
  )
}
