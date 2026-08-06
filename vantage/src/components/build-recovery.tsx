import { useEffect, useRef, useState, type ReactNode } from "react"
import { Check, Copy } from "lucide-react"
import { Button, Spinner } from "@squadbase/vantage/ui"

/**
 * ダッシュボードを組み立てている最中は、ファイルが書き終わる順番の都合で一瞬だけ
 * ページが throw することがある(存在しないモジュールの import、まだ書き終わっていない
 * コンポーネント)。それ自体は通り過ぎる状態なのに、ユーザーには 2 つの形で残ってしまう。
 *
 * 1. **見た目が「失敗」に見える。** ページのレンダリングエラーを受け止めるのは
 *    Vantage の既定エラー画面("Something went wrong")で、これはテンプレートからは
 *    差し替えられない — `_error.tsx` はルートルート専用で、ページごとの
 *    `errorComponent` は現行プロトタイプではまだ結線されていない。
 * 2. **直しても戻らない。** エラーを掴んでいるのは TanStack の CatchBoundary で、
 *    そのリセットはルートの再ロードに紐づいている。HMR でソースが差し替わっても
 *    リセットされないので、リロードするまでエラー画面が貼り付いたままになる。
 *
 * そこで、既定エラー画面が出たことを DOM から検知して「進行中」表示を被せ、dev では
 * 短い待ち時間のあと自動でリロードして復帰させる(回数は上限つき)。旧 Vite テンプレートの
 * `_router.tsx` と同じ考え方で、一時的なエラーを失敗ではなく更新中として見せる。
 *
 * `_layout.tsx` が `<Outlet />` を包む形で 1 度だけ使う。**外さないこと** — 外すと
 * 構築中のエラーがそのまま「Something went wrong」として残る。
 */

/**
 * 既定エラー画面の目印。`role="alert"` の中の `h2` は Vantage の `DefaultError` だけが
 * 持つ(`@squadbase/vantage/ui` の `ErrorState` は見出しを `<p>` で描くので当たらない)。
 */
const FRAMEWORK_ERROR_SELECTOR = '[role="alert"] h2'

/** 書き込みの連鎖が落ち着くのを待ってからリロードする。 */
const RELOAD_DELAY_MS = 1200

/** 直らないエラーで無限リロードしないための上限。使い切ったら手動の案内に降りる。 */
const MAX_RELOADS = 3

/** これだけ待っても復帰しなければ、「進行中」表示から控えめな再読み込み案内へ降格する。 */
const DEGRADE_AFTER_MS = 6000

/** エラーなしでこれだけ描画できたら、自動リロードの回数を使い切っていない扱いに戻す。 */
const SETTLE_MS = 5000

const RELOAD_COUNT_KEY = "vantage:build-recovery-reloads"

/** コピーしたことが伝わればいいので、確認表示はすぐ元に戻す。 */
const COPIED_FEEDBACK_MS = 2000

function errorMessage(error: unknown): string {
  if (error == null) return ""
  return error instanceof Error ? (error.stack ?? error.message) : String(error)
}

function readReloadCount(): number {
  try {
    return Number(sessionStorage.getItem(RELOAD_COUNT_KEY)) || 0
  } catch {
    // sessionStorage が使えない環境では自動リロードを諦める(上限を超えた扱い)。
    return MAX_RELOADS
  }
}

function writeReloadCount(count: number): void {
  try {
    sessionStorage.setItem(RELOAD_COUNT_KEY, String(count))
  } catch {
    // 書けなくても致命ではない。次の判定で MAX_RELOADS 扱いになるだけ。
  }
}

function clearReloadCount(): void {
  try {
    sessionStorage.removeItem(RELOAD_COUNT_KEY)
  } catch {
    // 同上。
  }
}

/**
 * 「進行中」表示。最初はローディングと見分けのつかない穏やかな見た目で、一定時間
 * 復帰しなければ控えめな再読み込み案内に降格する。dev では降格の前に自動リロードを試す。
 */
export function RecoveringState({ error }: { error?: unknown }) {
  const [degraded, setDegraded] = useState(false)

  useEffect(() => {
    // dev の構築中は、少し待てばファイルが揃って直っていることがほとんど。
    // リロードすれば CatchBoundary も lazy import のキャッシュもまとめて捨てられる。
    if (import.meta.env.DEV) {
      const attempts = readReloadCount()
      if (attempts < MAX_RELOADS) {
        const timer = setTimeout(() => {
          writeReloadCount(attempts + 1)
          window.location.reload()
        }, RELOAD_DELAY_MS)
        return () => clearTimeout(timer)
      }
    }
    const timer = setTimeout(() => setDegraded(true), DEGRADE_AFTER_MS)
    return () => clearTimeout(timer)
  }, [])

  if (!degraded) {
    return (
      <div
        className="flex min-h-[50vh] flex-col items-center justify-center gap-3"
        role="status"
        aria-live="polite"
      >
        <Spinner className="size-6 text-muted-foreground" />
        <p className="text-base text-muted-foreground">Working on it…</p>
      </div>
    )
  }

  const message = errorMessage(error)

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <p className="text-center text-base text-muted-foreground">
        This view is taking longer than expected to update.
      </p>
      <div className="flex items-center gap-2">
        <Button onClick={() => window.location.reload()}>Reload</Button>
        {message ? <CopyLogButton message={message} /> : null}
      </div>
      {/*
        ここまで来た人はエラー本文を AI に貼り戻して直してもらう。畳んでおくと辿り着けない
        ので開いたまま出す。フレームワークの既定エラー画面も同じ本文を隠さず出しているので、
        これで新しく何かが露出するわけではない。
      */}
      {message ? (
        <pre className="max-h-64 w-full max-w-2xl select-text overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted p-4 text-left text-xs text-muted-foreground">
          {message}
        </pre>
      ) : null}
    </div>
  )
}

/**
 * エラー本文をクリップボードへ。`<pre>` は選択できるので、これが失敗しても手で
 * コピーする道は残る — 失敗しても黙って何もしない。
 */
function CopyLogButton({ message }: { message: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <Button
      variant="outline"
      onClick={() => {
        navigator.clipboard?.writeText(message).then(
          () => setCopied(true),
          () => {},
        )
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Copied" : "Copy log"}
    </Button>
  )
}

/**
 * 子の中に既定エラー画面が現れたら、その上に「進行中」表示を被せる。エラー画面自体は
 * DOM に残したまま覆うだけなので、復帰したかどうかは同じ MutationObserver で追える。
 */
export function BuildRecovery({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null)
  // エラー本文。`null` は「壊れていない」を兼ねる。既定エラー画面は throw された値を
  // 保持していないので、DOM に描かれた本文を読み取るのが唯一の入手経路になる。
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const sync = () => {
      const heading = host.querySelector(FRAMEWORK_ERROR_SELECTOR)
      // 覆って見えなくする以上、支援技術にも読ませない。`role="alert"` のままだと
      // 「Something went wrong」がそのまま読み上げられてしまう。属性は observe の
      // 対象外(childList / subtree のみ)なので、この書き換えでは再入しない。
      heading?.closest('[role="alert"]')?.setAttribute("aria-hidden", "true")
      // 既定エラー画面は見出しの直後の段落に本文を描く。取れなくても覆う判断は変えない。
      setMessage(heading === null ? null : (heading.nextElementSibling?.textContent ?? ""))
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(host, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  const crashed = message !== null

  useEffect(() => {
    if (crashed) return
    // 無事に描けている状態がしばらく続いたら、自動リロードの残数を戻す。
    const timer = setTimeout(clearReloadCount, SETTLE_MS)
    return () => clearTimeout(timer)
  }, [crashed])

  return (
    // 通常時は `relative` を足すだけでレイアウトに影響させない。覆うときだけ、
    // 被せる「進行中」表示が収まる高さを確保する。
    <div ref={hostRef} className={crashed ? "relative min-h-[50vh]" : "relative"}>
      {children}
      {crashed ? (
        <div className="absolute inset-0 z-10 overflow-auto bg-background">
          <RecoveringState error={message} />
        </div>
      ) : null}
    </div>
  )
}
