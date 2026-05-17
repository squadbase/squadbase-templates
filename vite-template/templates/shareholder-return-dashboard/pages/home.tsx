import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellSummary,
  PageShellContent,
} from "@/components/common/page-shell"
import { InsightCards } from "@/components/shareholder-return-dashboard/insight-cards"
import { DividendBarChart } from "@/components/shareholder-return-dashboard/dividend-bar-chart"
import { PayoutRatioTrendChart } from "@/components/shareholder-return-dashboard/payout-ratio-trend-chart"
import { BuybackTimelineChart } from "@/components/shareholder-return-dashboard/buyback-timeline-chart"
import {
  annualSeries,
  buybackEvents,
} from "@/lib/shareholder-return-dashboard-mock-data"

export default function HomePage() {
  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Shareholder Return Dashboard</PageShellTitle>
          <PageShellDescription>
            Capital return policy at a glance — dividend totals, total payout ratio
            trends, and share buyback programs for IR and executive review
          </PageShellDescription>
        </PageShellHeading>
        <PageShellSummary>
          <InsightCards />
        </PageShellSummary>
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        <DividendBarChart data={annualSeries} />

        <PayoutRatioTrendChart data={annualSeries} />

        <BuybackTimelineChart events={buybackEvents} />
      </PageShellContent>
    </PageShell>
  )
}
