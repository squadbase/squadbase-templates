import { addDays, format } from "date-fns"
import type {
  DetailRow,
  SummaryRow,
  TrendPoint,
} from "@/types/ui-template-table-focus"

const BASE_DATE = new Date("2024-03-31")
const DAYS = 30

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const rand = seededRandom(31)

const NAMES = [
  "Aurora ワイヤレスヘッドホン", "Halo スマートウォッチ", "Vista 4K アクションカメラ",
  "Nimbus メカニカルキーボード", "Orbit ワイヤレスマウス", "Pulse フィットネストラッカー",
  "Echo Bluetooth スピーカー", "Lumen デスクライト", "Drift スタンディングデスク", "Quasar USB-C ハブ",
  "Beacon HD ウェブカメラ", "Stratus 冷却パッド", "Comet モバイルバッテリー 20K", "Solar ソーラー充電器",
  "Nova エルゴノミックチェア", "Apex モニターアーム", "Glide 縦型マウス", "Zenith ヘッドセット",
  "Tide エルゴマット", "Crest ワイヤレス充電器", "Forge ケーブルオーガナイザー", "Pulse スマートプラグ",
  "Wave ノイズフィルター", "Atlas 海外用アダプター",
]
const OWNERS = ["田中 健", "佐藤 美咲", "鈴木 大樹", "高橋 真衣", "伊藤 翔", "山田 美穂"]
const CATEGORIES = ["オーディオ", "ウェアラブル", "カメラ", "周辺機器", "ホーム"]
const STATUSES: DetailRow["status"][] = ["active", "active", "active", "paused", "draft"]

export const detailRows: DetailRow[] = NAMES.map((name, i) => {
  const revenue = Math.round(4_000_000 + rand() * 16_000_000)
  const units = Math.round(revenue / (4_000 + rand() * 22_000))
  return {
    id: `row-${String(i + 1).padStart(2, "0")}`,
    name,
    owner: OWNERS[i % OWNERS.length],
    status: STATUSES[i % STATUSES.length],
    category: CATEGORIES[i % CATEGORIES.length],
    revenue,
    units,
    margin: Math.round((18 + rand() * 32) * 10) / 10,
    updated: format(addDays(BASE_DATE, -Math.floor(rand() * 14)), "yyyy-MM-dd"),
  }
})

const segmentMap = new Map<string, { count: number; revenue: number; marginSum: number }>()
for (const r of detailRows) {
  const cur = segmentMap.get(r.category) ?? { count: 0, revenue: 0, marginSum: 0 }
  cur.count += 1
  cur.revenue += r.revenue
  cur.marginSum += r.margin
  segmentMap.set(r.category, cur)
}
const totalRev = [...segmentMap.values()].reduce((s, v) => s + v.revenue, 0)
export const summaryRows: SummaryRow[] = [...segmentMap.entries()]
  .map(([segment, v]) => ({
    segment,
    count: v.count,
    revenue: v.revenue,
    avgMargin: Math.round((v.marginSum / v.count) * 10) / 10,
    share: v.revenue / totalRev,
  }))
  .sort((a, b) => b.revenue - a.revenue)

export const trendSeries: TrendPoint[] = Array.from({ length: DAYS }, (_, i) => {
  const date = addDays(BASE_DATE, i - DAYS + 1)
  const base = 2_200_000 + i * 24_000 + (rand() - 0.5) * 600_000
  return {
    date: format(date, "yyyy-MM-dd"),
    value: Math.max(1_000_000, Math.round(base)),
  }
})

