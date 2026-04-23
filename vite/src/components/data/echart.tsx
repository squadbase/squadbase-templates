import * as React from "react"
import ReactECharts from "echarts-for-react"
import type { EChartsOption } from "echarts"
import { useEffect, useState } from "react"
import { Check, Copy, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ── Color resolution ──────────────────────────────────────────────────────────

function resolveColor(cssVar: string): string {
  const style = getComputedStyle(document.documentElement)
  const base = style.getPropertyValue(cssVar).trim()
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  return a < 255
    ? `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`
    : `rgb(${r},${g},${b})`
}

export function withAlpha(color: string, alpha: number): string {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (!match) return color
  const [, r, g, b, a] = match
  const baseAlpha = a ? parseFloat(a) : 1
  return `rgba(${r},${g},${b},${(baseAlpha * alpha).toFixed(3)})`
}

const CHART_VARS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"]

// ── Themes ────────────────────────────────────────────────────────────────────

const FONT_FAMILY = '"Geist Sans", "Geist", system-ui, -apple-system, sans-serif'

function buildLightTheme(colors: string[]) {
  return {
    color: [
      ...colors,
      ...colors.map((c) => withAlpha(c, 0.6)),
    ],
    backgroundColor: "transparent",
    textStyle: { fontFamily: FONT_FAMILY, fontSize: 12, color: "#0a0a0a" },
    title: { textStyle: { fontFamily: FONT_FAMILY, color: "#0a0a0a" } },
    legend: { textStyle: { fontFamily: FONT_FAMILY, color: "#737373" } },
    categoryAxis: {
      axisLine: { lineStyle: { color: "#e5e5e5" } },
      axisTick: { show: false },
      axisLabel: { color: "#737373" },
      splitLine: { lineStyle: { color: "#e5e5e5", type: "dashed" as const } },
    },
    valueAxis: {
      axisLine: { lineStyle: { color: "#e5e5e5" } },
      axisTick: { show: false },
      axisLabel: { color: "#737373" },
      splitLine: { lineStyle: { color: "#e5e5e5", type: "dashed" as const } },
    },
    tooltip: {
      backgroundColor: "#ffffff",
      borderColor: "#e5e5e5",
      borderWidth: 1,
      borderRadius: 8,
      textStyle: { fontFamily: FONT_FAMILY, fontSize: 12, color: "#0a0a0a" },
    },
  }
}

function buildDarkTheme(colors: string[]) {
  const BORDER = "rgba(255, 255, 255, 0.1)"
  return {
    color: [
      ...colors,
      ...colors.map((c) => withAlpha(c, 0.6)),
    ],
    backgroundColor: "transparent",
    textStyle: { fontFamily: FONT_FAMILY, fontSize: 12, color: "#fafafa" },
    title: { textStyle: { fontFamily: FONT_FAMILY, color: "#fafafa" } },
    legend: { textStyle: { fontFamily: FONT_FAMILY, color: "#a1a1a1" } },
    categoryAxis: {
      axisLine: { lineStyle: { color: BORDER } },
      axisTick: { show: false },
      axisLabel: { color: "#a1a1a1" },
      splitLine: { lineStyle: { color: BORDER, type: "dashed" as const } },
    },
    valueAxis: {
      axisLine: { lineStyle: { color: BORDER } },
      axisTick: { show: false },
      axisLabel: { color: "#a1a1a1" },
      splitLine: { lineStyle: { color: BORDER, type: "dashed" as const } },
    },
    tooltip: {
      backgroundColor: "#171717",
      borderColor: BORDER,
      borderWidth: 1,
      borderRadius: 8,
      textStyle: { fontFamily: FONT_FAMILY, fontSize: 12, color: "#fafafa" },
    },
  }
}

// ── Decal patterns ────────────────────────────────────────────────────────────

interface DecalObject {
  symbol?: string | string[]
  symbolSize?: number
  symbolKeepAspect?: boolean
  color?: string
  backgroundColor?: string | null
  dashArrayX?: number | number[] | (number | number[])[]
  dashArrayY?: number | number[]
  rotation?: number
  maxTileWidth?: number
  maxTileHeight?: number
}

const BASE_PATTERNS: Omit<DecalObject, "color">[] = [
  { symbol: "none", dashArrayX: [1, 0], dashArrayY: [2, 8], rotation: -Math.PI / 4 },
  { symbol: "circle", symbolSize: 0.5, dashArrayX: [5, 3], dashArrayY: [5, 3] },
  { symbol: "none", dashArrayX: [1, 0], dashArrayY: [2, 8] },
  { symbol: "none", dashArrayX: [1, 0], dashArrayY: [2, 8], rotation: Math.PI / 4 },
  { symbol: "none", dashArrayX: [2, 8], dashArrayY: [1, 0] },
]

function getDecalPatterns(isDark: boolean): DecalObject[] {
  const color = isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)"
  return BASE_PATTERNS.map((p) => ({ ...p, color }))
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])
  return isDark
}

export function useEChartsTheme(): object {
  const isDark = useIsDark()
  const [theme, setTheme] = useState<object>({})

  useEffect(() => {
    const rebuild = () => {
      const colors = CHART_VARS.map(resolveColor)
      setTheme(isDark ? buildDarkTheme(colors) : buildLightTheme(colors))
    }
    rebuild()
    window.addEventListener("squadbase-theme-change", rebuild)
    return () => window.removeEventListener("squadbase-theme-change", rebuild)
  }, [isDark])

  return theme
}

export function useEChartsContrastColor(cssVar = "--chart-5"): string {
  const isDark = useIsDark()
  const [color, setColor] = useState("")

  useEffect(() => {
    const rebuild = () => setColor(resolveColor(cssVar))
    rebuild()
    window.addEventListener("squadbase-theme-change", rebuild)
    return () => window.removeEventListener("squadbase-theme-change", rebuild)
  }, [isDark, cssVar])

  return color
}

function useEChartsDecalPatterns(): DecalObject[] {
  const isDark = useIsDark()
  const [decals, setDecals] = useState<DecalObject[]>([])

  useEffect(() => {
    const rebuild = () => setDecals(getDecalPatterns(isDark))
    rebuild()
    window.addEventListener("squadbase-theme-change", rebuild)
    return () => window.removeEventListener("squadbase-theme-change", rebuild)
  }, [isDark])

  return decals
}

// ── Component ─────────────────────────────────────────────────────────────────

interface EChartProps {
  option: EChartsOption
  height?: string | number
  loading?: boolean
  theme?: string | object
  onEvents?: Record<string, (params: unknown) => void>
  ariaLabel?: string
  className?: string
  /** true にすると SquadbaseTheme のライト/ダークに対応したデカールパターンを系列ごとに自動適用する */
  decal?: boolean
  /** true にするとチャート右上に PNG コピー / ダウンロードボタンを表示する */
  actions?: boolean
  /** ダウンロード時のファイル名（拡張子含む）。省略時は "chart.png" */
  fileName?: string
}

export const EChart = React.forwardRef<HTMLDivElement, EChartProps>(
  function EChart(
    {
      option,
      height = 400,
      loading = false,
      theme,
      onEvents,
      ariaLabel,
      className,
      decal = false,
      actions = false,
      fileName = "chart.png",
    }: EChartProps,
    ref
  ) {
    const defaultTheme = useEChartsTheme()
    const contrastColor = useEChartsContrastColor()
    const decalPatterns = useEChartsDecalPatterns()
    const chartRef = React.useRef<ReactECharts>(null)
    const [copied, setCopied] = useState(false)

    const getPngDataUrl = React.useCallback(() => {
      const chart = chartRef.current?.getEchartsInstance()
      if (!chart) return null
      return chart.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: resolveColor("--background"),
      })
    }, [])

    const handleCopy = React.useCallback(async () => {
      const dataUrl = getPngDataUrl()
      if (!dataUrl) return
      try {
        const blob = await (await fetch(dataUrl)).blob()
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // ClipboardItem 未対応ブラウザでは silent fail
      }
    }, [getPngDataUrl])

    const handleDownload = React.useCallback(() => {
      const dataUrl = getPngDataUrl()
      if (!dataUrl) return
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = fileName
      link.click()
    }, [getPngDataUrl, fileName])

    // 2系列時に --chart-1 / --chart-5 を自動適用する
    const effectiveOption = React.useMemo(() => {
      let result: EChartsOption = option

      if (contrastColor) {
        const brandColor = (defaultTheme as { color?: string[] }).color?.[0]
        if (brandColor && !option.color) {
          const series = Array.isArray(option.series) ? option.series : []

          // 通常の2系列チャート
          if (series.length === 2) {
            result = { ...option, color: [brandColor, contrastColor] }
          }
          // レーダーチャート: 1 series 内に data が 2 つ
          else if (series.length === 1) {
            const s = series[0] as { type?: string; data?: unknown[] }
            if (s.type === "radar" && Array.isArray(s.data) && s.data.length === 2) {
              result = { ...option, color: [brandColor, contrastColor] }
            }
          }
        }
      }

      // decal プリセット注入
      if (decal && decalPatterns.length > 0) {
        const existingAria = result.aria ?? {}
        result = {
          ...result,
          aria: {
            enabled: true,
            ...existingAria,
            decal: {
              show: true,
              decals: decalPatterns as unknown as EChartsOption["aria"] extends { decal?: { decals?: infer T } } ? T : never,
              ...(existingAria as { decal?: object }).decal,
            },
          },
        }
      }

      return result
    }, [option, contrastColor, defaultTheme, decal, decalPatterns])

    return (
      <div
        ref={ref}
        data-slot="echart"
        className={cn("group relative w-full", className)}
        role="img"
        aria-label={ariaLabel ?? "チャート"}
      >
        <ReactECharts
          ref={chartRef}
          option={effectiveOption}
          theme={theme ?? defaultTheme}
          style={{ height: typeof height === "number" ? `${height}px` : height, width: "100%" }}
          showLoading={loading}
          notMerge
          lazyUpdate
          onEvents={onEvents}
          opts={{ renderer: "canvas" }}
        />
        {actions && (
          <div
            data-slot="echart-actions"
            className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleCopy}
              aria-label={copied ? "コピーしました" : "PNG をクリップボードにコピー"}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleDownload}
              aria-label="PNG をダウンロード"
            >
              <Download className="size-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }
)

EChart.displayName = "EChart"
