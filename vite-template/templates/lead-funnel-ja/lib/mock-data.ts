import type {
  LeadStage,
  LeadSource,
  LeadRow,
  KpiItem,
  FunnelStageStat,
  ChannelStat,
  OwnerRanking,
} from "@/types/lead-funnel"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-15")

function isoDateBack(daysAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

// Seeded RNG unique to this template (lead-funnel-ja)
function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(127)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

// ── Static data ──

const STAGE_ORDER: LeadStage[] = [
  "Lead",
  "MQL",
  "SQL",
  "Appointment",
  "Opportunity",
]

const STAGE_PASS_PROB: Record<LeadStage, number> = {
  Lead: 1.0,
  MQL: 0.46,
  SQL: 0.54,
  Appointment: 0.62,
  Opportunity: 0.48,
}

const SOURCES: LeadSource[] = [
  "自然検索",
  "リスティング",
  "ソーシャル広告",
  "リファラル",
  "ウェビナー",
  "イベント",
  "アウトバウンド",
]

const SOURCE_PROFILE: Record<
  LeadSource,
  { weight: number; spendPerLead: number }
> = {
  自然検索: { weight: 0.26, spendPerLead: 2_400 },
  リスティング: { weight: 0.2, spendPerLead: 12_500 },
  ソーシャル広告: { weight: 0.17, spendPerLead: 8_600 },
  リファラル: { weight: 0.1, spendPerLead: 1_600 },
  ウェビナー: { weight: 0.1, spendPerLead: 5_100 },
  イベント: { weight: 0.07, spendPerLead: 19_500 },
  アウトバウンド: { weight: 0.1, spendPerLead: 10_400 },
}

const OWNERS = [
  "佐藤 真央",
  "田中 健一",
  "鈴木 美咲",
  "高橋 拓也",
  "中村 葵",
  "山本 直樹",
  "小林 結衣",
]

// ── Generate leads ──

const TOTAL_LEADS = 820

function pickSource(): LeadSource {
  const r = rng()
  let acc = 0
  for (const s of SOURCES) {
    acc += SOURCE_PROFILE[s].weight
    if (r <= acc) return s
  }
  return SOURCES[SOURCES.length - 1]
}

function stageForLead(): LeadStage {
  let current: LeadStage = "Lead"
  for (let i = 1; i < STAGE_ORDER.length; i++) {
    const next = STAGE_ORDER[i]
    if (rng() < STAGE_PASS_PROB[next]) {
      current = next
    } else {
      break
    }
  }
  return current
}

function generateLeads(): LeadRow[] {
  const out: LeadRow[] = []
  for (let i = 0; i < TOTAL_LEADS; i++) {
    const source = pickSource()
    const stage = stageForLead()
    const daysAgo = Math.round(srand(0, 89))
    out.push({
      lead_id: `L-${String(i + 1).padStart(5, "0")}`,
      source,
      stage,
      stage_changed_at: isoDateBack(daysAgo),
      owner: pick(OWNERS),
    })
  }
  return out
}

export const leads: LeadRow[] = generateLeads()

// ── Funnel ──

const STAGE_INDEX: Record<LeadStage, number> = STAGE_ORDER.reduce(
  (acc, s, i) => {
    acc[s] = i
    return acc
  },
  {} as Record<LeadStage, number>,
)

function countAtOrBeyond(stage: LeadStage): number {
  const idx = STAGE_INDEX[stage]
  return leads.filter((l) => STAGE_INDEX[l.stage] >= idx).length
}

function generateFunnel(): FunnelStageStat[] {
  const raw = STAGE_ORDER.map((stage) => ({
    stage,
    count: countAtOrBeyond(stage),
  }))
  const sorted = [...raw].sort((a, b) => b.count - a.count)
  const top = sorted[0]?.count ?? 0
  return sorted.map((row, i) => {
    const prev = i === 0 ? row.count : sorted[i - 1].count
    return {
      stage: row.stage,
      count: row.count,
      conversionFromPrev:
        prev === 0 ? 0 : Math.round((row.count / prev) * 1000) / 10,
      conversionFromTop:
        top === 0 ? 0 : Math.round((row.count / top) * 1000) / 10,
    }
  })
}

export const funnelStats: FunnelStageStat[] = generateFunnel()

// ── Channel + CPL ──

function generateChannelStats(): ChannelStat[] {
  return SOURCES.map((source) => {
    const channelLeads = leads.filter((l) => l.source === source)
    const count = channelLeads.length
    const mqls = channelLeads.filter(
      (l) => STAGE_INDEX[l.stage] >= STAGE_INDEX.MQL,
    ).length
    const sqls = channelLeads.filter(
      (l) => STAGE_INDEX[l.stage] >= STAGE_INDEX.SQL,
    ).length
    const appointments = channelLeads.filter(
      (l) => STAGE_INDEX[l.stage] >= STAGE_INDEX.Appointment,
    ).length
    const baseSpend = SOURCE_PROFILE[source].spendPerLead
    const variance = 0.88 + srand(0, 0.24)
    const spend = Math.round(count * baseSpend * variance)
    const cpl = count === 0 ? 0 : Math.round(spend / count)
    return { source, leads: count, mqls, sqls, appointments, spend, cpl }
  }).sort((a, b) => b.leads - a.leads)
}

export const channelStats: ChannelStat[] = generateChannelStats()

// ── IS ranking ──

function generateOwnerRanking(): OwnerRanking[] {
  return OWNERS.map((owner) => {
    const ownerLeads = leads.filter((l) => l.owner === owner)
    const sqls = ownerLeads.filter(
      (l) => STAGE_INDEX[l.stage] >= STAGE_INDEX.SQL,
    ).length
    const appointments = ownerLeads.filter(
      (l) => STAGE_INDEX[l.stage] >= STAGE_INDEX.Appointment,
    ).length
    const opportunities = ownerLeads.filter(
      (l) => l.stage === "Opportunity",
    ).length
    const appointmentRate =
      sqls === 0 ? 0 : Math.round((appointments / sqls) * 1000) / 10
    return { owner, appointments, sqls, opportunities, appointmentRate }
  }).sort((a, b) => b.appointments - a.appointments)
}

export const ownerRanking: OwnerRanking[] = generateOwnerRanking()

// ── KPIs ──

function computeKpis(): KpiItem[] {
  const totalLeads = leads.length
  const totalMql = countAtOrBeyond("MQL")
  const totalSql = countAtOrBeyond("SQL")
  const totalAppt = countAtOrBeyond("Appointment")
  const totalOpp = countAtOrBeyond("Opportunity")
  const mqlToSql = totalMql === 0 ? 0 : (totalSql / totalMql) * 100
  const sqlToAppt = totalSql === 0 ? 0 : (totalAppt / totalSql) * 100
  const apptToOpp = totalAppt === 0 ? 0 : (totalOpp / totalAppt) * 100
  const totalSpend = channelStats.reduce((s, c) => s + c.spend, 0)
  const avgCpl = totalLeads === 0 ? 0 : totalSpend / totalLeads

  return [
    {
      label: "リード数",
      value: totalLeads.toLocaleString("ja-JP"),
      change: 7.2,
      changeLabel: "前期間比",
      positiveIsGood: true,
      sparklineData: funnelStats.map((f) => f.count),
    },
    {
      label: "MQL → SQL率",
      value: `${mqlToSql.toFixed(1)}%`,
      change: 2.4,
      changeLabel: "前期間比",
      positiveIsGood: true,
      sparklineData: channelStats.map((c) =>
        c.mqls === 0 ? 0 : (c.sqls / c.mqls) * 100,
      ),
    },
    {
      label: "アポ獲得率",
      value: `${sqlToAppt.toFixed(1)}%`,
      change: -1.8,
      changeLabel: "前期間比",
      positiveIsGood: true,
      sparklineData: channelStats.map((c) =>
        c.sqls === 0 ? 0 : (c.appointments / c.sqls) * 100,
      ),
    },
    {
      label: "商談化率",
      value: `${apptToOpp.toFixed(1)}%`,
      change: 3.1,
      changeLabel: "前期間比",
      positiveIsGood: true,
      sparklineData: channelStats.map((c) =>
        c.appointments === 0 ? 0 : (c.sqls / c.appointments) * 100,
      ),
    },
    {
      label: "平均CPL",
      value: `¥${avgCpl.toFixed(0)}`,
      change: -4.6,
      changeLabel: "前期間比",
      positiveIsGood: false,
      sparklineData: channelStats.map((c) => c.cpl),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const sourceOptions = [
  { label: "全チャネル", value: "all" },
  ...SOURCES.map((s) => ({ label: s, value: s })),
]

export const ownerOptions = [
  { label: "全担当者", value: "all" },
  ...OWNERS.map((o) => ({ label: o, value: o })),
]

export const STAGE_LIST = STAGE_ORDER

// ── Stage label localization ──

export const STAGE_LABEL_JA: Record<LeadStage, string> = {
  Lead: "リード",
  MQL: "MQL",
  SQL: "SQL",
  Appointment: "アポ獲得",
  Opportunity: "商談化",
}
