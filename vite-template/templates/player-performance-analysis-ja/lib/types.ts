// ── Enum / Literal types ──

export type Position = "GK" | "DF" | "MF" | "FW"

// ── Raw data schema (matches ticket's expected input data) ──
// player_id, match_id, distance_m, sprint_count, minutes_played

export interface PerformanceRow {
  player_id: string
  match_id: string
  distance_m: number
  sprint_count: number
  minutes_played: number
}

// ── Display / derived types ──

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface PlayerWorkloadRow {
  playerId: string
  playerName: string
  position: Position
  distanceM: number
  sprintCount: number
  minutesPlayed: number
}

export interface MatchPerformancePoint {
  matchId: string
  matchLabel: string
  date: string
  opponent: string
  avgDistanceM: number
  avgSprintCount: number
  avgMinutesPlayed: number
  conditionIndex: number
}

// ポジション × 指標のヒートマップセル
export interface PositionHeatmapCell {
  position: Position
  metric: "distance" | "sprint" | "minutes" | "condition"
  value: number
  normalized: number
}

export interface ConditionSummary {
  squadAverage: number
  topPlayer: { playerName: string; position: Position; conditionIndex: number }
  watchlist: { playerName: string; position: Position; conditionIndex: number }
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  position: string | undefined
  competition: string | undefined
}
