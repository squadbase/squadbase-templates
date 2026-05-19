import {
  playerWorkload,
  matchTrend,
  conditionSummary,
} from "@/lib/player-performance-analysis-mock-data"

export interface InsightItem {
  id: "workload-leader" | "condition-watch" | "match-momentum"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. ワークロードリーダー — 走行距離トップの選手
  const topRunner = [...playerWorkload].sort(
    (a, b) => b.distanceM - a.distanceM,
  )[0]
  const topSprinter = [...playerWorkload].sort(
    (a, b) => b.sprintCount - a.sprintCount,
  )[0]

  // 2. コンディション要観察
  const watch = conditionSummary.watchlist
  const squadAvg = conditionSummary.squadAverage
  const conditionGap = watch.conditionIndex - squadAvg

  // 3. 試合モメンタム
  const recentAvg =
    matchTrend.slice(-2).reduce((s, m) => s + m.avgDistanceM, 0) / 2
  const earlyAvg =
    matchTrend.slice(0, 2).reduce((s, m) => s + m.avgDistanceM, 0) / 2
  const momentumPct = ((recentAvg - earlyAvg) / earlyAvg) * 100

  return [
    {
      id: "workload-leader",
      label: "ワークロード上位",
      text: `走行距離は ${topRunner.playerName} (${topRunner.position}) が ${(topRunner.distanceM / 1000).toFixed(2)} km でトップ、スプリント回数は ${topSprinter.playerName} (${topSprinter.position}) が ${topSprinter.sprintCount} 回で最多。次節以降に向けたローテーションでの負荷管理を検討したい。`,
      sentiment: "positive",
    },
    {
      id: "condition-watch",
      label: "コンディション要観察",
      text:
        conditionGap < -5
          ? `${watch.playerName} (${watch.position}) のコンディション指標は ${watch.conditionIndex.toFixed(1)} — チーム平均 ${squadAvg.toFixed(1)} を ${Math.abs(conditionGap).toFixed(1)} pt 下回る。練習負荷の軽減・リカバリー優先を検討。`
          : `${watch.playerName} (${watch.position}) のコンディション指標は ${watch.conditionIndex.toFixed(1)} で最も低いが、チーム平均 (${squadAvg.toFixed(1)}) と概ね同水準。直近で特別な対応は不要。`,
      sentiment: conditionGap < -5 ? "attention" : "neutral",
    },
    {
      id: "match-momentum",
      label: "試合モメンタム",
      text: `直近10試合で平均走行距離は ${momentumPct >= 0 ? "+" : ""}${momentumPct.toFixed(1)}% の変化。${
        momentumPct >= 2
          ? "後半に向けてアウトプットが伸びており、フィットネスは仕上がり方向。"
          : momentumPct <= -2
            ? "シーズン後半で出力が落ちている — 疲労蓄積に注意。"
            : "サイクル全体でアウトプットは概ね安定。"
      }`,
      sentiment:
        momentumPct >= 2 ? "positive" : momentumPct <= -2 ? "attention" : "neutral",
    },
  ]
}
