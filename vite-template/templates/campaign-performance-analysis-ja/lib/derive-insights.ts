import {
  campaignRoas,
  creatives,
  budgetPacing,
} from "@/lib/campaign-performance-analysis-mock-data"

export interface InsightItem {
  id: "top-roas" | "learning-phase" | "budget-pacing"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. ROAS トップキャンペーン vs ブレンド基準
  const top = campaignRoas[0]
  const blendedRoas =
    campaignRoas.reduce((s, c) => s + c.revenue, 0) /
    campaignRoas.reduce((s, c) => s + c.spend, 0)
  const liftPct = ((top.roas - blendedRoas) / blendedRoas) * 100

  // 2. 学習期間ステータス
  const learning = creatives.filter((c) => c.learningPhase === "learning").length
  const limited = creatives.filter((c) => c.learningPhase === "limited").length
  const active = creatives.filter((c) => c.learningPhase === "active").length
  const learningPct = (learning / creatives.length) * 100
  const limitedPct = (limited / creatives.length) * 100

  // 3. 予算消化進捗
  const ahead = budgetPacing.filter((b) => b.paceStatus === "ahead").length
  const behind = budgetPacing.filter((b) => b.paceStatus === "behind").length
  const fastest = budgetPacing[0]

  return [
    {
      id: "top-roas",
      label: "トップパフォーマー",
      text: `${top.campaignName} (${top.channel}) が ROAS ${top.roas.toFixed(2)}x で 1 位 — ブレンド基準 ${blendedRoas.toFixed(2)}x に対し ${liftPct >= 0 ? "+" : ""}${liftPct.toFixed(0)}%。優先的に予算を寄せる候補。`,
      sentiment: liftPct > 30 ? "positive" : "neutral",
    },
    {
      id: "learning-phase",
      label: "学習期間ステータス",
      text: `${creatives.length} 本中 ${active} 本が学習を抜けて配信中。${learning} 本が学習中 (${learningPct.toFixed(0)}%)、${limited} 本が配信制限 (${limitedPct.toFixed(0)}%)。制限中は停止し、配信中の勝ち筋に予算を寄せる。`,
      sentiment:
        limitedPct > 25 ? "attention" : learningPct < 35 ? "positive" : "neutral",
    },
    {
      id: "budget-pacing",
      label: "予算消化進捗",
      text:
        ahead > behind
          ? `${ahead} キャンペーンが先行消化中 — ${fastest.campaignName} は ${fastest.daysElapsed}/${fastest.daysInPeriod} 日目で ${fastest.pctSpent.toFixed(0)}% 消化。ROAS を維持できているか確認のうえ継続判断を。`
          : behind > ahead
            ? `${behind} キャンペーンが消化遅延。先行消化キャンペーンから振り替えるか、ROAS の高い箇所で日額キャップを引き上げる。`
            : `${budgetPacing.length} キャンペーン全般がオンペース。週末まで現行キャップを維持し、再点検する。`,
      sentiment:
        ahead > behind ? "attention" : behind > ahead ? "attention" : "neutral",
    },
  ]
}
