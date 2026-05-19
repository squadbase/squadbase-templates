import type {
  KpiItem,
  MrRankingRow,
  FacilityRxSeries,
  UncoveredFacilityRow,
} from "@/types/mr-activity-dashboard"

// ── Helpers ──

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// JA バリアント用に EN とは異なる seed を使う
const rng = seededRand(2028)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function pct(now: number, prev: number): number {
  return prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10
}

// ── MR 構成 ──

const MR_NAMES = [
  "佐藤 健一",
  "中村 真理",
  "鈴木 浩二",
  "田中 直人",
  "山本 美咲",
  "高橋 慎吾",
  "伊藤 由紀",
  "渡辺 拓也",
  "小林 玲奈",
  "加藤 大輔",
  "斎藤 圭",
  "松本 彩",
]

const TERRITORIES = ["関東", "関西", "中部", "九州", "東北"]

// ── MR ランキング (訪問件数で降順) ──

function generateMrRanking(): MrRankingRow[] {
  const rows: MrRankingRow[] = MR_NAMES.map((name, i) => {
    const baseVisits = 70 - i * 3 + Math.round(srand(-6, 6))
    const visits = Math.max(8, baseVisits)
    const meetingRate = Math.round((58 + srand(-12, 18)) * 10) / 10
    const meetings = Math.round((visits * meetingRate) / 100)
    const avgRxShare = Math.round((34 + srand(-10, 14)) * 10) / 10
    return {
      mrId: `mr_${String(i + 1).padStart(3, "0")}`,
      mrName: name,
      territory: TERRITORIES[i % TERRITORIES.length],
      visits,
      meetings,
      meetingRate,
      avgRxShare,
    }
  })
  return rows.sort((a, b) => b.visits - a.visits)
}

export const mrRanking: MrRankingRow[] = generateMrRanking()

// ── 施設別の処方シェア推移 (上位5施設×直近12週) ──

const FACILITY_NAMES = [
  "北橋総合医療センター",
  "東山大学附属病院",
  "湖南クリニック",
  "中央メモリアル病院",
  "桜木総合病院",
]

const WEEKS = 12

function generateFacilityRxSeries(): FacilityRxSeries[] {
  return FACILITY_NAMES.map((name, idx) => {
    const startShare = 24 + idx * 4 + srand(-3, 3)
    const slope = srand(-0.6, 1.4)
    const data = Array.from({ length: WEEKS }).map((_, w) => {
      const weekFromNow = WEEKS - 1 - w
      const trend = startShare + slope * w
      const noise = srand(-1.8, 1.8)
      const rxShare = Math.max(2, Math.min(72, Math.round((trend + noise) * 10) / 10))
      return {
        weekLabel: weekFromNow === 0 ? "今週" : `${weekFromNow}週前`,
        rxShare,
      }
    })
    return {
      facilityId: `fac_${String(idx + 1).padStart(3, "0")}`,
      facilityName: name,
      data,
    }
  })
}

export const facilityRxSeries: FacilityRxSeries[] = generateFacilityRxSeries()

// ── 未カバー施設リスト ──

const UNCOVERED_BASE: Omit<UncoveredFacilityRow, "daysSinceLastVisit">[] = [
  {
    facilityId: "fac_201",
    facilityName: "ハイランドファミリークリニック",
    territory: "関東",
    segment: "key_account",
    potentialRxShare: 38,
    assignedMr: "佐藤 健一",
  },
  {
    facilityId: "fac_202",
    facilityName: "ベイビュー地域医療センター",
    territory: "関西",
    segment: "growth",
    potentialRxShare: 22,
    assignedMr: "中村 真理",
  },
  {
    facilityId: "fac_203",
    facilityName: "メープルリッジ健康センター",
    territory: "中部",
    segment: "key_account",
    potentialRxShare: 45,
    assignedMr: null,
  },
  {
    facilityId: "fac_204",
    facilityName: "サンセット内科医院",
    territory: "九州",
    segment: "watch",
    potentialRxShare: 12,
    assignedMr: "鈴木 浩二",
  },
  {
    facilityId: "fac_205",
    facilityName: "グリーンフィールド小児病院",
    territory: "東北",
    segment: "growth",
    potentialRxShare: 28,
    assignedMr: "田中 直人",
  },
  {
    facilityId: "fac_206",
    facilityName: "シダークレストクリニック",
    territory: "関東",
    segment: "watch",
    potentialRxShare: 9,
    assignedMr: null,
  },
  {
    facilityId: "fac_207",
    facilityName: "ハーバービュー外科センター",
    territory: "関西",
    segment: "key_account",
    potentialRxShare: 41,
    assignedMr: "山本 美咲",
  },
  {
    facilityId: "fac_208",
    facilityName: "オークウッドメモリアル病院",
    territory: "中部",
    segment: "growth",
    potentialRxShare: 19,
    assignedMr: "高橋 慎吾",
  },
]

function generateUncovered(): UncoveredFacilityRow[] {
  return UNCOVERED_BASE.map((row, i) => ({
    ...row,
    daysSinceLastVisit: 18 + i * 6 + Math.round(srand(0, 9)),
  })).sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit)
}

export const uncoveredFacilities: UncoveredFacilityRow[] = generateUncovered()

// ── 主要 KPI (訪問件数・面談率・処方シェア・施設別カバレッジ) ──

const TOTAL_FACILITIES = 184
const COVERED_FACILITIES = 142
const PREV_COVERED_FACILITIES = 134

function computeKpis(): KpiItem[] {
  const totalVisits = mrRanking.reduce((s, r) => s + r.visits, 0)
  const totalMeetings = mrRanking.reduce((s, r) => s + r.meetings, 0)
  const meetingRate = (totalMeetings / Math.max(1, totalVisits)) * 100
  const prevVisits = Math.round(totalVisits * 0.94)
  const prevMeetingRate = meetingRate - 2.4
  const rxShare =
    mrRanking.reduce((s, r) => s + r.avgRxShare, 0) / mrRanking.length
  const prevRxShare = rxShare - 1.6
  const coverage = (COVERED_FACILITIES / TOTAL_FACILITIES) * 100
  const prevCoverage = (PREV_COVERED_FACILITIES / TOTAL_FACILITIES) * 100

  const visitTrend = Array.from({ length: 12 }).map((_, i) =>
    Math.round(prevVisits + ((totalVisits - prevVisits) * (i + 1)) / 12 + srand(-12, 12)),
  )
  const meetingTrend = Array.from({ length: 12 }).map((_, i) =>
    Math.round(((prevMeetingRate + ((meetingRate - prevMeetingRate) * (i + 1)) / 12) + srand(-0.6, 0.6)) * 10) / 10,
  )
  const rxTrend = Array.from({ length: 12 }).map((_, i) =>
    Math.round(((prevRxShare + ((rxShare - prevRxShare) * (i + 1)) / 12) + srand(-0.4, 0.4)) * 10) / 10,
  )
  const coverageTrend = Array.from({ length: 12 }).map((_, i) =>
    Math.round(((prevCoverage + ((coverage - prevCoverage) * (i + 1)) / 12) + srand(-0.3, 0.3)) * 10) / 10,
  )

  return [
    {
      label: "訪問件数",
      value: totalVisits.toLocaleString("ja-JP"),
      change: pct(totalVisits, prevVisits),
      changeLabel: "前期比",
      positiveIsGood: true,
      sparklineData: visitTrend,
    },
    {
      label: "面談率",
      value: `${meetingRate.toFixed(1)}%`,
      change: Math.round((meetingRate - prevMeetingRate) * 10) / 10,
      changeLabel: "前期比",
      positiveIsGood: true,
      sparklineData: meetingTrend,
    },
    {
      label: "平均処方シェア",
      value: `${rxShare.toFixed(1)}%`,
      change: Math.round((rxShare - prevRxShare) * 10) / 10,
      changeLabel: "前期比",
      positiveIsGood: true,
      sparklineData: rxTrend,
    },
    {
      label: "施設別カバレッジ",
      value: `${coverage.toFixed(1)}%`,
      change: Math.round((coverage - prevCoverage) * 10) / 10,
      changeLabel: `${COVERED_FACILITIES}/${TOTAL_FACILITIES} 施設`,
      positiveIsGood: true,
      sparklineData: coverageTrend,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── インサイト用集計値 ──

export const coverageStats = {
  total: TOTAL_FACILITIES,
  covered: COVERED_FACILITIES,
  uncovered: TOTAL_FACILITIES - COVERED_FACILITIES,
  prevCovered: PREV_COVERED_FACILITIES,
}

// ── フィルター選択肢 ──

export const territoryOptions = [
  { label: "全エリア", value: "all" },
  { label: "関東", value: "関東" },
  { label: "関西", value: "関西" },
  { label: "中部", value: "中部" },
  { label: "九州", value: "九州" },
  { label: "東北", value: "東北" },
]

export const segmentOptions = [
  { label: "全セグメント", value: "all" },
  { label: "重点施設", value: "key_account" },
  { label: "成長施設", value: "growth" },
  { label: "ウォッチ", value: "watch" },
]
