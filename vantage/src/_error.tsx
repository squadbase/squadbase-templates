import { RecoveringState } from "./components/build-recovery"

/**
 * ルートルート(= `_layout.tsx`)が throw したときの画面。ページのレンダリングエラーは
 * ここには来ない — フレームワークの既定エラー画面が受け止め、その上を `BuildRecovery` が
 * 覆う(→ `components/build-recovery.tsx`)。どちらも見た目と復帰の仕方は揃えてある。
 */
export default function RouteError({ error }: { error: unknown }) {
  return <RecoveringState error={error} />
}
