export function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "12%", containLabel: true }
}

export function getCompactGrid() {
  return { left: "3%", right: "4%", bottom: "6%", top: "8%", containLabel: true }
}

export function formatNumber(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}億`
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`
  return n.toLocaleString("ja-JP")
}

export function formatCurrency(
  n: number,
  opts: { short?: boolean } = {},
): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (opts.short) {
    if (abs >= 100_000_000) return `${sign}¥${(abs / 100_000_000).toFixed(2)}億`
    if (abs >= 10_000) return `${sign}¥${(abs / 10_000).toFixed(1)}万`
    return `${sign}¥${abs.toLocaleString("ja-JP")}`
  }
  return `${sign}¥${Math.round(abs).toLocaleString("ja-JP")}`
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
