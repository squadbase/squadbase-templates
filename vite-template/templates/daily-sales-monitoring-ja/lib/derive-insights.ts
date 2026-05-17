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

const DAY_LABELS_JA = ["月", "火", "水", "木", "金", "土", "日"]

export function deriveInsights(): InsightItem[] {
  // 1. 前年同日比 (今日)
  const yoyKpi = headerKpis[2]

  // 2. 曜日傾向 — どの曜日が安定的に強いか
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

  // 3. 月次着地予測
  const overshoot = monthForecast.pctOfTarget - 100
  const dailyAvg = monthForecast.actualToDate / monthForecast.daysElapsed

  // 1. の補足: 直近 30 日の前年差分平均
  const yoyDeltaAvg =
    yoyOverlay.reduce((s, p) => s + (p.currentRevenue - p.prevYearRevenue), 0) /
    yoyOverlay.length

  return [
    {
      id: "yoy-momentum",
      label: "前年比モメンタム",
      text:
        yoyKpi.change > 5
          ? `本日は前年同日比 ${yoyKpi.change > 0 ? "+" : ""}${yoyKpi.change.toFixed(1)}% で推移。直近30日平均でも前年比 +¥${Math.round(yoyDeltaAvg).toLocaleString("ja-JP")} 上回っており、勢いは継続中。`
          : yoyKpi.change >= -2
            ? `本日は前年比 ${yoyKpi.change >= 0 ? "+" : ""}${yoyKpi.change.toFixed(1)}% — 概ね前年同水準。`
            : `本日は前年比 ${yoyKpi.change.toFixed(1)}% と下振れ。需要要因 (販促・天候・祝日要因) を退勤までに点検したい。`,
      sentiment:
        yoyKpi.change > 5
          ? "positive"
          : yoyKpi.change >= -2
            ? "neutral"
            : "attention",
    },
    {
      id: "dow-pattern",
      label: "曜日傾向",
      text: `${DAY_LABELS_JA[bestDay]}曜が全体平均比 +${bestLift.toFixed(1)}% と高く、${DAY_LABELS_JA[worstDay]}曜は ${worstDrop.toFixed(1)}% 下振れ。シフト・販促をピーク曜日に寄せる余地あり。`,
      sentiment: "neutral",
    },
    {
      id: "month-outlook",
      label: "月次着地見通し",
      text: `${monthForecast.monthLabel} の経過 ${monthForecast.daysElapsed}/${monthForecast.daysInMonth} 日。直近の日次平均 ¥${Math.round(dailyAvg).toLocaleString("ja-JP")} のペースが続けば、着地は ¥${monthForecast.paceForecast.toLocaleString("ja-JP")} (目標比 ${overshoot >= 0 ? "+" : ""}${overshoot.toFixed(1)}%) の見込み。`,
      sentiment:
        overshoot >= 2 ? "positive" : overshoot >= -2 ? "neutral" : "attention",
    },
  ]
}
