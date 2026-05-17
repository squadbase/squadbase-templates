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
  // 1. Top course vs bottom course completion gap
  const sorted = [...courseCompletions].sort(
    (a, b) => b.completionRate - a.completionRate,
  )
  const top = sorted[0]
  const bottom = sorted[sorted.length - 1]
  const gap = top.completionRate - bottom.completionRate

  // 2. Engagement gap — share of learners with low activity in last 14 days
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

  // 3. Pass rate
  const totalTests = testScoreBins.reduce((s, b) => s + b.count, 0)
  const passed = testScoreBins
    .filter((b) => b.passed)
    .reduce((s, b) => s + b.count, 0)
  const passRate = (passed / totalTests) * 100

  // Sentiment for completion KPI (used for top-course copy)
  const completionKpi = headerKpis[0]

  // Largest no-start segment for engagement-gap copy
  const largestNoStart = [...noStartSegments].sort(
    (a, b) => b.count - a.count,
  )[0]

  return [
    {
      id: "top-course",
      label: "Top Course",
      text: `${top.courseName} leads at ${top.completionRate.toFixed(1)}% completion, ${gap.toFixed(1)} pts above ${bottom.courseName}. Overall completion is ${completionKpi.value} — review the content design of trailing courses.`,
      sentiment:
        gap < 12 ? "positive" : gap < 25 ? "neutral" : "attention",
    },
    {
      id: "engagement-gap",
      label: "Engagement Gap",
      text: `${lowEngaged} of ${totalLearners} learners logged 3 or fewer active days in the last 14. The largest no-start segment is "${largestNoStart.segment}" (${largestNoStart.count} learners, ${largestNoStart.share.toFixed(1)}%) — prioritize reminders there.`,
      sentiment:
        lowShare < 20 ? "positive" : lowShare < 40 ? "neutral" : "attention",
    },
    {
      id: "pass-rate",
      label: "Test Pass Rate",
      text: `${passRate.toFixed(1)}% of test attempts cleared the 70-point pass line. Of the failing attempts, the 60-69 band makes up the largest share — a small revision could move many learners over the line.`,
      sentiment:
        passRate >= 75 ? "positive" : passRate >= 60 ? "neutral" : "attention",
    },
  ]
}
