import {
  atRiskCustomers,
  churnRateTrend,
  frequencyDecline,
  headerKpis,
} from "@/lib/churn-prediction-monitor-mock-data"

export interface InsightItem {
  id: "critical-risk" | "frequency-signal" | "save-momentum"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. クリティカル階層の集中度
  const critical = atRiskCustomers.filter((c) => c.risk_tier === "critical")
  const criticalEnterprise = critical.filter((c) => c.segment === "enterprise")
    .length

  // 2. 頻度シグナル — クリティカル階層の今週の落ち込みを古い週と比較
  const criticalCells = frequencyDecline.filter(
    (c) => c.riskTier === "critical",
  )
  const currentWeek = criticalCells.find((c) => c.weeksAgoBucket === 0)
  const olderAvg =
    criticalCells
      .filter((c) => c.weeksAgoBucket >= 6)
      .reduce((s, c) => s + c.declinePct, 0) /
    Math.max(1, criticalCells.filter((c) => c.weeksAgoBucket >= 6).length)
  const accelDelta = currentWeek
    ? Math.abs(currentWeek.declinePct) - Math.abs(olderAvg)
    : 0

  // 3. 救済成功率のモメンタム (直近 3 か月 vs その前 3 か月)
  const recent3 = churnRateTrend.slice(-3)
  const prior3 = churnRateTrend.slice(-6, -3)
  const recentSave =
    recent3.reduce((s, p) => s + p.saveRate, 0) / recent3.length
  const priorSave =
    prior3.reduce((s, p) => s + p.saveRate, 0) / prior3.length
  const saveDelta = recentSave - priorSave
  const churnKpi = headerKpis[0]

  return [
    {
      id: "critical-risk",
      label: "クリティカル階層の集中度",
      text:
        critical.length === 0
          ? "現時点でクリティカル階層の顧客はいません。週次の頻度ダウンを継続監視。"
          : `クリティカル階層に ${critical.length} 社 (うちエンタープライズ ${criticalEnterprise} 社)。離反確定前に今週中の CS アウトリーチを優先したい。`,
      sentiment:
        critical.length === 0
          ? "positive"
          : criticalEnterprise > 0
            ? "attention"
            : "neutral",
    },
    {
      id: "frequency-signal",
      label: "頻度シグナル",
      text:
        accelDelta > 4
          ? `クリティカル階層の週次発注頻度が、6 週以上前より ${accelDelta.toFixed(1)}pt 速いペースで落ち込み中 — 離反圧力は加速。`
          : accelDelta < -2
            ? `クリティカル階層の頻度ダウンは古い週より ${Math.abs(accelDelta).toFixed(1)}pt 鈍化 — 直近の救済策が効いている可能性。`
            : `クリティカル階層の頻度ダウンは直近と概ね同水準 (${currentWeek?.declinePct.toFixed(1) ?? "0"}%)。新規流入を要監視。`,
      sentiment:
        accelDelta > 4 ? "attention" : accelDelta < -2 ? "positive" : "neutral",
    },
    {
      id: "save-momentum",
      label: "救済モメンタム",
      text: `直近 3 か月平均の救済成功率は ${recentSave.toFixed(1)}% (前 3 か月比 ${saveDelta >= 0 ? "+" : ""}${saveDelta.toFixed(1)}pt)。月次チャーン率は ${churnKpi.value} (前月比 ${churnKpi.change >= 0 ? "+" : ""}${churnKpi.change.toFixed(1)}%)。`,
      sentiment:
        saveDelta >= 1.5 ? "positive" : saveDelta <= -1 ? "attention" : "neutral",
    },
  ]
}
