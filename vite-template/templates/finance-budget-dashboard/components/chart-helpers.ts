export function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "12%", containLabel: true }
}

export function getCompactGrid() {
  return { left: "3%", right: "4%", bottom: "6%", top: "8%", containLabel: true }
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString("en-US")
}

export function formatCurrency(
  n: number,
  opts: { short?: boolean } = {},
): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (opts.short) {
    if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`
    return `${sign}$${abs.toLocaleString("en-US")}`
  }
  return `${sign}$${Math.round(abs).toLocaleString("en-US")}`
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function formatSignedPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(digits)}%`
}

export function formatSignedCurrency(
  n: number,
  opts: { short?: boolean } = {},
): string {
  const sign = n > 0 ? "+" : n < 0 ? "-" : ""
  const formatted = formatCurrency(Math.abs(n), opts).replace(/^-/, "")
  return n === 0 ? formatted : `${sign}${formatted}`
}
