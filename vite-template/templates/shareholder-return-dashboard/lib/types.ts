// ── Raw data schema (matches ticket's expected input data) ──
// fiscal_year, dividend_total, buyback_total, net_income

export interface ShareholderReturnRow {
  fiscal_year: number
  dividend_total: number
  buyback_total: number
  net_income: number
}

// ── Display / derived types ──

export interface AnnualPoint {
  fiscalYear: number
  fiscalLabel: string
  dividendTotal: number
  buybackTotal: number
  netIncome: number
  payoutRatio: number
  buybackRatio: number
  totalReturnRatio: number
  dividendYield: number
}

export interface KpiItem {
  id: "dividend-total" | "dividend-yield" | "buyback" | "total-return-ratio"
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface BuybackEvent {
  id: string
  fiscalYear: number
  announcedAt: string
  amount: number
  shares: number
  status: "completed" | "in-progress" | "announced"
}
