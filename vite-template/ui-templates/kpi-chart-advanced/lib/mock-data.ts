import type {
  KpiItem,
  ComparisonPoint,
  BreakdownSlice,
  TrendPoint,
  CampaignRow,
} from "@/templates/kpi-chart-advanced/types"

export const trendSeries: TrendPoint[] = [
  { date: "2024-03-02", value: 25537 },
  { date: "2024-03-03", value: 25443 },
  { date: "2024-03-04", value: 31199 },
  { date: "2024-03-05", value: 27676 },
  { date: "2024-03-06", value: 31689 },
  { date: "2024-03-07", value: 31329 },
  { date: "2024-03-08", value: 29802 },
  { date: "2024-03-09", value: 24254 },
  { date: "2024-03-10", value: 23112 },
  { date: "2024-03-11", value: 32913 },
  { date: "2024-03-12", value: 29638 },
  { date: "2024-03-13", value: 28547 },
  { date: "2024-03-14", value: 33511 },
  { date: "2024-03-15", value: 30842 },
  { date: "2024-03-16", value: 26136 },
  { date: "2024-03-17", value: 29594 },
  { date: "2024-03-18", value: 34866 },
  { date: "2024-03-19", value: 30377 },
  { date: "2024-03-20", value: 31164 },
  { date: "2024-03-21", value: 32209 },
  { date: "2024-03-22", value: 36270 },
  { date: "2024-03-23", value: 28720 },
  { date: "2024-03-24", value: 26871 },
  { date: "2024-03-25", value: 32817 },
  { date: "2024-03-26", value: 36762 },
  { date: "2024-03-27", value: 34853 },
  { date: "2024-03-28", value: 34516 },
  { date: "2024-03-29", value: 38290 },
  { date: "2024-03-30", value: 28654 },
  { date: "2024-03-31", value: 33368 },
]

export const comparisonSeries: ComparisonPoint[] = [
  { period: "2023-10", current: 308820, previous: 285196, growth: 8.28 },
  { period: "2023-11", current: 360871, previous: 300245, growth: 20.19 },
  { period: "2023-12", current: 369038, previous: 344274, growth: 7.19 },
  { period: "2024-01", current: 402455, previous: 338646, growth: 18.84 },
  { period: "2024-02", current: 443741, previous: 396096, growth: 12.03 },
  { period: "2024-03", current: 445883, previous: 387812, growth: 14.97 },
]

export const breakdownSlices: BreakdownSlice[] = [
  { segment: "Segment 1", value: 412_000 },
  { segment: "Segment 2", value: 318_000 },
  { segment: "Segment 3", value: 287_000 },
  { segment: "Segment 4", value: 164_000 },
  { segment: "Segment 5", value: 132_000 },
]

export const headerKpis: KpiItem[] = [
  {
    id: "revenue",
    value: "$1.04M",
    change: 14.2,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: [29802, 23112, 29638, 33511, 26136, 34866, 31164, 36270, 26871, 36762, 34516, 28654],
  },
  {
    id: "users",
    value: "82,400",
    change: 9.8,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: [4967, 3852, 4940, 5585, 4356, 5811, 5194, 6045, 4479, 6127, 5753, 4776],
  },
  {
    id: "sessions",
    value: "132,900",
    change: 6.5,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: [7451, 5778, 7410, 8378, 6534, 8717, 7791, 9068, 6718, 9191, 8629, 7164],
  },
  {
    id: "conversion",
    value: "4.18%",
    change: -0.4,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: [4.8, 4.66, 4.79, 4.87, 4.72, 4.9, 4.82, 4.93, 4.74, 4.94, 4.89, 4.77],
  },
  {
    id: "aov",
    value: "$12.62",
    change: 5.1,
    changeLabel: "",
    positiveIsGood: true,
    sparklineData: [1064.36, 825.43, 1058.5, 1196.82, 933.43, 1245.21, 1113, 1295.36, 959.68, 1312.93, 1232.71, 1023.36],
  },
]

export const campaignRows: CampaignRow[] = [
  { id: "c-01", name: "Item 1", channel: "Group A", spend: 48_200, conversions: 612, roi: 4.8 },
  { id: "c-02", name: "Item 2", channel: "Group B", spend: 34_600, conversions: 421, roi: 3.4 },
  { id: "c-03", name: "Item 3", channel: "Group C", spend: 12_800, conversions: 308, roi: 6.9 },
  { id: "c-04", name: "Item 4", channel: "Group D", spend: 22_100, conversions: 254, roi: 4.1 },
  { id: "c-05", name: "Item 5", channel: "Group E", spend: 18_400, conversions: 196, roi: 3.2 },
  { id: "c-06", name: "Item 6", channel: "Group B", spend: 14_300, conversions: 124, roi: 2.5 },
]
