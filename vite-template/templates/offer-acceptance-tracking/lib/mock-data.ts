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

// Seeded RNG unique to this template (offer-acceptance-tracking)
function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(2137)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

// ── Static option data ──

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Sales",
  "Marketing",
  "Corporate",
] as const

const RECRUITERS = [
  "Avery Hill",
  "Bryn Mori",
  "Cade Nakamura",
  "Drew Okafor",
  "Elin Park",
  "Frey Ueda",
] as const

const FIRST_NAMES = [
  "Riley",
  "Jordan",
  "Casey",
  "Morgan",
  "Sage",
  "Quinn",
  "Avery",
  "Ellis",
  "Reese",
  "Skyler",
  "Hayden",
  "Rowan",
  "Sasha",
  "Toby",
  "Pax",
  "Lior",
  "Noa",
  "Iris",
  "Theo",
  "Mika",
]

const LAST_NAMES = [
  "Adler",
  "Bardem",
  "Chen",
  "Dvorak",
  "Espinoza",
  "Fukuda",
  "Garrick",
  "Hadid",
  "Ibarra",
  "Jansen",
  "Kovac",
  "Lindqvist",
  "Mendoza",
  "Nakai",
  "Ortega",
  "Polanski",
  "Quan",
  "Rashidi",
  "Stenmark",
  "Tanaka",
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

// Weighting for decline reasons — competing offer & comp tend to dominate
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
  compensation: "Compensation",
  competing_offer: "Competing offer",
  career_fit: "Career fit",
  location: "Location",
  culture_fit: "Culture fit",
  personal: "Personal reasons",
  other: "Other",
}

export const statusLabels: Record<OfferStatus, string> = {
  offered: "Offered",
  considering: "Considering",
  accepted: "Accepted",
  declined: "Declined",
}

// ── Generate candidates ──

const TOTAL_OFFERS = 142

// Outcome mix — sums to 1.0
// offered (open) 0.18, considering 0.22, accepted 0.42, declined 0.18
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
    const firstName = pick(FIRST_NAMES)
    const lastName = pick(LAST_NAMES)

    out.push({
      candidate_id: `C-${String(i + 1).padStart(4, "0")}`,
      status,
      decision_at: decisionDaysAgo === null ? null : isoDateBack(decisionDaysAgo),
      decline_reason: declineReason,
      candidate_name: `${firstName} ${lastName}`,
      department: pick(DEPARTMENTS),
      recruiter: pick(RECRUITERS),
      offered_at: isoDateBack(offeredDaysAgo),
      days_since_offer: offeredDaysAgo,
    })
  }
  return out
}

export const candidates: CandidateRow[] = generateCandidates()

// ── Status funnel (Offered → Considering → Accepted) ──

function generateStatusFunnel(): StatusFunnelStep[] {
  // Cumulative — anyone who has progressed at least to that stage
  // Offered cohort = everyone who received an offer (all rows)
  // Considering = considering + accepted (decline branches off before)
  // Accepted = accepted
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
  // FunnelSteps requires descending order
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

// ── Decline reason breakdown ──

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

// ── Follow-up list (open offers needing attention) ──

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
      ? "Schedule a final 1:1 — decision window closing"
      : "Send personalized follow-up before deadline"
  }
  if (priority === "medium") {
    return status === "considering"
      ? "Share team intro materials & answer open questions"
      : "Confirm receipt and offer Q&A session"
  }
  return "Routine check-in next week"
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

// ── KPIs ──

function computeKpis(): KpiItem[] {
  const total = candidates.length
  const accepted = candidates.filter((c) => c.status === "accepted").length
  const declined = candidates.filter((c) => c.status === "declined").length
  const inProgress = candidates.filter(
    (c) => c.status === "offered" || c.status === "considering",
  ).length
  const decided = accepted + declined
  const acceptRate = decided === 0 ? 0 : (accepted / decided) * 100

  // Average days from offered_at -> decision_at for decided candidates
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

  // Sparkline: 8-week running counts
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
      label: "Total Offers",
      value: total.toLocaleString("en-US"),
      change: 6.4,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: bucketByWeek(() => true),
    },
    {
      label: "Accept Rate",
      value: `${acceptRate.toFixed(1)}%`,
      change: 2.1,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: bucketByWeek((c) => c.status === "accepted"),
    },
    {
      label: "Declines",
      value: declined.toLocaleString("en-US"),
      change: -1.2,
      changeLabel: "vs prev period",
      positiveIsGood: false,
      sparklineData: bucketByWeek((c) => c.status === "declined"),
    },
    {
      label: "In Progress",
      value: inProgress.toLocaleString("en-US"),
      change: 4.7,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: bucketByWeek(
        (c) => c.status === "offered" || c.status === "considering",
      ),
    },
    {
      label: "Avg Decision Days",
      value: `${avgDecisionDays.toFixed(1)}d`,
      change: -0.8,
      changeLabel: "vs prev period",
      positiveIsGood: false,
      sparklineData: bucketByWeek(
        (c) => c.status === "accepted" || c.status === "declined",
      ),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const departmentOptions = [
  { label: "All departments", value: "all" },
  ...DEPARTMENTS.map((d) => ({ label: d, value: d })),
]

export const recruiterOptions = [
  { label: "All recruiters", value: "all" },
  ...RECRUITERS.map((r) => ({ label: r, value: r })),
]
