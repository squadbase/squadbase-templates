export function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "12%", containLabel: true }
}

export function formatNumber(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(1)}億`
  if (abs >= 10_000) return `${sign}${(abs / 10_000).toFixed(0)}万`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}千`
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
    if (abs >= 10_000) return `${sign}¥${(abs / 10_000).toFixed(0)}万`
    if (abs >= 1_000) return `${sign}¥${(abs / 1_000).toFixed(1)}千`
    return `${sign}¥${abs.toLocaleString("ja-JP")}`
  }
  return `${sign}¥${Math.round(abs).toLocaleString("ja-JP")}`
}

export function formatSignedCurrency(
  n: number,
  opts: { short?: boolean } = {},
): string {
  if (n === 0) return formatCurrency(0, opts)
  const formatted = formatCurrency(Math.abs(n), opts)
  return n > 0 ? `+${formatted}` : `-${formatted}`
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function formatSignedPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(digits)}%`
}
