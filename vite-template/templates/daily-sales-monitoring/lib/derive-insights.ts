import {
  headerKpis,
  dowHeatmap,
  monthForecast,
  yoyOverlay,
} from "@/lib/daily-sales-monitoring-mock-data"

export interface InsightItem {
  id: "yoy-momentum" | "dow-pattern" | "month-outlook"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

const DAY_LABELS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function deriveInsights(): InsightItem[] {
  // 1. YoY momentum (today)
  const yoyKpi = headerKpis[2]

  // 2. Day-of-week pattern — which day(s) consistently outperform
  const dowSums = new Array(7).fill(0)
  const dowCounts = new Array(7).fill(0)
  for (const cell of dowHeatmap) {
    dowSums[cell.dayOfWeek] += cell.revenue
    dowCounts[cell.dayOfWeek] += 1
  }
  const dowAvg = dowSums.map((s, i) => (dowCounts[i] ? s / dowCounts[i] : 0))
  const overallAvg =
    dowAvg.reduce((s, v) => s + v, 0) / dowAvg.filter((v) => v > 0).length
  let bestDay = 0
  let worstDay = 0
  for (let i = 1; i < 7; i++) {
    if (dowAvg[i] > dowAvg[bestDay]) bestDay = i
    if (dowAvg[i] < dowAvg[worstDay]) worstDay = i
  }
  const bestLift = ((dowAvg[bestDay] - overallAvg) / overallAvg) * 100
  const worstDrop = ((overallAvg - dowAvg[worstDay]) / overallAvg) * 100

  // 3. Month outlook — pace forecast vs target
  const overshoot = monthForecast.pctOfTarget - 100
  const dailyAvg = monthForecast.actualToDate / monthForecast.daysElapsed

  // YoY 30-day average for context in #1
  const yoyDeltaAvg =
    yoyOverlay.reduce((s, p) => s + (p.currentRevenue - p.prevYearRevenue), 0) /
    yoyOverlay.length

  return [
    {
      id: "yoy-momentum",
      label: "YoY Momentum",
      text:
        yoyKpi.change > 5
          ? `Today is tracking ${yoyKpi.change > 0 ? "+" : ""}${yoyKpi.change.toFixed(1)}% YoY, with the trailing 30 days averaging $${Math.round(yoyDeltaAvg).toLocaleString("en-US")} above last year — momentum is strong.`
          : yoyKpi.change >= -2
            ? `Today is ${yoyKpi.change >= 0 ? "+" : ""}${yoyKpi.change.toFixed(1)}% vs last year — broadly in line with last year's pace.`
            : `Today is trailing last year by ${Math.abs(yoyKpi.change).toFixed(1)}%. Review demand drivers (campaigns, weather, holidays) before EOD.`,
      sentiment:
        yoyKpi.change > 5
          ? "positive"
          : yoyKpi.change >= -2
            ? "neutral"
            : "attention",
    },
    {
      id: "dow-pattern",
      label: "Day-of-Week Pattern",
      text: `${DAY_LABELS_EN[bestDay]} runs +${bestLift.toFixed(1)}% above the weekly average, while ${DAY_LABELS_EN[worstDay]} runs -${worstDrop.toFixed(1)}% below. Consider shifting staffing and promotions toward the peak.`,
      sentiment: "neutral",
    },
    {
      id: "month-outlook",
      label: "Month Outlook",
      text: `Day ${monthForecast.daysElapsed}/${monthForecast.daysInMonth} of ${monthForecast.monthLabel}. At the current daily run-rate of $${Math.round(dailyAvg).toLocaleString("en-US")}, the month is projected to land at $${monthForecast.paceForecast.toLocaleString("en-US")} (${overshoot >= 0 ? "+" : ""}${overshoot.toFixed(1)}% vs target).`,
      sentiment:
        overshoot >= 2 ? "positive" : overshoot >= -2 ? "neutral" : "attention",
    },
  ]
}
