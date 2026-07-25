---
name: vantage-pitfalls
description: Vantage(@squadbase/vantage)アプリを書くときに静かに壊れる落とし穴のリファレンス。Base UI は Radix ではない(asChild 無し・render プロップ)、Select の value/label、クライアントから server/ を import しない、EChart の配色と高さ、動的パラメータの3綴り同期、PUBLIC_ env、HttpError など。Vantage の UI コンポーネントやルーティングが思った通りに動かないとき、ビルドやスタイルが静かに欠落するときに参照する。
---

# Vantage アプリの落とし穴リファレンス

Vantage アプリで「型は通るのに実行時/ビルド時に静かに壊れる」パターン集。症状が出たとき、
または該当機能を書く前に参照する。アプリ作成の流れは `vantage-app`、機能追加は
`vantage-add-feature` スキル。個々のコンポーネントの props と使用例は
`vantage docs <name>`(例: `vantage docs ui/select`)で引ける。

## UI:Base UI は Radix ではない

Vantage の UI キットは shadcn/ui の **Base UI バリアント**。Radix の癖で書くと動かない。

- **`asChild` は無い。** 代わりに `render` プロップを使う。
- **`Select` の `onValueChange` は `string | null`** を渡す(null が来うる)。
- **`Checkbox` の `checked` は `boolean` のみ。** 中間状態は `indeterminate` プロップ。
- **`ToggleGroup` の `value` は配列。**

### `SelectValue` の value/label は Vantage 側が吸収済み(残る 1 ケースだけ注意)

Base UI の `SelectValue` は選択中の **value をそのまま描き**、`SelectItem` の children を見ない
部品。Vantage の `Select` は children から `value` → ラベルを集めて渡すので、普通に書けば
トリガーに「関東」と出る。**手当てが要るのは 1 ケースだけ** — `SelectItem` を別のコンポーネント
が返している場合は集められないので、`items` を明示する:

```tsx
// SelectItem がこの場に無い(<RegionItems /> の中で作られる)ときだけ必要
<Select items={{ kanto: "関東", kansai: "関西" }} …>
  <SelectContent><RegionItems /></SelectContent>
</Select>
```

トリガーに `kanto` や `/sales` と生の値が出たら、まずこれを疑う。

## チャート:`EChart` の配色はトークン追従。上書きは `option.color`

系列色は `--chart-1..5`、軸・凡例・ツールチップは文字色/境界色のトークンから組まれ、
ライト / ダークの切り替えにも追従する(init 時にトークンの実値を解決している)。

- **`theme` プロップを渡すと追従は完全に止まる。** 系列の色だけ変えたいなら `option.color` を
  使う ― option はテーマより優先されるので、軸まわりの追従は残る。
- キャンバス系なので、**コンテナに高さを与えないと何も見えない**(既定は `h-[400px]`。
  `h-full` を使うなら親に確定した高さが要る)。
- `option` は `EChartsOption` を annotate するか `satisfies` を付ける。付けないと
  `type: "category"` が `string` に広がってビルドが落ちる。

## 境界:クライアントから `server/` を import しない

- クライアント側のどのファイルも `server/` 配下を import してはいけない(`CLIENT_IMPORTS_SERVER`
  エラー。静的にもビルド時にも弾かれる)。**共有したいコードは `lib/` に置く。**
- シークレット等の env は `ApiContext.env`(server/ 内)にだけ届く。クライアントには渡らない。

## env:クライアントに届くのは `PUBLIC_` 接頭辞だけ

- クライアントで読めるのは `import.meta.env.PUBLIC_*` と `MODE`/`DEV`/`PROD`/`SSR`/`BASE_URL` のみ。
  それ以外を `import.meta.env` で読むと `PUBLIC_ENV_MISUSE` 警告。
- `VITE_` 系の公開 API は無い。サーバーのシークレットは `ctx.env` で読む。

## ルーティング:動的パラメータは「3つの綴り」を同期させる

ズレると静かにマッチしなくなる:

- ファイル `sales/[customerId].tsx`
- 表示ルート `/sales/:customerId`
- リンク `to="/sales/$customerId"` + `params={{ customerId }}` / 取り出し `useParams().customerId`

## ページ:`definePage` の値はリテラルで書く

title/description/navLabel は**ビルド時に静的抽出**される。変数・関数呼び出し・テンプレート補間を
使うと抽出できない。`export const page = definePage({ title: "…" })` の右辺はリテラルにする。
なお `page` エクスポートはランタイムでは読まれない(抽出専用)。

## ナビ:`useRoutes()` は動的ルートも返す

`/sales/:customerId` のような動的ルートは URL が 1 つに定まらない。ナビに出すなら
`useRoutes().filter((r) => !r.dynamic)` で外す。リンク先は `r.path`(`:id` 形式)ではなく
**`r.to`**(`$id` 形式)を `Link` に渡す。表示名は `r.label`(`navLabel` → `title` → `path` の順)。

`useCurrentRoute()` は 404 のとき `undefined` を返す。動的ルートを開いているときに親を
アクティブにしたいなら `current?.path.startsWith("/sales")` のように前方一致で判定する。

## URL 状態:`useSearchParam` の値は常に string、既定値はURLから消える

- TanStack は `?year=2024` を数値としてパースするが、`useSearchParam` は必ず `string` に戻す
  (数値が欲しければ自分で `Number(...)`)。配列やオブジェクトは `useSearchState` を使う。
- **デフォルト値または `null` を書き込むとキーが URL から消える**。「明示的に既定値を選んだ」
  状態を URL に残すことはできない。
- 履歴は既定で `replace`。戻るボタンで1手ずつ戻したいときだけ `{ replace: false }`。

## API 呼び出し:`useApiQuery` のエラーは `ApiError`

`(q.error as Error)` のキャストは要らない。`q.error` は `ApiError | null` で、`message` には
サーバーが `HttpError` で明示したメッセージが入る(それ以外は汎用のステータス文言)。
`status`・`body`・`requestId` も持つ。クエリキーは `["api", url]` なので、
`invalidateQueries({ queryKey: ["api"] })` で API 由来のキャッシュを一括で捨てられる。

## API:見せたいエラーは `HttpError` を throw する

```ts
import { HttpError } from "@squadbase/vantage/server"
throw new HttpError(404, "Not found")   // → クライアントに 404 + message
throw new Error("boom")                 // → ログに出て汎用 500 に丸められる
```

`instanceof HttpError` は dev の module realm 跨ぎで壊れることがある。ライブラリ側の判定は
`isHttpError` を使う設計。アプリ側は素直に `throw new HttpError(...)` すればよい。

## 設定ファイル:作った時点で `vantage check` がエラーにする

以下はすべて禁止(`FORBIDDEN_FILE`)。Vantage が所有しているので置かない:

- `vite.config.*` — Vite 設定は Vantage が所有
- `tailwind.config.*` — テーマは `styles.css` のトークンで調整
- `postcss.config.*` — Vantage が管理
- `components.json` — shadcn CLI は使わない。UI は `@squadbase/vantage/ui` から import する
- `vantage.config.*` — v1 に設定ファイルは無い(規約で表現)

## Markdown:`MarkdownRenderer` は `@squadbase/vantage/markdown` から

Markdown 描画は専用サブパスに隔離されている(Shiki の全言語文法を引き込むため)。
`components/` から import しない。使うアプリだけが `@squadbase/vantage/markdown` から取り込む。

## テーブル:`ColumnDef<Row>[]` を明示的に注釈する

```tsx
import { type ColumnDef } from "@squadbase/vantage/components"
const columns: ColumnDef<Row>[] = [ … ]   // 注釈しないと accessorKey が string に広がり弾かれる
```

## 生成物:`.vantage/` と `dist/` は触らない

どちらも gitignore 済みの生成物。編集しても次のコマンドで上書きされる。`.vantage/` は任意の CLI
コマンド、または `vantage upgrade` で再生成される。
