import type {
  PlayerWorkloadRow,
  MatchPerformancePoint,
  PositionHeatmapCell,
  KpiItem,
  ConditionSummary,
  Position,
} from "@/types/player-performance-analysis"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-15")

function dateStr(daysAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(31)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── ロスター ──

interface Player {
  id: string
  name: string
  position: Position
}

const ROSTER: Player[] = [
  { id: "P01", name: "高橋 蓮", position: "GK" },
  { id: "P02", name: "佐藤 海斗", position: "DF" },
  { id: "P03", name: "鈴木 一輝", position: "DF" },
  { id: "P04", name: "中村 翔太", position: "DF" },
  { id: "P05", name: "岩田 隆", position: "DF" },
  { id: "P06", name: "山本 涼平", position: "MF" },
  { id: "P07", name: "井上 拓海", position: "MF" },
  { id: "P08", name: "渡辺 健", position: "MF" },
  { id: "P09", name: "藤井 大輔", position: "MF" },
  { id: "P10", name: "森田 颯", position: "FW" },
  { id: "P11", name: "石川 慎", position: "FW" },
  { id: "P12", name: "田中 雄太", position: "FW" },
]

// ポジション別の 90 分換算ベースライン
const POSITION_BASE: Record<
  Position,
  { distance: number; sprint: number; minutes: number; condition: number }
> = {
  GK: { distance: 4200, sprint: 4, minutes: 90, condition: 82 },
  DF: { distance: 9800, sprint: 18, minutes: 88, condition: 78 },
  MF: { distance: 11400, sprint: 24, minutes: 82, condition: 74 },
  FW: { distance: 10500, sprint: 32, minutes: 75, condition: 71 },
}

// ── 選手別ワークロード ──

function generatePlayerWorkload(): PlayerWorkloadRow[] {
  return ROSTER.map((p) => {
    const base = POSITION_BASE[p.position]
    const distanceM = Math.round(base.distance * (0.92 + srand(0, 0.16)))
    const sprintCount = Math.round(base.sprint * (0.85 + srand(0, 0.3)))
    const minutesPlayed = Math.round(base.minutes * (0.85 + srand(0, 0.2)))
    return {
      playerId: p.id,
      playerName: p.name,
      position: p.position,
      distanceM,
      sprintCount,
      minutesPlayed,
    }
  })
}

export const playerWorkload: PlayerWorkloadRow[] = generatePlayerWorkload()

// ── 試合別パフォーマンス推移 (直近10試合) ──

const OPPONENTS = [
  "リバーサイドFC",
  "ノースゲート",
  "コースタル",
  "ハイランド",
  "イーストフィールド",
  "ウェストウッド",
  "ベイビュー",
  "サミット",
  "レイクサイド",
  "パインヒル",
]

function generateMatchTrend(): MatchPerformancePoint[] {
  const points: MatchPerformancePoint[] = []
  for (let i = 9; i >= 0; i--) {
    const daysAgo = i * 7 + 1
    const fatigue = 1 - i * 0.012
    const distanceNoise = 0.96 + srand(0, 0.08)
    const sprintNoise = 0.92 + srand(0, 0.16)
    const minutesNoise = 0.96 + srand(0, 0.08)
    const conditionNoise = 0.95 + srand(0, 0.1)
    points.push({
      matchId: `M${(10 - i).toString().padStart(2, "0")}`,
      matchLabel: `第${10 - i}節`,
      date: dateStr(daysAgo),
      opponent: OPPONENTS[9 - i],
      avgDistanceM: Math.round(10400 * fatigue * distanceNoise),
      avgSprintCount: Math.round(22 * fatigue * sprintNoise),
      avgMinutesPlayed: Math.round(82 * minutesNoise),
      conditionIndex: Math.round(75 * conditionNoise * 10) / 10,
    })
  }
  return points
}

export const matchTrend: MatchPerformancePoint[] = generateMatchTrend()

// ── ポジション × 指標 ヒートマップ ──

function generatePositionHeatmap(): PositionHeatmapCell[] {
  const positions: Position[] = ["GK", "DF", "MF", "FW"]
  const metrics: PositionHeatmapCell["metric"][] = [
    "distance",
    "sprint",
    "minutes",
    "condition",
  ]
  const cells: PositionHeatmapCell[] = []

  const positionTotals: Record<
    Position,
    { distance: number; sprint: number; minutes: number; count: number }
  > = {
    GK: { distance: 0, sprint: 0, minutes: 0, count: 0 },
    DF: { distance: 0, sprint: 0, minutes: 0, count: 0 },
    MF: { distance: 0, sprint: 0, minutes: 0, count: 0 },
    FW: { distance: 0, sprint: 0, minutes: 0, count: 0 },
  }
  for (const r of playerWorkload) {
    positionTotals[r.position].distance += r.distanceM
    positionTotals[r.position].sprint += r.sprintCount
    positionTotals[r.position].minutes += r.minutesPlayed
    positionTotals[r.position].count += 1
  }

  const raw: Record<Position, Record<PositionHeatmapCell["metric"], number>> = {
    GK: { distance: 0, sprint: 0, minutes: 0, condition: 0 },
    DF: { distance: 0, sprint: 0, minutes: 0, condition: 0 },
    MF: { distance: 0, sprint: 0, minutes: 0, condition: 0 },
    FW: { distance: 0, sprint: 0, minutes: 0, condition: 0 },
  }
  for (const pos of positions) {
    const t = positionTotals[pos]
    if (t.count === 0) continue
    raw[pos].distance = t.distance / t.count
    raw[pos].sprint = t.sprint / t.count
    raw[pos].minutes = t.minutes / t.count
    raw[pos].condition = POSITION_BASE[pos].condition * (0.95 + srand(0, 0.08))
  }

  for (const metric of metrics) {
    const values = positions.map((p) => raw[p][metric])
    const min = Math.min(...values)
    const max = Math.max(...values)
    for (const pos of positions) {
      const v = raw[pos][metric]
      const normalized = max === min ? 0.5 : (v - min) / (max - min)
      cells.push({
        position: pos,
        metric,
        value: Math.round(v * 10) / 10,
        normalized,
      })
    }
  }

  return cells
}

export const positionHeatmap: PositionHeatmapCell[] = generatePositionHeatmap()

// ── コンディションサマリー ──

function computeConditionSummary(): ConditionSummary {
  const ranked = playerWorkload
    .map((r) => {
      const base = POSITION_BASE[r.position].condition
      const distanceLoad = r.distanceM / POSITION_BASE[r.position].distance
      const sprintLoad = r.sprintCount / Math.max(1, POSITION_BASE[r.position].sprint)
      const conditionIndex =
        Math.round((base * (1.05 - 0.08 * distanceLoad - 0.06 * sprintLoad)) * 10) /
        10
      return {
        playerName: r.playerName,
        position: r.position,
        conditionIndex,
      }
    })
    .sort((a, b) => b.conditionIndex - a.conditionIndex)

  const avg =
    Math.round(
      (ranked.reduce((s, r) => s + r.conditionIndex, 0) / ranked.length) * 10,
    ) / 10

  return {
    squadAverage: avg,
    topPlayer: ranked[0],
    watchlist: ranked[ranked.length - 1],
  }
}

export const conditionSummary: ConditionSummary = computeConditionSummary()

// ── 主要 KPI (ヘッダー直下の 5 枚) ──

function computeKpis(): KpiItem[] {
  const last = matchTrend[matchTrend.length - 1]
  const prev = matchTrend[matchTrend.length - 2]
  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  const totalDistance = playerWorkload.reduce((s, r) => s + r.distanceM, 0)
  const totalSprint = playerWorkload.reduce((s, r) => s + r.sprintCount, 0)
  const avgMinutes =
    playerWorkload.reduce((s, r) => s + r.minutesPlayed, 0) /
    playerWorkload.length

  return [
    {
      label: "平均走行距離",
      value: `${(last.avgDistanceM / 1000).toFixed(2)} km`,
      change: pct(last.avgDistanceM, prev.avgDistanceM),
      changeLabel: "前試合比",
      positiveIsGood: true,
      sparklineData: matchTrend.map((m) => m.avgDistanceM),
    },
    {
      label: "平均スプリント回数",
      value: `${last.avgSprintCount}`,
      change: pct(last.avgSprintCount, prev.avgSprintCount),
      changeLabel: "前試合比",
      positiveIsGood: true,
      sparklineData: matchTrend.map((m) => m.avgSprintCount),
    },
    {
      label: "平均出場時間",
      value: `${Math.round(avgMinutes)} 分`,
      change: pct(last.avgMinutesPlayed, prev.avgMinutesPlayed),
      changeLabel: "前試合比",
      positiveIsGood: true,
      sparklineData: matchTrend.map((m) => m.avgMinutesPlayed),
    },
    {
      label: "コンディション指標",
      value: `${last.conditionIndex.toFixed(1)}`,
      change: pct(last.conditionIndex, prev.conditionIndex),
      changeLabel: "前試合比",
      positiveIsGood: true,
      sparklineData: matchTrend.map((m) => m.conditionIndex),
    },
    {
      label: "チーム総走行距離",
      value: `${(totalDistance / 1000).toFixed(0)} km`,
      change: pct(totalSprint, totalSprint * 0.97),
      changeLabel: "移動平均",
      positiveIsGood: true,
      sparklineData: matchTrend.map((m) => m.avgDistanceM),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const positionOptions = [
  { label: "全ポジション", value: "all" },
  { label: "GK", value: "GK" },
  { label: "DF", value: "DF" },
  { label: "MF", value: "MF" },
  { label: "FW", value: "FW" },
]

export const competitionOptions = [
  { label: "全大会", value: "all" },
  { label: "リーグ戦", value: "league" },
  { label: "カップ戦", value: "cup" },
  { label: "親善試合", value: "friendly" },
]
