import type {
  EquipmentCategory,
  EquipmentUptimeRow,
  FailureTrendPoint,
  DowntimeHeatmapCell,
  PreventiveMaintenanceTask,
  KpiItem,
  PmStatus,
} from "@/types/equipment-maintenance-dashboard"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-15")

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(347)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function dateStr(offsetDays: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

// ── 設備マスター ──

interface EquipmentMaster {
  id: string
  name: string
  category: EquipmentCategory
  // 信頼性係数: 高いほど安定稼働 (ダウンタイム/故障が少ない)
  reliability: number
  scheduledHours: number
}

const EQUIPMENT: EquipmentMaster[] = [
  { id: "PR-101", name: "プレスラインA", category: "press", reliability: 0.94, scheduledHours: 720 },
  { id: "PR-102", name: "プレスラインB", category: "press", reliability: 0.78, scheduledHours: 720 },
  { id: "CN-201", name: "CNCマシニング1号機", category: "cnc", reliability: 0.96, scheduledHours: 720 },
  { id: "CN-202", name: "CNCマシニング2号機", category: "cnc", reliability: 0.88, scheduledHours: 720 },
  { id: "RB-301", name: "溶接ロボット1号機", category: "robot", reliability: 0.92, scheduledHours: 720 },
  { id: "RB-302", name: "溶接ロボット2号機", category: "robot", reliability: 0.83, scheduledHours: 720 },
  { id: "AS-401", name: "組立セル1", category: "assembly", reliability: 0.9, scheduledHours: 720 },
  { id: "AS-402", name: "組立セル2", category: "assembly", reliability: 0.86, scheduledHours: 720 },
  { id: "PK-501", name: "包装ライン", category: "packaging", reliability: 0.91, scheduledHours: 720 },
  { id: "PK-502", name: "ラベリング機", category: "packaging", reliability: 0.97, scheduledHours: 720 },
]

// ── 設備別稼働率 / MTBF / MTTR (必須セクション1) ──

function computeEquipmentUptime(): EquipmentUptimeRow[] {
  return EQUIPMENT.map((eq) => {
    const failureBase = Math.max(0, (1 - eq.reliability) * 28 + srand(-2, 2))
    const failureCount = Math.max(0, Math.round(failureBase))
    // 1故障あたりの平均修復時間 ~3〜6 時間
    const mttrHours = Math.round((3 + (1 - eq.reliability) * 12 + srand(0, 2)) * 10) / 10
    const downtimeHours = failureCount * mttrHours
    const uptimeHours = Math.max(0, eq.scheduledHours - downtimeHours)
    const uptimePct = Math.round((uptimeHours / eq.scheduledHours) * 1000) / 10
    // MTBF: 稼働時間 / 故障件数 (故障なしの場合は計画稼働時間そのまま)
    const mtbfHours =
      failureCount === 0
        ? eq.scheduledHours
        : Math.round((uptimeHours / failureCount) * 10) / 10
    return {
      equipment_id: eq.id,
      name: eq.name,
      category: eq.category,
      uptimeHours: Math.round(uptimeHours * 10) / 10,
      scheduledHours: eq.scheduledHours,
      uptimePct,
      failureCount,
      mtbfHours,
      mttrHours,
    }
  }).sort((a, b) => a.uptimePct - b.uptimePct)
}

export const equipmentUptime: EquipmentUptimeRow[] = computeEquipmentUptime()

// ── 故障件数の月次推移 (必須セクション2) ──
// 過去12ヶ月

function generateFailureTrend(): FailureTrendPoint[] {
  const months: FailureTrendPoint[] = []
  const baseDate = new Date(BASE_DATE)
  for (let i = 11; i >= 0; i--) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1)
    const monthLabel = d.toISOString().slice(0, 7)
    // 季節要因: 冬期 (12-1月) は寒気起因の不具合増、夏期 (7-8月) はやや増
    const month = d.getMonth()
    const seasonal = month <= 1 || month === 11 ? 1.18 : month >= 6 && month <= 7 ? 1.08 : 1.0
    // PM 導入効果でゆるやかに改善 (-1.5%/月)
    const trend = 1 - (11 - i) * 0.015
    const failureCount = Math.max(
      4,
      Math.round(38 * seasonal * trend + srand(-6, 6)),
    )
    // MTTR も少しずつ改善
    const mttrHours =
      Math.round((5.2 - (11 - i) * 0.05 + srand(-0.6, 0.6)) * 10) / 10
    months.push({
      month: monthLabel,
      failureCount,
      mttrHours,
    })
  }
  return months
}

export const failureTrend: FailureTrendPoint[] = generateFailureTrend()

// ── 設備 × 週のダウンタイムヒートマップ (シグネチャ要素) ──
// 過去12週

const HEATMAP_WEEKS = 12

function generateDowntimeHeatmap(): DowntimeHeatmapCell[] {
  const cells: DowntimeHeatmapCell[] = []
  EQUIPMENT.forEach((eq, rowIdx) => {
    for (let w = 0; w < HEATMAP_WEEKS; w++) {
      // 期待週次ダウンタイムは 1 - reliability に比例
      const baseDowntime = (1 - eq.reliability) * 16
      // 15% の確率で「不調週」のスパイク
      const spike = rng() < 0.15 ? srand(8, 24) : 0
      const downtime = Math.max(
        0,
        Math.round((baseDowntime + spike + srand(-2, 3)) * 10) / 10,
      )
      cells.push({
        equipmentRow: rowIdx,
        weekIndex: w,
        weekLabel: w === 0 ? "今週" : `${w}週前`,
        equipmentName: eq.name,
        downtimeHours: downtime,
      })
    }
  })
  return cells
}

export const downtimeHeatmap: DowntimeHeatmapCell[] = generateDowntimeHeatmap()
export const heatmapEquipmentNames: string[] = EQUIPMENT.map((e) => e.name)

// ── 予防保全予定リスト (必須セクション3) ──

interface PmSeed {
  taskId: string
  equipmentId: string
  taskName: string
  daysOffset: number // 負=期日超過, 0=本日期日, 正=今後
  assignee: string
}

const PM_SEEDS: PmSeed[] = [
  { taskId: "PM-2403-001", equipmentId: "PR-102", taskName: "油圧オイル交換", daysOffset: -5, assignee: "佐藤" },
  { taskId: "PM-2403-002", equipmentId: "RB-302", taskName: "トーチノズル交換", daysOffset: -2, assignee: "田中" },
  { taskId: "PM-2403-003", equipmentId: "AS-402", taskName: "コンベアベルト張力調整", daysOffset: -1, assignee: "金" },
  { taskId: "PM-2403-004", equipmentId: "CN-202", taskName: "主軸ベアリング点検", daysOffset: 0, assignee: "李" },
  { taskId: "PM-2403-005", equipmentId: "PR-101", taskName: "金型芯出し点検", daysOffset: 1, assignee: "森" },
  { taskId: "PM-2403-006", equipmentId: "PK-501", taskName: "シールバー交換", daysOffset: 3, assignee: "佐藤" },
  { taskId: "PM-2403-007", equipmentId: "RB-301", taskName: "ロボットキャリブレーション", daysOffset: 5, assignee: "田中" },
  { taskId: "PM-2403-008", equipmentId: "CN-201", taskName: "クーラントフィルタ交換", daysOffset: 7, assignee: "李" },
  { taskId: "PM-2403-009", equipmentId: "AS-401", taskName: "エア漏れ点検", daysOffset: 10, assignee: "金" },
  { taskId: "PM-2403-010", equipmentId: "PK-502", taskName: "ラベルセンサ清掃", daysOffset: 14, assignee: "森" },
]

function pmStatusFromOffset(daysOffset: number): PmStatus {
  if (daysOffset < 0) return "overdue"
  if (daysOffset === 0) return "due-today"
  if (daysOffset <= 7) return "upcoming"
  return "scheduled"
}

function generatePmTasks(): PreventiveMaintenanceTask[] {
  return PM_SEEDS.map((seed) => {
    const eq = EQUIPMENT.find((e) => e.id === seed.equipmentId)
    return {
      task_id: seed.taskId,
      equipment_id: seed.equipmentId,
      equipmentName: eq?.name ?? seed.equipmentId,
      taskName: seed.taskName,
      dueDate: dateStr(seed.daysOffset),
      daysOffset: seed.daysOffset,
      assignee: seed.assignee,
      status: pmStatusFromOffset(seed.daysOffset),
    }
  }).sort((a, b) => a.daysOffset - b.daysOffset)
}

export const preventiveMaintenanceTasks: PreventiveMaintenanceTask[] =
  generatePmTasks()

// ── 主要 KPI ──

function computeKpis(): KpiItem[] {
  const totalScheduled = equipmentUptime.reduce((s, r) => s + r.scheduledHours, 0)
  const totalUptime = equipmentUptime.reduce((s, r) => s + r.uptimeHours, 0)
  const fleetUptimePct =
    Math.round((totalUptime / totalScheduled) * 1000) / 10

  const totalFailures = equipmentUptime.reduce((s, r) => s + r.failureCount, 0)
  const totalDowntime = equipmentUptime.reduce(
    (s, r) => s + (r.scheduledHours - r.uptimeHours),
    0,
  )
  const fleetMtbf =
    totalFailures === 0
      ? totalScheduled
      : Math.round((totalUptime / totalFailures) * 10) / 10
  const fleetMttr =
    totalFailures === 0
      ? 0
      : Math.round((totalDowntime / totalFailures) * 10) / 10

  const completedPm = preventiveMaintenanceTasks.filter(
    (t) => t.daysOffset < 0 && t.status !== "overdue",
  ).length
  const overduePm = preventiveMaintenanceTasks.filter(
    (t) => t.status === "overdue",
  ).length
  // 直近30日の PM 消化率 — モック: 計画28件、完了24件 (期日超過分を差し引き、完了済み加算)
  const pmScheduledLast30 = 28
  const pmCompletedLast30 = Math.max(0, 24 - overduePm + completedPm)
  const pmCompletionPct =
    Math.round((pmCompletedLast30 / pmScheduledLast30) * 1000) / 10

  // 前期間比較値 (モック)
  const prevUptimePct = fleetUptimePct - 1.4
  const prevFailures = Math.round(totalFailures * 1.12)
  const prevMtbf = Math.max(1, fleetMtbf * 0.93)
  const prevMttr = fleetMttr * 1.08
  const prevPmCompletionPct = pmCompletionPct - 4.2

  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "稼働率",
      value: `${fleetUptimePct.toFixed(1)}%`,
      change: Math.round((fleetUptimePct - prevUptimePct) * 10) / 10,
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: failureTrend.map((m) => 100 - m.failureCount * 0.15),
    },
    {
      label: "MTBF",
      value: `${fleetMtbf.toFixed(1)} h`,
      change: pct(fleetMtbf, prevMtbf),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: failureTrend.map((m) =>
        m.failureCount === 0 ? 720 : 720 / m.failureCount,
      ),
    },
    {
      label: "MTTR",
      value: `${fleetMttr.toFixed(1)} h`,
      change: pct(fleetMttr, prevMttr),
      changeLabel: "前月比",
      positiveIsGood: false,
      sparklineData: failureTrend.map((m) => m.mttrHours),
    },
    {
      label: "故障件数 (30日)",
      value: totalFailures.toLocaleString("ja-JP"),
      change: pct(totalFailures, prevFailures),
      changeLabel: "前月比",
      positiveIsGood: false,
      sparklineData: failureTrend.map((m) => m.failureCount),
    },
    {
      label: "予防保全消化率",
      value: `${pmCompletionPct.toFixed(1)}%`,
      change: Math.round((pmCompletionPct - prevPmCompletionPct) * 10) / 10,
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: failureTrend.map(
        (_, i) => 78 + i * 1.2 + (i % 3 === 0 ? 1.8 : 0),
      ),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const categoryOptions = [
  { label: "全カテゴリ", value: "all" },
  { label: "プレス", value: "press" },
  { label: "CNC", value: "cnc" },
  { label: "ロボット", value: "robot" },
  { label: "組立", value: "assembly" },
  { label: "包装", value: "packaging" },
]

export const lineOptions = [
  { label: "全ライン", value: "all" },
  { label: "Aライン", value: "line-a" },
  { label: "Bライン", value: "line-b" },
  { label: "Cライン", value: "line-c" },
]
