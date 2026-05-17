import type {
  AgeBand,
  Gender,
  AcquisitionChannel,
  AgeGenderCell,
  AttributeLtvRow,
  AcquisitionChannelPoint,
  KpiItem,
} from "@/types/member-attribute-dashboard"

// ── Seeded RNG (unique seed per template) ──

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(24)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── Static dimensions ──

const AGE_BANDS: AgeBand[] = ["10s", "20s", "30s", "40s", "50s", "60s+"]
const GENDERS: Gender[] = ["female", "male", "other"]

// Demographic weight by age band (relative size of the member base)
const AGE_WEIGHT: Record<AgeBand, number> = {
  "10s": 0.05,
  "20s": 0.22,
  "30s": 0.28,
  "40s": 0.21,
  "50s": 0.14,
  "60s+": 0.1,
}

// Gender weight within each age band
const GENDER_WEIGHT: Record<Gender, number> = {
  female: 0.56,
  male: 0.41,
  other: 0.03,
}

// Base LTV by age band (rough lifetime spend in USD)
const AGE_LTV_BASE: Record<AgeBand, number> = {
  "10s": 180,
  "20s": 420,
  "30s": 780,
  "40s": 920,
  "50s": 860,
  "60s+": 640,
}

// Gender LTV multiplier
const GENDER_LTV_MULT: Record<Gender, number> = {
  female: 1.12,
  male: 0.95,
  other: 0.88,
}

// Purchase-rate base by age band (share of members who purchased in the period)
const AGE_PURCHASE_RATE: Record<AgeBand, number> = {
  "10s": 0.28,
  "20s": 0.52,
  "30s": 0.66,
  "40s": 0.61,
  "50s": 0.49,
  "60s+": 0.36,
}

// ── Totals ──

const TOTAL_MEMBERS = 24_800

// ── Age × Gender crosstab ──

function generateAgeGenderCrosstab(): AgeGenderCell[] {
  const cells: AgeGenderCell[] = []
  let totalShare = 0
  // First pass: compute raw counts
  const raw: { ageBand: AgeBand; gender: Gender; count: number }[] = []
  for (const ageBand of AGE_BANDS) {
    for (const gender of GENDERS) {
      const noise = 0.9 + srand(0, 0.2)
      const weight = AGE_WEIGHT[ageBand] * GENDER_WEIGHT[gender] * noise
      const count = Math.round(TOTAL_MEMBERS * weight)
      raw.push({ ageBand, gender, count })
      totalShare += weight
    }
  }
  // Second pass: normalise share so it sums to 100 %
  for (const item of raw) {
    const share = (item.count / TOTAL_MEMBERS) * 100
    const ltvNoise = 0.88 + srand(0, 0.24)
    const avgLtv = Math.round(
      AGE_LTV_BASE[item.ageBand] * GENDER_LTV_MULT[item.gender] * ltvNoise,
    )
    const purchaseNoise = 0.92 + srand(0, 0.16)
    const purchaseRate =
      Math.round(AGE_PURCHASE_RATE[item.ageBand] * purchaseNoise * 1000) / 10
    cells.push({
      ageBand: item.ageBand,
      gender: item.gender,
      memberCount: item.count,
      share: Math.round(share * 10) / 10,
      avgLtv,
      purchaseRate,
    })
  }
  // Silence unused-variable lint while keeping the normalising loop intent clear
  void totalShare
  return cells
}

export const ageGenderCrosstab: AgeGenderCell[] = generateAgeGenderCrosstab()

// ── Attribute LTV ranking (top segments by avg LTV) ──

const AGE_LABEL: Record<AgeBand, string> = {
  "10s": "10s",
  "20s": "20s",
  "30s": "30s",
  "40s": "40s",
  "50s": "50s",
  "60s+": "60+",
}

const GENDER_LABEL: Record<Gender, string> = {
  female: "Female",
  male: "Male",
  other: "Other",
}

function generateAttributeLtvRanking(): AttributeLtvRow[] {
  const rows = ageGenderCrosstab
    .map((cell) => ({
      segment: `${AGE_LABEL[cell.ageBand]} · ${GENDER_LABEL[cell.gender]}`,
      ageBand: cell.ageBand,
      gender: cell.gender,
      memberCount: cell.memberCount,
      share: cell.share,
      avgLtv: cell.avgLtv,
      purchaseRate: cell.purchaseRate,
    }))
    .sort((a, b) => b.avgLtv - a.avgLtv)
  return rows.map((r, i) => ({ rank: i + 1, ...r }))
}

export const attributeLtvRanking: AttributeLtvRow[] = generateAttributeLtvRanking()

// ── Acquisition channels for new members ──

const CHANNEL_LABEL: Record<AcquisitionChannel, string> = {
  organic: "Organic",
  search_ad: "Search Ads",
  social_ad: "Social Ads",
  referral: "Referral",
  campaign: "Campaign",
  store: "In-store",
}

const CHANNEL_WEIGHT: Record<AcquisitionChannel, number> = {
  organic: 0.32,
  search_ad: 0.21,
  social_ad: 0.18,
  referral: 0.13,
  campaign: 0.1,
  store: 0.06,
}

const CHANNEL_LTV_MULT: Record<AcquisitionChannel, number> = {
  organic: 1.08,
  search_ad: 0.92,
  social_ad: 0.84,
  referral: 1.22,
  campaign: 0.78,
  store: 1.05,
}

const NEW_MEMBERS_PERIOD = 3_200

function generateAcquisitionChannels(): AcquisitionChannelPoint[] {
  const channels = Object.keys(CHANNEL_WEIGHT) as AcquisitionChannel[]
  const baseLtv = 540
  const points = channels.map((channel) => {
    const noise = 0.9 + srand(0, 0.2)
    const newMembers = Math.round(
      NEW_MEMBERS_PERIOD * CHANNEL_WEIGHT[channel] * noise,
    )
    const ltvNoise = 0.9 + srand(0, 0.2)
    const avgLtv = Math.round(
      baseLtv * CHANNEL_LTV_MULT[channel] * ltvNoise,
    )
    return { channel, newMembers, avgLtv }
  })
  const total = points.reduce((s, p) => s + p.newMembers, 0)
  return points
    .map((p) => ({
      channel: p.channel,
      channelLabel: CHANNEL_LABEL[p.channel],
      newMembers: p.newMembers,
      share: Math.round((p.newMembers / total) * 1000) / 10,
      avgLtv: p.avgLtv,
    }))
    .sort((a, b) => b.newMembers - a.newMembers)
}

export const acquisitionChannels: AcquisitionChannelPoint[] = generateAcquisitionChannels()

// ── Top-line KPIs (header summary) ──

function computeKpis(): KpiItem[] {
  const totalMembers = ageGenderCrosstab.reduce(
    (s, c) => s + c.memberCount,
    0,
  )
  // Largest age band by share (sum across genders)
  const ageTotals = new Map<AgeBand, number>()
  for (const cell of ageGenderCrosstab) {
    ageTotals.set(
      cell.ageBand,
      (ageTotals.get(cell.ageBand) ?? 0) + cell.memberCount,
    )
  }
  let topAge: AgeBand = "30s"
  let topAgeCount = 0
  for (const [band, count] of ageTotals) {
    if (count > topAgeCount) {
      topAge = band
      topAgeCount = count
    }
  }
  const topAgeShare = Math.round((topAgeCount / totalMembers) * 1000) / 10

  // Average LTV weighted by member count
  const weightedLtv =
    ageGenderCrosstab.reduce((s, c) => s + c.avgLtv * c.memberCount, 0) /
    totalMembers

  // Weighted purchase rate
  const weightedPurchase =
    ageGenderCrosstab.reduce(
      (s, c) => s + c.purchaseRate * c.memberCount,
      0,
    ) / totalMembers

  // New vs existing ratio: new members in the period / existing base
  const newMembersTotal = acquisitionChannels.reduce(
    (s, c) => s + c.newMembers,
    0,
  )
  const newShare =
    Math.round((newMembersTotal / (totalMembers + newMembersTotal)) * 1000) / 10

  // Build small sparklines from segment-level data so KPIs feel data-driven
  const memberSpark = AGE_BANDS.map(
    (band) => ageTotals.get(band) ?? 0,
  )
  const ltvSpark = AGE_BANDS.map((band) => {
    const slice = ageGenderCrosstab.filter((c) => c.ageBand === band)
    const total = slice.reduce((s, c) => s + c.memberCount, 0)
    if (total === 0) return 0
    return (
      slice.reduce((s, c) => s + c.avgLtv * c.memberCount, 0) / total
    )
  })
  const purchaseSpark = AGE_BANDS.map((band) => {
    const slice = ageGenderCrosstab.filter((c) => c.ageBand === band)
    const total = slice.reduce((s, c) => s + c.memberCount, 0)
    if (total === 0) return 0
    return (
      slice.reduce((s, c) => s + c.purchaseRate * c.memberCount, 0) / total
    )
  })
  const acquisitionSpark = acquisitionChannels.map((c) => c.newMembers)

  return [
    {
      label: "Total Members",
      value: totalMembers.toLocaleString("en-US"),
      change: 4.2,
      changeLabel: "vs last quarter",
      positiveIsGood: true,
      sparklineData: memberSpark,
    },
    {
      label: `Top Segment (${AGE_LABEL[topAge]})`,
      value: `${topAgeShare.toFixed(1)}%`,
      change: 0.6,
      changeLabel: "of total base",
      positiveIsGood: true,
      sparklineData: memberSpark,
    },
    {
      label: "Avg LTV",
      value: `$${Math.round(weightedLtv).toLocaleString("en-US")}`,
      change: 3.1,
      changeLabel: "vs last quarter",
      positiveIsGood: true,
      sparklineData: ltvSpark,
    },
    {
      label: "Purchase Rate",
      value: `${weightedPurchase.toFixed(1)}%`,
      change: 1.4,
      changeLabel: "vs last quarter",
      positiveIsGood: true,
      sparklineData: purchaseSpark,
    },
    {
      label: "New / Total",
      value: `${newShare.toFixed(1)}%`,
      change: 0.8,
      changeLabel: "share of new joiners",
      positiveIsGood: true,
      sparklineData: acquisitionSpark,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const genderOptions = [
  { label: "All genders", value: "all" },
  { label: "Female", value: "female" },
  { label: "Male", value: "male" },
  { label: "Other", value: "other" },
]

export const ageBandOptions = [
  { label: "All age bands", value: "all" },
  { label: "10s", value: "10s" },
  { label: "20s", value: "20s" },
  { label: "30s", value: "30s" },
  { label: "40s", value: "40s" },
  { label: "50s", value: "50s" },
  { label: "60+", value: "60s+" },
]

// Static labels exposed for reuse in components
export const ageLabelMap = AGE_LABEL
export const genderLabelMap = GENDER_LABEL
export const ageBandsOrder = AGE_BANDS
export const gendersOrder = GENDERS
