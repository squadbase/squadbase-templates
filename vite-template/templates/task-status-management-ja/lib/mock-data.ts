import type {
  TaskRow,
  TaskStatus,
  Priority,
  KpiItem,
  StatusSummaryItem,
  OwnerLoadItem,
  OverdueTaskRow,
} from "@/types/task-status-management"

// ── Helpers ──

const BASE_DATE = new Date("2024-06-10")

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// このテンプレート固有の seed
const rng = seededRand(2027)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function dateOffset(daysOffset: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().slice(0, 10)
}

// ── 担当者・タイトル ──

const OWNERS = [
  "佐藤 健",
  "鈴木 美咲",
  "田中 翔",
  "高橋 結衣",
  "伊藤 拓海",
  "渡辺 さくら",
] as const

const TITLE_TEMPLATES = [
  "Q3 ローンチ計画ドラフト",
  "ベンダー契約レビュー",
  "新入社員オンボーディング",
  "レガシー API 移行",
  "リリースノート公開",
  "請求フロー監査",
  "デザイントークン更新",
  "未解決インシデントトリアージ",
  "パートナーチーム連携",
  "取締役会アップデート準備",
  "プライバシーポリシー改訂",
  "顧客インタビュー実施",
  "ステージング環境パッチ",
  "フィーチャーフラグ展開",
  "レポーティングモジュール再構築",
  "コンプライアンス証跡整理",
  "フレーキーテスト修正",
  "オフサイト企画立案",
  "メトリクスパイプライン補填",
  "更新契約交渉",
  "チェックアウト trace 設定",
  "オンコール手順書整備",
  "FY 予算クローズ",
  "採用フロー振り返り",
] as const

const PRIORITIES: Priority[] = ["low", "medium", "high"]

// ── タスク生成 ──

const TOTAL_TASKS = 48

function generateTasks(): TaskRow[] {
  const tasks: TaskRow[] = []
  for (let i = 0; i < TOTAL_TASKS; i++) {
    const owner = pick(OWNERS)
    const title = pick(TITLE_TEMPLATES)
    const priority = pick(PRIORITIES)

    // ステータス分布: 未着手 ~25%, 進行中 ~45%, 完了 ~30%
    const r = rng()
    const status: TaskStatus =
      r < 0.25 ? "not_started" : r < 0.7 ? "in_progress" : "completed"

    // 期日: 21日前から30日後までを散らす
    const dueOffset = Math.round(srand(-21, 30))
    const due_date = dateOffset(dueOffset)

    // completed_at: 完了タスクのみ、期日付近に設定
    let completed_at: string | null = null
    if (status === "completed") {
      const completedOffset = Math.min(0, dueOffset + Math.round(srand(-3, 2)))
      completed_at = dateOffset(completedOffset)
    }

    tasks.push({
      task_id: `T-${String(1000 + i)}`,
      title,
      status,
      owner,
      due_date,
      completed_at,
      priority,
    })
  }
  return tasks
}

export const tasks: TaskRow[] = generateTasks()

// ── ステータスサマリー (カンバン) ──

const STATUS_LABELS_JA: Record<TaskStatus, string> = {
  not_started: "未着手",
  in_progress: "進行中",
  completed: "完了",
}

function isOverdue(task: TaskRow): boolean {
  if (task.status === "completed") return false
  return new Date(task.due_date) < BASE_DATE
}

function daysBetween(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function computeStatusSummary(): StatusSummaryItem[] {
  const order: TaskStatus[] = ["not_started", "in_progress", "completed"]
  return order.map((status) => {
    const filtered = tasks.filter((t) => t.status === status)
    const overdueCount = filtered.filter(isOverdue).length
    return {
      status,
      label: STATUS_LABELS_JA[status],
      count: filtered.length,
      share: filtered.length / tasks.length,
      overdueCount,
    }
  })
}

export const statusSummary: StatusSummaryItem[] = computeStatusSummary()

// ── 担当者別負荷 ──

function computeOwnerLoad(): OwnerLoadItem[] {
  return OWNERS.map((owner) => {
    const ownerTasks = tasks.filter((t) => t.owner === owner)
    const notStarted = ownerTasks.filter((t) => t.status === "not_started").length
    const inProgress = ownerTasks.filter((t) => t.status === "in_progress").length
    const completed = ownerTasks.filter((t) => t.status === "completed").length
    const overdue = ownerTasks.filter(isOverdue).length
    return {
      owner,
      notStarted,
      inProgress,
      completed,
      overdue,
      totalActive: notStarted + inProgress,
    }
  }).sort((a, b) => b.totalActive - a.totalActive)
}

export const ownerLoad: OwnerLoadItem[] = computeOwnerLoad()

// ── 期日超過タスク ──

function computeOverdueTasks(): OverdueTaskRow[] {
  return tasks
    .filter(isOverdue)
    .map((t) => ({
      ...t,
      daysOverdue: daysBetween(BASE_DATE, new Date(t.due_date)),
    }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
}

export const overdueTasks: OverdueTaskRow[] = computeOverdueTasks()

// ── ヘッダー KPI ──

function buildSparkline(seedShift: number, length = 14): number[] {
  const local = seededRand(2027 + seedShift)
  const points: number[] = []
  let v = 10 + local() * 6
  for (let i = 0; i < length; i++) {
    v += (local() - 0.45) * 2
    points.push(Math.max(0, Math.round(v)))
  }
  return points
}

function computeKpis(): KpiItem[] {
  const notStarted = statusSummary[0].count
  const inProgress = statusSummary[1].count
  const completed = statusSummary[2].count
  const overdue = overdueTasks.length
  const completionRate = (completed / tasks.length) * 100

  return [
    {
      label: "アクティブ件数",
      value: String(notStarted + inProgress),
      change: 4.2,
      changeLabel: "前週比",
      positiveIsGood: false,
      sparklineData: buildSparkline(1),
    },
    {
      label: "進行中",
      value: String(inProgress),
      change: 2.1,
      changeLabel: "前週比",
      positiveIsGood: true,
      sparklineData: buildSparkline(2),
    },
    {
      label: "期日超過",
      value: String(overdue),
      change: -3.5,
      changeLabel: "前週比",
      positiveIsGood: false,
      sparklineData: buildSparkline(3),
    },
    {
      label: "完了率",
      value: `${completionRate.toFixed(1)}%`,
      change: 5.8,
      changeLabel: "前週比",
      positiveIsGood: true,
      sparklineData: buildSparkline(4),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const ownerOptions = [
  { label: "全担当者", value: "all" },
  ...OWNERS.map((o) => ({ label: o, value: o })),
]

export const priorityOptions = [
  { label: "全優先度", value: "all" },
  { label: "高", value: "high" },
  { label: "中", value: "medium" },
  { label: "低", value: "low" },
]

export const statusLabels = STATUS_LABELS_JA
