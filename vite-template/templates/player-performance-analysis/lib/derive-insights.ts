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
  // 1. Workload leader — player with the most running load
  const topRunner = [...playerWorkload].sort(
    (a, b) => b.distanceM - a.distanceM,
  )[0]
  const topSprinter = [...playerWorkload].sort(
    (a, b) => b.sprintCount - a.sprintCount,
  )[0]

  // 2. Condition watchlist
  const watch = conditionSummary.watchlist
  const squadAvg = conditionSummary.squadAverage
  const conditionGap = watch.conditionIndex - squadAvg

  // 3. Match momentum — last two matches compared to first two
  const recentAvg =
    matchTrend.slice(-2).reduce((s, m) => s + m.avgDistanceM, 0) / 2
  const earlyAvg =
    matchTrend.slice(0, 2).reduce((s, m) => s + m.avgDistanceM, 0) / 2
  const momentumPct = ((recentAvg - earlyAvg) / earlyAvg) * 100

  return [
    {
      id: "workload-leader",
      label: "Workload Leader",
      text: `${topRunner.playerName} (${topRunner.position}) leads in distance at ${(topRunner.distanceM / 1000).toFixed(2)} km, while ${topSprinter.playerName} (${topSprinter.position}) tops sprint count at ${topSprinter.sprintCount}. Use rotation to manage exposure across the next fixture window.`,
      sentiment: "positive",
    },
    {
      id: "condition-watch",
      label: "Condition Watchlist",
      text:
        conditionGap < -5
          ? `${watch.playerName} (${watch.position}) sits at ${watch.conditionIndex.toFixed(1)}, ${Math.abs(conditionGap).toFixed(1)} pts below the squad average (${squadAvg.toFixed(1)}). Consider a lighter session or recovery focus.`
          : `${watch.playerName} (${watch.position}) is the lowest-condition outfield player at ${watch.conditionIndex.toFixed(1)}, broadly in line with the squad average (${squadAvg.toFixed(1)}). No immediate action needed.`,
      sentiment: conditionGap < -5 ? "attention" : "neutral",
    },
    {
      id: "match-momentum",
      label: "Match Momentum",
      text: `Across the last 10 matches, average distance has shifted ${momentumPct >= 0 ? "+" : ""}${momentumPct.toFixed(1)}% from the opening fixtures to the most recent two. ${
        momentumPct >= 2
          ? "The squad is trending higher — fitness is building."
          : momentumPct <= -2
            ? "Output has dipped late in the cycle — check fatigue accumulation."
            : "Output is steady across the cycle."
      }`,
      sentiment:
        momentumPct >= 2 ? "positive" : momentumPct <= -2 ? "attention" : "neutral",
    },
  ]
}
