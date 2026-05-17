import {
  mrRanking,
  facilityRxSeries,
  uncoveredFacilities,
  coverageStats,
  headerKpis,
} from "@/lib/mr-activity-dashboard-mock-data"

export interface InsightItem {
  id: "top-mr" | "facility-momentum" | "coverage-gap"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. トップ MR
  const topMr = mrRanking[0]
  const teamAvgVisits =
    mrRanking.reduce((s, r) => s + r.visits, 0) / mrRanking.length
  const topLift = ((topMr.visits - teamAvgVisits) / teamAvgVisits) * 100

  // 2. 処方シェアモメンタムが最も強い施設
  let bestFacility = facilityRxSeries[0]
  let bestDelta = -Infinity
  for (const fac of facilityRxSeries) {
    const first = fac.data[0]?.rxShare ?? 0
    const last = fac.data[fac.data.length - 1]?.rxShare ?? 0
    const delta = last - first
    if (delta > bestDelta) {
      bestDelta = delta
      bestFacility = fac
    }
  }

  // 3. カバレッジギャップ
  const coverageKpi = headerKpis[3]
  const keyAccountUncovered = uncoveredFacilities.filter(
    (f) => f.segment === "key_account",
  ).length
  const oldestGap = uncoveredFacilities[0]?.daysSinceLastVisit ?? 0

  return [
    {
      id: "top-mr",
      label: "今期トップMR",
      text: `${topMr.mrName} (${topMr.territory}) が訪問件数 ${topMr.visits} 件で首位 — チーム平均比 +${topLift.toFixed(0)}%、平均処方シェア ${topMr.avgRxShare.toFixed(1)}%。同 MR の訪問サイクルを横展開する余地あり。`,
      sentiment: "positive",
    },
    {
      id: "facility-momentum",
      label: "施設シェアモメンタム",
      text:
        bestDelta > 2
          ? `${bestFacility.facilityName} の処方シェアは直近12週で +${bestDelta.toFixed(1)} pt と最大の上昇幅。現行の訪問頻度を維持して取り込みを定着させたい。`
          : bestDelta >= -1
            ? `カバー対象施設のシェアは概ね横ばい (最大の上昇は ${bestFacility.facilityName} の ${bestDelta >= 0 ? "+" : ""}${bestDelta.toFixed(1)} pt)。`
            : `主要施設でシェアが低下傾向 (最も大きい変動は ${bestFacility.facilityName} の ${bestDelta.toFixed(1)} pt)。メッセージング・競合動向の点検が必要。`,
      sentiment: bestDelta > 2 ? "positive" : bestDelta >= -1 ? "neutral" : "attention",
    },
    {
      id: "coverage-gap",
      label: "カバレッジギャップ",
      text: `全 ${coverageStats.total} 施設のうち ${coverageStats.uncovered} 施設が未カバー (カバレッジ ${coverageKpi.value})。重点施設のうち ${keyAccountUncovered} 件が${oldestGap >= 30 ? "1ヶ月以上" : "3週間以上"}訪問できておらず、四半期末までに再接点を取りたい。`,
      sentiment: keyAccountUncovered >= 2 ? "attention" : "neutral",
    },
  ]
}
