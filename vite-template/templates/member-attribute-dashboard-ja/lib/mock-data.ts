import type {
  AgeBand,
  Gender,
  AcquisitionChannel,
  AgeGenderCell,
  AttributeLtvRow,
  AcquisitionChannelPoint,
  KpiItem,
} from "@/types/member-attribute-dashboard"

// ── seeded RNG (テンプレートごとに固有 seed) ──

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

// ── 静的ディメンション ──

const AGE_BANDS: AgeBand[] = ["10s", "20s", "30s", "40s", "50s", "60s+"]
const GENDERS: Gender[] = ["female", "male", "other"]

// 会員ベース全体に占める年代別の構成比
const AGE_WEIGHT: Record<AgeBand, number> = {
  "10s": 0.05,
  "20s": 0.22,
  "30s": 0.28,
  "40s": 0.21,
  "50s": 0.14,
  "60s+": 0.1,
}

// 各年代内の性別構成比
const GENDER_WEIGHT: Record<Gender, number> = {
  female: 0.56,
  male: 0.41,
  other: 0.03,
}

// 年代別 LTV ベース (円)
const AGE_LTV_BASE: Record<AgeBand, number> = {
  "10s": 18_000,
  "20s": 42_000,
  "30s": 78_000,
  "40s": 92_000,
  "50s": 86_000,
  "60s+": 64_000,
}

// 性別の LTV 補正
const GENDER_LTV_MULT: Record<Gender, number> = {
  female: 1.12,
  male: 0.95,
  other: 0.88,
}

// 年代別 購入率ベース
const AGE_PURCHASE_RATE: Record<AgeBand, number> = {
  "10s": 0.28,
  "20s": 0.52,
  "30s": 0.66,
  "40s": 0.61,
  "50s": 0.49,
  "60s+": 0.36,
}

// ── 合計 ──

const TOTAL_MEMBERS = 24_800

// ── 年代 × 性別 クロス集計 ──

function generateAgeGenderCrosstab(): AgeGenderCell[] {
  const cells: AgeGenderCell[] = []
  let totalShare = 0
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
  void totalShare
  return cells
}

export const ageGenderCrosstab: AgeGenderCell[] = generateAgeGenderCrosstab()

// ── 属性別 LTV ランキング ──

const AGE_LABEL: Record<AgeBand, string> = {
  "10s": "10代",
  "20s": "20代",
  "30s": "30代",
  "40s": "40代",
  "50s": "50代",
  "60s+": "60代以上",
}

const GENDER_LABEL: Record<Gender, string> = {
  female: "女性",
  male: "男性",
  other: "その他",
}

function generateAttributeLtvRanking(): AttributeLtvRow[] {
  const rows = ageGenderCrosstab
    .map((cell) => ({
      segment: `${AGE_LABEL[cell.ageBand]} ・ ${GENDER_LABEL[cell.gender]}`,
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

// ── 新規会員の獲得チャネル ──

const CHANNEL_LABEL: Record<AcquisitionChannel, string> = {
  organic: "オーガニック",
  search_ad: "検索広告",
  social_ad: "SNS広告",
  referral: "紹介",
  campaign: "キャンペーン",
  store: "店頭",
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
  const baseLtv = 54_000
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

// ── 主要 KPI ──

function computeKpis(): KpiItem[] {
  const totalMembers = ageGenderCrosstab.reduce(
    (s, c) => s + c.memberCount,
    0,
  )
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

  const weightedLtv =
    ageGenderCrosstab.reduce((s, c) => s + c.avgLtv * c.memberCount, 0) /
    totalMembers

  const weightedPurchase =
    ageGenderCrosstab.reduce(
      (s, c) => s + c.purchaseRate * c.memberCount,
      0,
    ) / totalMembers

  const newMembersTotal = acquisitionChannels.reduce(
    (s, c) => s + c.newMembers,
    0,
  )
  const newShare =
    Math.round((newMembersTotal / (totalMembers + newMembersTotal)) * 1000) / 10

  const memberSpark = AGE_BANDS.map((band) => ageTotals.get(band) ?? 0)
  const ltvSpark = AGE_BANDS.map((band) => {
    const slice = ageGenderCrosstab.filter((c) => c.ageBand === band)
    const total = slice.reduce((s, c) => s + c.memberCount, 0)
    if (total === 0) return 0
    return slice.reduce((s, c) => s + c.avgLtv * c.memberCount, 0) / total
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
      label: "会員数",
      value: totalMembers.toLocaleString("ja-JP"),
      change: 4.2,
      changeLabel: "前四半期比",
      positiveIsGood: true,
      sparklineData: memberSpark,
    },
    {
      label: `最大層 (${AGE_LABEL[topAge]})`,
      value: `${topAgeShare.toFixed(1)}%`,
      change: 0.6,
      changeLabel: "全体に占める割合",
      positiveIsGood: true,
      sparklineData: memberSpark,
    },
    {
      label: "平均 LTV",
      value: `¥${Math.round(weightedLtv).toLocaleString("ja-JP")}`,
      change: 3.1,
      changeLabel: "前四半期比",
      positiveIsGood: true,
      sparklineData: ltvSpark,
    },
    {
      label: "購入率",
      value: `${weightedPurchase.toFixed(1)}%`,
      change: 1.4,
      changeLabel: "前四半期比",
      positiveIsGood: true,
      sparklineData: purchaseSpark,
    },
    {
      label: "新規 / 全体",
      value: `${newShare.toFixed(1)}%`,
      change: 0.8,
      changeLabel: "新規会員の構成比",
      positiveIsGood: true,
      sparklineData: acquisitionSpark,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const genderOptions = [
  { label: "全性別", value: "all" },
  { label: "女性", value: "female" },
  { label: "男性", value: "male" },
  { label: "その他", value: "other" },
]

export const ageBandOptions = [
  { label: "全年代", value: "all" },
  { label: "10代", value: "10s" },
  { label: "20代", value: "20s" },
  { label: "30代", value: "30s" },
  { label: "40代", value: "40s" },
  { label: "50代", value: "50s" },
  { label: "60代以上", value: "60s+" },
]

// コンポーネントで再利用する静的ラベル
export const ageLabelMap = AGE_LABEL
export const genderLabelMap = GENDER_LABEL
export const ageBandsOrder = AGE_BANDS
export const gendersOrder = GENDERS
