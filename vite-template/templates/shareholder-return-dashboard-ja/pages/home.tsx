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
          <PageShellTitle>株主還元ダッシュボード</PageShellTitle>
          <PageShellDescription>
            資本政策を一望する IR / 経営向けビュー
            ─ 配当総額・総還元性向の推移・自社株買いプログラムを年度単位で確認
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
