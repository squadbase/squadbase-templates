import {
  courseCompletions,
  learnerActivity,
  testScoreBins,
  noStartSegments,
  headerKpis,
} from "@/lib/learning-progress-dashboard-mock-data"

export interface InsightItem {
  id: "top-course" | "engagement-gap" | "pass-rate"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. 完了率の最上位・最下位コース差
  const sorted = [...courseCompletions].sort(
    (a, b) => b.completionRate - a.completionRate,
  )
  const top = sorted[0]
  const bottom = sorted[sorted.length - 1]
  const gap = top.completionRate - bottom.completionRate

  // 2. エンゲージメント乖離 — 直近14日でアクティビティが低い受講者の比率
  const totalLearners = new Set(learnerActivity.map((c) => c.learnerIndex)).size
  const activeByLearner = new Map<number, number>()
  for (const c of learnerActivity) {
    activeByLearner.set(
      c.learnerIndex,
      (activeByLearner.get(c.learnerIndex) ?? 0) +
        (c.progressDelta > 0 ? 1 : 0),
    )
  }
  let lowEngaged = 0
  for (const v of activeByLearner.values()) {
    if (v <= 3) lowEngaged += 1
  }
  const lowShare = (lowEngaged / totalLearners) * 100

  // 3. 合格率
  const totalTests = testScoreBins.reduce((s, b) => s + b.count, 0)
  const passed = testScoreBins
    .filter((b) => b.passed)
    .reduce((s, b) => s + b.count, 0)
  const passRate = (passed / totalTests) * 100

  // top-course コメント用に完了率 KPI を参照
  const completionKpi = headerKpis[0]

  // engagement-gap コメント用に最大の未着手セグメントを抽出
  const largestNoStart = [...noStartSegments].sort(
    (a, b) => b.count - a.count,
  )[0]

  return [
    {
      id: "top-course",
      label: "トップコース",
      text: `「${top.courseName}」が完了率 ${top.completionRate.toFixed(1)}% でトップ。最下位「${bottom.courseName}」とは ${gap.toFixed(1)} pt 差。全体の受講完了率は ${completionKpi.value} — 下位コースのコンテンツ設計を見直す余地あり。`,
      sentiment:
        gap < 12 ? "positive" : gap < 25 ? "neutral" : "attention",
    },
    {
      id: "engagement-gap",
      label: "エンゲージメント乖離",
      text: `直近14日でアクティブ日数が3日以下の受講者は ${totalLearners} 名中 ${lowEngaged} 名。最大の未着手セグメントは「${largestNoStart.segment}」(${largestNoStart.count} 名・${largestNoStart.share.toFixed(1)}%) — 優先的にリマインドしたい。`,
      sentiment:
        lowShare < 20 ? "positive" : lowShare < 40 ? "neutral" : "attention",
    },
    {
      id: "pass-rate",
      label: "テスト合格率",
      text: `合格点 70 点を超えた受験は全体の ${passRate.toFixed(1)}%。不合格の中では 60-69 点帯が最大ボリュームで、設問の微修正で多くを合格圏に押し上げられる可能性あり。`,
      sentiment:
        passRate >= 75 ? "positive" : passRate >= 60 ? "neutral" : "attention",
    },
  ]
}
