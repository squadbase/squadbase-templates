---
name: vantage-pitfalls
description: Vantage(@squadbase/vantage)アプリを書くときに静かに壊れる落とし穴のリファレンス。Base UI は Radix ではない(asChild 無し・render プロップ)、SelectValue は value を描く、クライアントから server/ を import しない、EChart はテーマ非追従、相対 import は .js 指定子、動的パラメータの3綴り同期、PUBLIC_ env、HttpError など。Vantage の UI コンポーネントやルーティングが思った通りに動かないとき、ビルドやスタイルが静かに欠落するときに参照する。
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

### `SelectValue` は「選択中の value」を描く。`SelectItem` の children は見ない

値とラベルが違うと、トリガーに `kanto` や `/sales` といった**生の値**が出てしまう。ラベルを
出したいときは `items`(value→label のマップ)を渡す:

```tsx
<Select items={{ kanto: "関東", kansai: "関西" }} … />
```

`FilterBarSelect` / `AppShell` の header variant / `DataTablePagination` は内部でこの `items` を
組み立てている。自前で `Select` を使うときは忘れやすい。

## チャート:`EChart` はテーマに自動追従しない

`EChart` は薄いラッパー(init/resize/dispose・loading・`onEvents`・PNG コピー/ダウンロードだけ)。
配色は**各アプリが `option.color`** で決める(または `theme` に echarts テーマを渡す)。

- `--chart-1..5` を読んで明暗テーマを自動で組む機構は**意図的に無い**(ECharts はキャンバス
  描画で CSS 変数を読めない)。ダークモード追従が要るなら自前で色を切り替える。
- キャンバス系なので、コンテナに高さを与えないと何も見えない。

## 境界:クライアントから `server/` を import しない

- クライアント側のどのファイルも `server/` 配下を import してはいけない(`CLIENT_IMPORTS_SERVER`
  エラー。静的にもビルド時にも弾かれる)。**共有したいコードは `lib/` に置く。**
- シークレット等の env は `ApiContext.env`(server/ 内)にだけ届く。クライアントには渡らない。

## env:クライアントに届くのは `PUBLIC_` 接頭辞だけ

- クライアントで読めるのは `import.meta.env.PUBLIC_*` と `MODE`/`DEV`/`PROD`/`SSR`/`BASE_URL` のみ。
  それ以外を `import.meta.env` で読むと `PUBLIC_ENV_MISUSE` 警告。
- `VITE_` 系の公開 API は無い。サーバーのシークレットは `ctx.env` で読む。

## import:相対 import はランタイムの `.js` 指定子で書く

ソースが `.tsx`/`.ts` でも、**モジュール間の相対 import は `.js`** と書く(ESM の Node 解決に必要):

```tsx
import { RevenueChart } from "./components/revenue-chart.js"  // ← .tsx ではなく .js
```

`@squadbase/vantage` のサブパス import はこの限りではない(`@squadbase/vantage/ui` 等)。

## ルーティング:動的パラメータは「3つの綴り」を同期させる

ズレると静かにマッチしなくなる:

- ファイル `sales/[customerId].tsx`
- 表示ルート `/sales/:customerId`
- リンク `to="/sales/$customerId"` + `params={{ customerId }}` / 取り出し `useParams().customerId`

## ページ:`definePage` の値はリテラルで書く

title/description は**ビルド時に静的抽出**される。変数・関数呼び出し・テンプレート補間を使うと
抽出できない。`export const page = definePage({ title: "…" })` の右辺はリテラルにする。
なお `page` エクスポートはランタイムでは読まれない(抽出専用)。

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
- `components.json` — UI は `vantage add ui <name>` でコピー
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
