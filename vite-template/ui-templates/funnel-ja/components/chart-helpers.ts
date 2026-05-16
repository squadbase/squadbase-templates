export function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "10%", containLabel: true }
}

export function formatNumber(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`
  return n.toLocaleString("en-US")
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}
