import type {
  CandidateRow,
  OfferStatus,
  DeclineReason,
  FollowUpPriority,
  KpiItem,
  StatusFunnelStep,
  DeclineReasonBreakdown,
  FollowUpRow,
} from "@/types/offer-acceptance-tracking"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-15")

function isoDateBack(daysAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

// Seeded RNG unique to this template (offer-acceptance-tracking-ja)
function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(2138)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

// ── 固定マスター ──

const DEPARTMENTS = [
  "エンジニアリング",
  "プロダクト",
  "デザイン",
  "営業",
  "マーケティング",
  "コーポレート",
] as const

const RECRUITERS = [
  "佐藤 美咲",
  "鈴木 健",
  "田中 拓也",
  "高橋 由紀",
  "伊藤 直樹",
  "渡辺 千夏",
] as const

const FIRST_NAMES = [
  "陽翔",
  "結衣",
  "蓮",
  "凛",
  "湊",
  "葵",
  "悠真",
  "結菜",
  "樹",
  "莉子",
  "颯",
  "心春",
  "翔",
  "美月",
  "陸",
  "杏",
  "蒼",
  "桜",
  "悠",
  "咲良",
]

const LAST_NAMES = [
  "中村",
  "小林",
  "加藤",
  "山田",
  "井上",
  "木村",
  "斎藤",
  "山本",
  "松本",
  "林",
  "清水",
  "山口",
  "森",
  "池田",
  "橋本",
  "石川",
  "斉藤",
  "前田",
  "藤田",
  "後藤",
]

const DECLINE_REASONS: DeclineReason[] = [
  "compensation",
  "competing_offer",
  "career_fit",
  "location",
  "culture_fit",
  "personal",
  "other",
]

// 辞退理由の重み — 他社競合と条件面が多くなる傾向
const DECLINE_REASON_WEIGHT: Record<DeclineReason, number> = {
  competing_offer: 0.31,
  compensation: 0.24,
  career_fit: 0.16,
  location: 0.11,
  culture_fit: 0.08,
  personal: 0.06,
  other: 0.04,
}

export const declineReasonLabels: Record<DeclineReason, string> = {
  compensation: "給与・待遇",
  competing_offer: "他社内定",
  career_fit: "キャリアフィット",
  location: "勤務地",
  culture_fit: "カルチャー不一致",
  personal: "個人的事情",
  other: "その他",
}

export const statusLabels: Record<OfferStatus, string> = {
  offered: "内定",
  considering: "検討中",
  accepted: "承諾",
  declined: "辞退",
}

// ── 内定者データ生成 ──

const TOTAL_OFFERS = 142

// 状態構成 — 合計 1.0
// offered (進行中) 0.18, considering 0.22, accepted 0.42, declined 0.18
const STATUS_MIX: { status: OfferStatus; threshold: number }[] = [
  { status: "offered", threshold: 0.18 },
  { status: "considering", threshold: 0.18 + 0.22 },
  { status: "accepted", threshold: 0.18 + 0.22 + 0.42 },
  { status: "declined", threshold: 1.0 },
]

function pickStatus(): OfferStatus {
  const r = rng()
  for (const m of STATUS_MIX) {
    if (r <= m.threshold) return m.status
  }
  return "declined"
}

function pickDeclineReason(): DeclineReason {
  const r = rng()
  let acc = 0
  for (const reason of DECLINE_REASONS) {
    acc += DECLINE_REASON_WEIGHT[reason]
    if (r <= acc) return reason
  }
  return "other"
}

function generateCandidates(): CandidateRow[] {
  const out: CandidateRow[] = []
  for (let i = 0; i < TOTAL_OFFERS; i++) {
    const status = pickStatus()
    const offeredDaysAgo = Math.round(srand(2, 84))
    const decisionDaysAgo =
      status === "offered" || status === "considering"
        ? null
        : Math.max(0, offeredDaysAgo - Math.round(srand(2, 18)))
    const declineReason = status === "declined" ? pickDeclineReason() : null
    const lastName = pick(LAST_NAMES)
    const firstName = pick(FIRST_NAMES)

    out.push({
      candidate_id: `C-${String(i + 1).padStart(4, "0")}`,
      status,
      decision_at: decisionDaysAgo === null ? null : isoDateBack(decisionDaysAgo),
      decline_reason: declineReason,
      candidate_name: `${lastName} ${firstName}`,
      department: pick(DEPARTMENTS),
      recruiter: pick(RECRUITERS),
      offered_at: isoDateBack(offeredDaysAgo),
      days_since_offer: offeredDaysAgo,
    })
  }
  return out
}

export const candidates: CandidateRow[] = generateCandidates()

// ── ステータスファネル (内定 → 検討中 → 承諾) ──

function generateStatusFunnel(): StatusFunnelStep[] {
  // 累積 — そのステージ以上に進んだ人数
  const offered = candidates.length
  const considering = candidates.filter(
    (c) => c.status === "considering" || c.status === "accepted",
  ).length
  const accepted = candidates.filter((c) => c.status === "accepted").length

  const raw: { status: StatusFunnelStep["status"]; count: number }[] = [
    { status: "offered", count: offered },
    { status: "considering", count: considering },
    { status: "accepted", count: accepted },
  ]
  // FunnelSteps は降順必須
  const sorted = [...raw].sort((a, b) => b.count - a.count)
  return sorted.map((row, i) => {
    const prev = i === 0 ? row.count : sorted[i - 1].count
    return {
      status: row.status,
      count: row.count,
      conversionFromPrev:
        prev === 0 ? 0 : Math.round((row.count / prev) * 1000) / 10,
    }
  })
}

export const statusFunnel: StatusFunnelStep[] = generateStatusFunnel()

// ── 辞退理由カテゴリ集計 ──

function generateDeclineReasons(): DeclineReasonBreakdown[] {
  const declined = candidates.filter(
    (c) => c.status === "declined" && c.decline_reason !== null,
  )
  const total = declined.length
  return DECLINE_REASONS.map((reason) => {
    const count = declined.filter((c) => c.decline_reason === reason).length
    return {
      reason,
      count,
      share: total === 0 ? 0 : Math.round((count / total) * 1000) / 10,
    }
  }).sort((a, b) => b.count - a.count)
}

export const declineReasons: DeclineReasonBreakdown[] = generateDeclineReasons()

// ── 個別フォロー要否リスト ──

const STANDARD_DEADLINE_DAYS = 21

function priorityFor(daysSinceOffer: number, status: OfferStatus): FollowUpPriority {
  const daysLeft = STANDARD_DEADLINE_DAYS - daysSinceOffer
  if (daysLeft <= 3) return "high"
  if (status === "considering" && daysLeft <= 7) return "high"
  if (daysLeft <= 10) return "medium"
  return "low"
}

function noteFor(priority: FollowUpPriority, status: OfferStatus): string {
  if (priority === "high") {
    return status === "considering"
      ? "意思決定期限が迫っています — 1on1 を即時調整"
      : "期限前に個別フォロー連絡を送付"
  }
  if (priority === "medium") {
    return status === "considering"
      ? "チーム紹介資料の共有・質問対応を実施"
      : "受領確認と Q&A セッションを案内"
  }
  return "来週の定期チェックインで対応"
}

function generateFollowUp(): FollowUpRow[] {
  return candidates
    .filter((c) => c.status === "offered" || c.status === "considering")
    .map((c) => {
      const priority = priorityFor(c.days_since_offer, c.status)
      return {
        candidate_id: c.candidate_id,
        candidate_name: c.candidate_name,
        department: c.department,
        recruiter: c.recruiter,
        status: c.status,
        daysSinceOffer: c.days_since_offer,
        daysUntilDeadline: STANDARD_DEADLINE_DAYS - c.days_since_offer,
        priority,
        note: noteFor(priority, c.status),
      }
    })
    .sort((a, b) => {
      const rank: Record<FollowUpPriority, number> = { high: 0, medium: 1, low: 2 }
      if (rank[a.priority] !== rank[b.priority]) {
        return rank[a.priority] - rank[b.priority]
      }
      return a.daysUntilDeadline - b.daysUntilDeadline
    })
}

export const followUpList: FollowUpRow[] = generateFollowUp()

// ── 主要 KPI ──

function computeKpis(): KpiItem[] {
  const total = candidates.length
  const accepted = candidates.filter((c) => c.status === "accepted").length
  const declined = candidates.filter((c) => c.status === "declined").length
  const inProgress = candidates.filter(
    (c) => c.status === "offered" || c.status === "considering",
  ).length
  const decided = accepted + declined
  const acceptRate = decided === 0 ? 0 : (accepted / decided) * 100

  // 内定 → 意思決定までの平均日数 (確定済みのみ)
  const decidedRows = candidates.filter(
    (c) => c.status === "accepted" || c.status === "declined",
  )
  const avgDecisionDays =
    decidedRows.length === 0
      ? 0
      : decidedRows.reduce((s, c) => {
          const offered = new Date(c.offered_at).getTime()
          const decision = c.decision_at
            ? new Date(c.decision_at).getTime()
            : offered
          return s + Math.max(0, (decision - offered) / 86_400_000)
        }, 0) / decidedRows.length

  // スパークライン: 8 週間のバケット
  const WEEKS = 8
  function bucketByWeek(predicate: (c: CandidateRow) => boolean): number[] {
    const buckets = new Array(WEEKS).fill(0)
    for (const c of candidates) {
      if (!predicate(c)) continue
      const ref = c.decision_at ?? c.offered_at
      const days = Math.floor(
        (BASE_DATE.getTime() - new Date(ref).getTime()) / 86_400_000,
      )
      const week = Math.floor(days / 7)
      if (week >= 0 && week < WEEKS) buckets[WEEKS - 1 - week] += 1
    }
    return buckets
  }

  return [
    {
      label: "内定者数",
      value: total.toLocaleString("ja-JP"),
      change: 6.4,
      changeLabel: "前期比",
      positiveIsGood: true,
      sparklineData: bucketByWeek(() => true),
    },
    {
      label: "承諾率",
      value: `${acceptRate.toFixed(1)}%`,
      change: 2.1,
      changeLabel: "前期比",
      positiveIsGood: true,
      sparklineData: bucketByWeek((c) => c.status === "accepted"),
    },
    {
      label: "辞退件数",
      value: declined.toLocaleString("ja-JP"),
      change: -1.2,
      changeLabel: "前期比",
      positiveIsGood: false,
      sparklineData: bucketByWeek((c) => c.status === "declined"),
    },
    {
      label: "進行中",
      value: inProgress.toLocaleString("ja-JP"),
      change: 4.7,
      changeLabel: "前期比",
      positiveIsGood: true,
      sparklineData: bucketByWeek(
        (c) => c.status === "offered" || c.status === "considering",
      ),
    },
    {
      label: "平均判断日数",
      value: `${avgDecisionDays.toFixed(1)}日`,
      change: -0.8,
      changeLabel: "前期比",
      positiveIsGood: false,
      sparklineData: bucketByWeek(
        (c) => c.status === "accepted" || c.status === "declined",
      ),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const departmentOptions = [
  { label: "全部署", value: "all" },
  ...DEPARTMENTS.map((d) => ({ label: d, value: d })),
]

export const recruiterOptions = [
  { label: "全リクルーター", value: "all" },
  ...RECRUITERS.map((r) => ({ label: r, value: r })),
]
