import type {
  KpiItem,
  MemberWorkHours,
  OvertimeTrendPoint,
  DepartmentPaidLeave,
  Department,
} from "@/types/attendance-dashboard"

// ── Seeded RNG (スナップショット安定化用) ──

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

// ── 定数 ──

const BASE_DATE = new Date("2024-03-31")

// 月の標準労働時間 (160h)
const STANDARD_MONTHLY_HOURS = 160

// 残業時間の閾値: 法定 45h / 月 を注意ライン、80h を過労ライン
export const OVERTIME_CAUTION = 45
export const OVERTIME_WARNING = 80

const DEPARTMENTS: { id: Department; label: string; size: number }[] = [
  { id: "engineering", label: "開発", size: 6 },
  { id: "sales", label: "営業", size: 4 },
  { id: "marketing", label: "マーケ", size: 3 },
  { id: "operations", label: "運用", size: 3 },
  { id: "support", label: "サポート", size: 3 },
  { id: "corporate", label: "管理", size: 2 },
]

const FIRST_NAMES = [
  "陽介", "美咲", "健一", "彩花", "翔太", "結衣", "大輔", "玲奈",
  "拓海", "茉莉", "蓮", "葵", "悠斗", "凛", "颯太", "心晴",
  "悠真", "杏奈", "涼", "千尋", "海斗",
]
const LAST_NAMES = [
  "佐藤", "鈴木", "高橋", "田中", "伊藤", "渡辺", "山本", "中村",
  "小林", "加藤", "吉田", "山田", "佐々木", "山口", "松本", "井上",
  "木村", "林", "斎藤", "清水", "山崎",
]

// ── メンバー別労働時間ランキング (シグネチャ要素) ──

function generateMembers(): MemberWorkHours[] {
  const members: MemberWorkHours[] = []
  let memberCounter = 0
  for (const dept of DEPARTMENTS) {
    for (let i = 0; i < dept.size; i++) {
      const id = `M${(memberCounter + 1).toString().padStart(3, "0")}`
      const memberName = `${LAST_NAMES[(memberCounter * 3) % LAST_NAMES.length]} ${FIRST_NAMES[memberCounter % FIRST_NAMES.length]}`

      // 部署バイアス: 開発・営業は残業多め
      const deptBias =
        dept.id === "engineering"
          ? 12
          : dept.id === "sales"
            ? 8
            : dept.id === "operations"
              ? 4
              : dept.id === "support"
                ? 2
                : 0
      const individualNoise = srand(-8, 16)
      const overtimeHours = Math.max(
        0,
        Math.round((deptBias + individualNoise) * 10) / 10,
      )
      const paidLeaveDays = Math.round(srand(0.5, 2.4) * 10) / 10
      const totalWorkHours =
        Math.round(
          (STANDARD_MONTHLY_HOURS + overtimeHours - paidLeaveDays * 8) * 10,
        ) / 10

      // 約12%が深夜シフトあり
      const nightShiftDays = rng() < 0.12 ? Math.ceil(srand(1, 5)) : 0

      members.push({
        memberId: id,
        memberName,
        department: dept.id,
        totalWorkHours,
        overtimeHours,
        paidLeaveDays,
        nightShiftDays,
      })
      memberCounter += 1
    }
  }
  // 労働時間の降順で並べる
  return members.sort((a, b) => b.totalWorkHours - a.totalWorkHours)
}

export const members: MemberWorkHours[] = generateMembers()

// ── 残業時間の月次推移 (直近12ヶ月) ──

function monthLabel(monthsAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setMonth(d.getMonth() - monthsAgo)
  return d.toISOString().slice(0, 7) // YYYY-MM
}

function generateOvertimeTrend(): OvertimeTrendPoint[] {
  const points: OvertimeTrendPoint[] = []
  const totalHeadcount = members.length
  for (let i = 11; i >= 0; i--) {
    // 季節要因: 期末 (3月・12月) はピーク、夏期 (8月) は下振れ
    const month = new Date(BASE_DATE)
    month.setMonth(month.getMonth() - i)
    const m = month.getMonth() // 0..11
    const seasonal =
      m === 2 || m === 11
        ? 1.18
        : m === 7
          ? 0.78
          : 1.0
    const averageOvertimePerMember = Math.round(
      (8 + srand(-1.5, 2.5)) * seasonal * 10,
    ) / 10
    const totalOvertime = Math.round(
      averageOvertimePerMember * totalHeadcount * 10,
    ) / 10
    points.push({
      month: monthLabel(i),
      totalOvertime,
      averageOvertimePerMember,
    })
  }
  return points
}

export const overtimeTrend: OvertimeTrendPoint[] = generateOvertimeTrend()

// ── 部署別の有給取得状況 ──

function generatePaidLeaveByDept(): DepartmentPaidLeave[] {
  return DEPARTMENTS.map((dept) => {
    const headcount = dept.size
    const grantedPerPerson = 18 // 年次有給付与日数の想定
    const grantedDays = grantedPerPerson * headcount
    // マーケ・管理は取得率高め、開発・運用は低めという想定
    const usagePctBias =
      dept.id === "marketing"
        ? 0.78
        : dept.id === "corporate"
          ? 0.74
          : dept.id === "sales"
            ? 0.62
            : dept.id === "support"
              ? 0.58
              : dept.id === "engineering"
                ? 0.52
                : 0.48
    const noise = srand(-0.07, 0.07)
    const usageRate = Math.min(0.95, Math.max(0.3, usagePctBias + noise))
    const usedDays = Math.round(grantedDays * usageRate * 10) / 10
    return {
      department: dept.id,
      departmentLabel: dept.label,
      grantedDays,
      usedDays,
      usageRatePct: Math.round(usageRate * 1000) / 10,
      headcount,
    }
  })
}

export const paidLeaveByDept: DepartmentPaidLeave[] = generatePaidLeaveByDept()

// ── 主要 KPI (4枚) ──

function computeKpis(): KpiItem[] {
  const headcount = members.length
  const avgWorkHours =
    members.reduce((s, m) => s + m.totalWorkHours, 0) / headcount
  const totalOvertime = members.reduce((s, m) => s + m.overtimeHours, 0)
  const nightShiftMembers = members.filter((m) => m.nightShiftDays > 0).length

  const totalGranted = paidLeaveByDept.reduce((s, d) => s + d.grantedDays, 0)
  const totalUsed = paidLeaveByDept.reduce((s, d) => s + d.usedDays, 0)
  const paidLeaveRate = Math.round((totalUsed / totalGranted) * 1000) / 10

  const last = overtimeTrend[overtimeTrend.length - 1]
  const prev = overtimeTrend[overtimeTrend.length - 2]
  const pct = (now: number, p: number) =>
    p === 0 ? 0 : Math.round(((now - p) / p) * 1000) / 10

  return [
    {
      label: "平均労働時間",
      value: `${avgWorkHours.toFixed(1)} h`,
      change: pct(avgWorkHours, STANDARD_MONTHLY_HOURS),
      changeLabel: "標準比",
      positiveIsGood: false,
      sparklineData: overtimeTrend.map(
        (p) => STANDARD_MONTHLY_HOURS + p.averageOvertimePerMember,
      ),
    },
    {
      label: "残業時間合計",
      value: `${Math.round(totalOvertime).toLocaleString("ja-JP")} h`,
      change: pct(last.totalOvertime, prev.totalOvertime),
      changeLabel: "前月比",
      positiveIsGood: false,
      sparklineData: overtimeTrend.map((p) => p.totalOvertime),
    },
    {
      label: "有給取得率",
      value: `${paidLeaveRate.toFixed(1)}%`,
      change: paidLeaveRate - 70,
      changeLabel: "目標70%との差",
      positiveIsGood: true,
      sparklineData: paidLeaveByDept.map((d) => d.usageRatePct),
    },
    {
      label: "深夜労働者数",
      value: `${nightShiftMembers} 名`,
      change: nightShiftMembers,
      changeLabel: "今期",
      positiveIsGood: false,
      sparklineData: members.map((m) => m.nightShiftDays),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const departmentOptions = [
  { label: "全部署", value: "all" },
  ...DEPARTMENTS.map((d) => ({ label: d.label, value: d.id })),
]
