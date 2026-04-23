import type {
  KpiItem,
  ChannelBreakdown,
  DailyTrafficTrend,
  PageTrafficRow,
  CategoryPerformance,
  ContentRankingItem,
  DailySearchTrend,
  KeywordRankingDisplay,
  CtrPositionPoint,
  HeatmapCell,
} from "@/types/web-seo"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-15")

function dateStr(daysAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function isWeekend(daysAgo: number): boolean {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  const day = d.getDay()
  return day === 0 || day === 6
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(42)

function srand(min: number, max: number): number {
  return Math.round(min + rng() * (max - min))
}

// ── Daily Traffic Trend (90 days) ──

function generateDailyTraffic(): DailyTrafficTrend[] {
  const data: DailyTrafficTrend[] = []
  for (let i = 89; i >= 0; i--) {
    const weekendFactor = isWeekend(i) ? 0.6 : 1.0
    const trendFactor = 1 + (89 - i) * 0.003
    const noise = 0.85 + srand(0, 30) / 100
    const basePv = 3200 * weekendFactor * trendFactor * noise
    const pv = Math.round(basePv)
    const uu = Math.round(pv * (0.55 + srand(0, 10) / 100))
    const sessions = Math.round(uu * (1.15 + srand(0, 10) / 100))
    data.push({ date: dateStr(i), pageviews: pv, uniqueUsers: uu, sessions })
  }
  return data
}

export const dailyTrafficTrend: DailyTrafficTrend[] = generateDailyTraffic()

// ── Traffic KPIs ──

function computeTrafficKpis(): KpiItem[] {
  const recent = dailyTrafficTrend.slice(-30)
  const previous = dailyTrafficTrend.slice(-60, -30)

  const sum = (arr: DailyTrafficTrend[], key: keyof DailyTrafficTrend) =>
    arr.reduce((s, d) => s + (d[key] as number), 0)

  const pvNow = sum(recent, "pageviews")
  const pvPrev = sum(previous, "pageviews")
  const uuNow = sum(recent, "uniqueUsers")
  const uuPrev = sum(previous, "uniqueUsers")
  const sessNow = sum(recent, "sessions")
  const sessPrev = sum(previous, "sessions")

  const bounceNow = 42.3
  const bouncePrev = 45.1

  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "Pageviews",
      value: pvNow.toLocaleString("en-US"),
      change: pct(pvNow, pvPrev),
      changeLabel: "vs. last month",
      positiveIsGood: true,
      sparklineData: recent.map((d) => d.pageviews),
    },
    {
      label: "Unique Users",
      value: uuNow.toLocaleString("en-US"),
      change: pct(uuNow, uuPrev),
      changeLabel: "vs. last month",
      positiveIsGood: true,
      sparklineData: recent.map((d) => d.uniqueUsers),
    },
    {
      label: "Sessions",
      value: sessNow.toLocaleString("en-US"),
      change: pct(sessNow, sessPrev),
      changeLabel: "vs. last month",
      positiveIsGood: true,
      sparklineData: recent.map((d) => d.sessions),
    },
    {
      label: "Bounce Rate",
      value: `${bounceNow}%`,
      change: Math.round((bounceNow - bouncePrev) * 10) / 10,
      changeLabel: "vs. last month",
      positiveIsGood: false,
      sparklineData: recent.map((_, i) => 45 - i * 0.1 + srand(-2, 2)),
    },
  ]
}

export const trafficKpis: KpiItem[] = computeTrafficKpis()

// ── Channel Breakdown ──

export const channelBreakdown: ChannelBreakdown[] = [
  { channel: "Organic Search", sessions: 12450, percentage: 43.2 },
  { channel: "Direct", sessions: 5780, percentage: 20.1 },
  { channel: "Referral", sessions: 4320, percentage: 15.0 },
  { channel: "Social", sessions: 3150, percentage: 10.9 },
  { channel: "Email", sessions: 1820, percentage: 6.3 },
  { channel: "Paid Search", sessions: 1280, percentage: 4.5 },
]

// ── Page Traffic ──

export const pageTrafficData: PageTrafficRow[] = [
  { pageTitle: "The Complete Guide to React Hooks", pagePath: "/blog/react-hooks-guide", pageviews: 8420, uniquePageviews: 6230, avgTimeOnPage: 245, bounceRate: 32.1 },
  { pageTitle: "TypeScript 5.0: What's New", pagePath: "/blog/typescript-5-features", pageviews: 6150, uniquePageviews: 4820, avgTimeOnPage: 198, bounceRate: 38.5 },
  { pageTitle: "SaaS LTV/CAC Analysis Playbook", pagePath: "/blog/saas-ltv-cac", pageviews: 5230, uniquePageviews: 4100, avgTimeOnPage: 312, bounceRate: 28.7 },
  { pageTitle: "Product Management 101", pagePath: "/blog/product-management-101", pageviews: 4890, uniquePageviews: 3650, avgTimeOnPage: 267, bounceRate: 35.2 },
  { pageTitle: "Remote Work Productivity Report 2024", pagePath: "/blog/remote-work-report", pageviews: 4210, uniquePageviews: 3280, avgTimeOnPage: 189, bounceRate: 41.3 },
  { pageTitle: "Next.js App Router Migration Guide", pagePath: "/blog/nextjs-app-router", pageviews: 3870, uniquePageviews: 2950, avgTimeOnPage: 278, bounceRate: 30.8 },
  { pageTitle: "Marketing Automation Case Study", pagePath: "/blog/ma-case-study", pageviews: 3540, uniquePageviews: 2710, avgTimeOnPage: 225, bounceRate: 36.9 },
  { pageTitle: "Building a Design System in Figma", pagePath: "/blog/figma-design-system", pageviews: 3180, uniquePageviews: 2460, avgTimeOnPage: 301, bounceRate: 29.4 },
  { pageTitle: "Data-Driven Management in Practice", pagePath: "/blog/data-driven-management", pageviews: 2950, uniquePageviews: 2180, avgTimeOnPage: 342, bounceRate: 26.1 },
  { pageTitle: "AWS Cost Optimization Guide", pagePath: "/blog/aws-cost-optimization", pageviews: 2720, uniquePageviews: 2050, avgTimeOnPage: 256, bounceRate: 33.7 },
  { pageTitle: "Customer Success Strategy", pagePath: "/blog/customer-success", pageviews: 2480, uniquePageviews: 1890, avgTimeOnPage: 213, bounceRate: 39.2 },
  { pageTitle: "GraphQL vs REST API Comparison", pagePath: "/blog/graphql-vs-rest", pageviews: 2310, uniquePageviews: 1780, avgTimeOnPage: 195, bounceRate: 37.8 },
  { pageTitle: "Implementing OKRs: Best Practices", pagePath: "/blog/okr-guide", pageviews: 2140, uniquePageviews: 1620, avgTimeOnPage: 287, bounceRate: 31.5 },
  { pageTitle: "Docker Container Security", pagePath: "/blog/docker-security", pageviews: 1980, uniquePageviews: 1510, avgTimeOnPage: 234, bounceRate: 34.6 },
  { pageTitle: "On-Page SEO Checklist", pagePath: "/blog/seo-checklist", pageviews: 1850, uniquePageviews: 1420, avgTimeOnPage: 268, bounceRate: 30.2 },
]

// ── Category Performance ──

export const categoryPerformance: CategoryPerformance[] = [
  { category: "Technology", pageviews: 28630, avgTimeOnPage: 245, bounceRate: 33.2, conversionRate: 3.8 },
  { category: "Marketing", pageviews: 15840, avgTimeOnPage: 218, bounceRate: 37.5, conversionRate: 5.2 },
  { category: "Product", pageviews: 12350, avgTimeOnPage: 267, bounceRate: 31.8, conversionRate: 4.1 },
  { category: "News", pageviews: 8920, avgTimeOnPage: 142, bounceRate: 48.3, conversionRate: 1.5 },
  { category: "Case Studies", pageviews: 6780, avgTimeOnPage: 312, bounceRate: 25.6, conversionRate: 7.3 },
]

// ── Content Ranking ──

export const contentRanking: ContentRankingItem[] = [
  { rank: 1, title: "The Complete Guide to React Hooks", category: "Technology", pageviews: 8420, avgTimeOnPage: 245, scrollDepth: 78, conversionContribution: 4.2 },
  { rank: 2, title: "TypeScript 5.0: What's New", category: "Technology", pageviews: 6150, avgTimeOnPage: 198, scrollDepth: 65, conversionContribution: 3.1 },
  { rank: 3, title: "SaaS LTV/CAC Analysis Playbook", category: "Marketing", pageviews: 5230, avgTimeOnPage: 312, scrollDepth: 82, conversionContribution: 6.8 },
  { rank: 4, title: "Product Management 101", category: "Product", pageviews: 4890, avgTimeOnPage: 267, scrollDepth: 73, conversionContribution: 3.9 },
  { rank: 5, title: "Remote Work Productivity Report 2024", category: "News", pageviews: 4210, avgTimeOnPage: 189, scrollDepth: 58, conversionContribution: 1.2 },
  { rank: 6, title: "Next.js App Router Migration Guide", category: "Technology", pageviews: 3870, avgTimeOnPage: 278, scrollDepth: 81, conversionContribution: 3.5 },
  { rank: 7, title: "Marketing Automation Case Study", category: "Case Studies", pageviews: 3540, avgTimeOnPage: 225, scrollDepth: 71, conversionContribution: 8.1 },
  { rank: 8, title: "Building a Design System in Figma", category: "Product", pageviews: 3180, avgTimeOnPage: 301, scrollDepth: 76, conversionContribution: 2.8 },
  { rank: 9, title: "Data-Driven Management in Practice", category: "Marketing", pageviews: 2950, avgTimeOnPage: 342, scrollDepth: 85, conversionContribution: 7.2 },
  { rank: 10, title: "AWS Cost Optimization Guide", category: "Technology", pageviews: 2720, avgTimeOnPage: 256, scrollDepth: 69, conversionContribution: 2.4 },
  { rank: 11, title: "Customer Success Strategy", category: "Marketing", pageviews: 2480, avgTimeOnPage: 213, scrollDepth: 62, conversionContribution: 5.6 },
  { rank: 12, title: "GraphQL vs REST API Comparison", category: "Technology", pageviews: 2310, avgTimeOnPage: 195, scrollDepth: 60, conversionContribution: 2.1 },
  { rank: 13, title: "Implementing OKRs: Best Practices", category: "Product", pageviews: 2140, avgTimeOnPage: 287, scrollDepth: 74, conversionContribution: 3.3 },
  { rank: 14, title: "Docker Container Security", category: "Technology", pageviews: 1980, avgTimeOnPage: 234, scrollDepth: 67, conversionContribution: 1.8 },
  { rank: 15, title: "On-Page SEO Checklist", category: "Marketing", pageviews: 1850, avgTimeOnPage: 268, scrollDepth: 79, conversionContribution: 4.5 },
]

// ── Daily Search Trend (90 days) ──

function generateDailySearch(): DailySearchTrend[] {
  const data: DailySearchTrend[] = []
  for (let i = 89; i >= 0; i--) {
    const weekendFactor = isWeekend(i) ? 0.5 : 1.0
    const trendFactor = 1 + (89 - i) * 0.004
    const noise = 0.85 + srand(0, 30) / 100
    const clicks = Math.round(280 * weekendFactor * trendFactor * noise)
    const impressions = Math.round(clicks * (8 + srand(0, 4)))
    data.push({ date: dateStr(i), clicks, impressions })
  }
  return data
}

export const dailySearchTrend: DailySearchTrend[] = generateDailySearch()

// ── SEO KPIs ──

function computeSeoKpis(): KpiItem[] {
  const recent = dailySearchTrend.slice(-30)
  const previous = dailySearchTrend.slice(-60, -30)

  const sum = (arr: DailySearchTrend[], key: "clicks" | "impressions") =>
    arr.reduce((s, d) => s + d[key], 0)

  const clicksNow = sum(recent, "clicks")
  const clicksPrev = sum(previous, "clicks")
  const imprNow = sum(recent, "impressions")
  const imprPrev = sum(previous, "impressions")
  const ctrNow = (clicksNow / imprNow) * 100
  const ctrPrev = (clicksPrev / imprPrev) * 100
  const avgPosNow = 14.2
  const avgPosPrev = 15.8

  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "Clicks",
      value: clicksNow.toLocaleString("en-US"),
      change: pct(clicksNow, clicksPrev),
      changeLabel: "vs. last month",
      positiveIsGood: true,
      sparklineData: recent.map((d) => d.clicks),
    },
    {
      label: "Impressions",
      value: imprNow.toLocaleString("en-US"),
      change: pct(imprNow, imprPrev),
      changeLabel: "vs. last month",
      positiveIsGood: true,
      sparklineData: recent.map((d) => d.impressions),
    },
    {
      label: "Avg. CTR",
      value: `${ctrNow.toFixed(1)}%`,
      change: Math.round((ctrNow - ctrPrev) * 10) / 10,
      changeLabel: "vs. last month",
      positiveIsGood: true,
      sparklineData: recent.map((d) => {
        return d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0
      }),
    },
    {
      label: "Avg. Position",
      value: avgPosNow.toFixed(1),
      change: Math.round((avgPosPrev - avgPosNow) * 10) / 10,
      changeLabel: "vs. last month",
      positiveIsGood: true,
      sparklineData: recent.map((_, i) => 16 - i * 0.05 + srand(-1, 1)),
    },
  ]
}

export const seoKpis: KpiItem[] = computeSeoKpis()

// ── Keyword Rankings ──

export const keywordRankings: KeywordRankingDisplay[] = [
  { keyword: "how to use react hooks", rank: 3, previousRank: 5, rankChange: 2, ctr: 18.2, impressions: 4520, clicks: 823, searchVolume: 12100, url: "/blog/react-hooks-guide" },
  { keyword: "typescript tutorial", rank: 5, previousRank: 4, rankChange: -1, ctr: 12.5, impressions: 8930, clicks: 1116, searchVolume: 22000, url: "/blog/typescript-5-features" },
  { keyword: "saas metrics", rank: 2, previousRank: 3, rankChange: 1, ctr: 22.1, impressions: 2180, clicks: 482, searchVolume: 3600, url: "/blog/saas-ltv-cac" },
  { keyword: "product management", rank: 7, previousRank: 7, rankChange: 0, ctr: 8.3, impressions: 6450, clicks: 535, searchVolume: 14800, url: "/blog/product-management-101" },
  { keyword: "remote work tools", rank: 4, previousRank: 8, rankChange: 4, ctr: 14.7, impressions: 5210, clicks: 766, searchVolume: 9900, url: "/blog/remote-work-report" },
  { keyword: "next.js app router", rank: 6, previousRank: 9, rankChange: 3, ctr: 10.2, impressions: 3870, clicks: 395, searchVolume: 8100, url: "/blog/nextjs-app-router" },
  { keyword: "marketing automation examples", rank: 8, previousRank: 6, rankChange: -2, ctr: 7.8, impressions: 2940, clicks: 229, searchVolume: 4400, url: "/blog/ma-case-study" },
  { keyword: "figma design system", rank: 3, previousRank: 3, rankChange: 0, ctr: 19.5, impressions: 1850, clicks: 361, searchVolume: 5400, url: "/blog/figma-design-system" },
  { keyword: "data driven management", rank: 9, previousRank: 12, rankChange: 3, ctr: 6.1, impressions: 3210, clicks: 196, searchVolume: 6600, url: "/blog/data-driven-management" },
  { keyword: "aws cost reduction", rank: 11, previousRank: 10, rankChange: -1, ctr: 5.2, impressions: 4180, clicks: 217, searchVolume: 7200, url: "/blog/aws-cost-optimization" },
  { keyword: "what is customer success", rank: 6, previousRank: 8, rankChange: 2, ctr: 11.3, impressions: 2760, clicks: 312, searchVolume: 5800, url: "/blog/customer-success" },
  { keyword: "graphql vs rest", rank: 4, previousRank: 5, rankChange: 1, ctr: 15.8, impressions: 1920, clicks: 303, searchVolume: 3200, url: "/blog/graphql-vs-rest" },
  { keyword: "okr implementation", rank: 10, previousRank: 10, rankChange: 0, ctr: 5.9, impressions: 3540, clicks: 209, searchVolume: 8800, url: "/blog/okr-guide" },
  { keyword: "docker security", rank: 12, previousRank: 15, rankChange: 3, ctr: 4.3, impressions: 2650, clicks: 114, searchVolume: 4100, url: "/blog/docker-security" },
  { keyword: "on-page seo", rank: 5, previousRank: 6, rankChange: 1, ctr: 13.1, impressions: 3980, clicks: 521, searchVolume: 11000, url: "/blog/seo-checklist" },
  { keyword: "react performance optimization", rank: 8, previousRank: 11, rankChange: 3, ctr: 7.4, impressions: 2890, clicks: 214, searchVolume: 6200, url: "/blog/react-hooks-guide" },
  { keyword: "reduce saas churn rate", rank: 14, previousRank: 18, rankChange: 4, ctr: 3.8, impressions: 1580, clicks: 60, searchVolume: 2400, url: "/blog/saas-ltv-cac" },
  { keyword: "product manager skills", rank: 9, previousRank: 7, rankChange: -2, ctr: 6.7, impressions: 4120, clicks: 276, searchVolume: 7600, url: "/blog/product-management-101" },
  { keyword: "how to write a tech blog", rank: 15, previousRank: 20, rankChange: 5, ctr: 3.2, impressions: 1240, clicks: 40, searchVolume: 2900, url: "/blog/typescript-5-features" },
  { keyword: "marketing kpis", rank: 7, previousRank: 9, rankChange: 2, ctr: 9.1, impressions: 3670, clicks: 334, searchVolume: 6800, url: "/blog/data-driven-management" },
]

// ── CTR vs Position scatter data ──

export const ctrPositionData: CtrPositionPoint[] = keywordRankings.map((kw) => ({
  keyword: kw.keyword,
  position: kw.rank,
  ctr: kw.ctr,
  searchVolume: kw.searchVolume,
}))

// ── Filter options ──

export const deviceOptions = [
  { label: "All Devices", value: "all" },
  { label: "Desktop", value: "desktop" },
  { label: "Mobile", value: "mobile" },
  { label: "Tablet", value: "tablet" },
]

export const channelOptions = [
  { label: "All Channels", value: "all" },
  { label: "Organic Search", value: "organic" },
  { label: "Direct", value: "direct" },
  { label: "Referral", value: "referral" },
  { label: "Social", value: "social" },
  { label: "Email", value: "email" },
  { label: "Paid Search", value: "paid_search" },
]

export const categoryOptions: { label: string; value: string }[] = [
  { label: "All Categories", value: "all" },
  { label: "Technology", value: "Technology" },
  { label: "Marketing", value: "Marketing" },
  { label: "Product", value: "Product" },
  { label: "News", value: "News" },
  { label: "Case Studies", value: "Case Studies" },
]

// ── Hourly Traffic Heatmap (day of week × hour of day, avg PV/UU over last 30 days) ──
//
// dayOfWeek: 0=Mon, 1=Tue, ..., 5=Sat, 6=Sun

function generateHourlyTrafficMatrix(): HeatmapCell[] {
  const cells: HeatmapCell[] = []

  // Hourly patterns differ between weekdays and weekends.
  // Baseline: late night (0-5h) is low; peaks around commute times, lunch, and evening.
  const weekdayHourFactors = [
    0.15, 0.08, 0.05, 0.04, 0.06, 0.12, 0.28, 0.55, 0.78, 1.15, 1.35, 1.42,
    1.28, 1.05, 1.18, 1.25, 1.12, 0.95, 0.88, 1.22, 1.48, 1.35, 0.92, 0.45,
  ]
  // Weekends: later start in the morning, earlier evening peak, and activity shifted into late night.
  const weekendHourFactors = [
    0.28, 0.18, 0.12, 0.08, 0.08, 0.1, 0.15, 0.3, 0.52, 0.85, 1.25, 1.45, 1.38,
    1.22, 1.15, 1.08, 1.02, 1.12, 1.32, 1.58, 1.65, 1.42, 1.08, 0.68,
  ]

  // Per-day baseline (Mon-Wed slightly lower, rising Thu-Fri, weekend pattern on Sat/Sun)
  const dayBaselines = [0.92, 0.95, 1.0, 1.05, 1.08, 0.78, 0.72]

  for (let day = 0; day < 7; day++) {
    const isWeekend = day >= 5
    const hourFactors = isWeekend ? weekendHourFactors : weekdayHourFactors
    const dayBase = dayBaselines[day]
    for (let hour = 0; hour < 24; hour++) {
      const noise = 0.88 + srand(0, 24) / 100
      const pv = Math.round(320 * dayBase * hourFactors[hour] * noise)
      const uu = Math.round(pv * (0.58 + srand(0, 8) / 100))
      cells.push({ dayOfWeek: day, hour, pageviews: pv, uniqueUsers: uu })
    }
  }
  return cells
}

export const hourlyTrafficMatrix: HeatmapCell[] = generateHourlyTrafficMatrix()
